<!-- 
 
cd lockdInWebDev/backend
node server.js

cd lockdInWebDev/frontend
npm run dev 

OPTION + C to stop servers
-->

<script setup>
import { computed, reactive, ref, onMounted, nextTick } from 'vue'
import axios from 'axios'
import * as d3 from 'd3'
import { userState } from './state/user'

const classNameInput = ref('')
const newLetterInput = ref('')
const classCounter = ref(1)
const assignmentCounter = ref(1)
const scaleRowCounter = ref(1)
const csvGrades = reactive({
  loaded: false,
  loading: false,
  error: ''
})
const backendBaseUrl = 'http://localhost:3000'
const classChartContainers = reactive({})

const getCurrentUsername = () => {
  return String(userState.username || localStorage.getItem('username') || '').trim()
}

const currentUsername = computed(() => getCurrentUsername() || 'Not logged in')

const createAssignment = (assignment = {}) => ({
  id: assignment.id || `assignment-${assignmentCounter.value++}`,
  title: assignment.title ?? '',
  score: assignment.score ?? '',
  weight: assignment.weight ?? '0'
})

const createClass = (name = '', sourceName = null, assignments = []) => ({
  id: `class-${classCounter.value++}`,
  name,
  sourceName,
  assignments: assignments.length > 0 ? assignments.map((assignment) => createAssignment(assignment)) : [createAssignment()],
  savedChart: null,
  error: ''
})

const student = reactive({
  name: 'Current Student',
  classes: []
})

const createScaleRow = (letter, min, points) => ({
  id: `scale-${scaleRowCounter.value++}`,
  letter,
  min,
  points
})

const gpaScale = reactive([
  createScaleRow('A+', '90', '4.3'),
  createScaleRow('A', '85', '4.0'),
  createScaleRow('A-', '80', '3.7'),
  createScaleRow('B+', '77', '3.3'),
  createScaleRow('B', '73', '3.0'),
  createScaleRow('B-', '70', '2.7'),
  createScaleRow('C+', '67', '2.3'),
  createScaleRow('C', '60', '2.0'),
  createScaleRow('D', '50', '1.0'),
  createScaleRow('F', '0', '0.0'),
])

const appliedGpaScale = reactive([])

const gpaScaleError = ref('')
const gpaScaleSavedMessage = ref('')

const getGradeSortParts = (value) => {
  const normalized = String(value || '').trim().toUpperCase()
  const match = normalized.match(/^([A-Z])([+-]?)$/)

  if (!match) {
    return {
      letter: normalized,
      baseRank: Number.MAX_SAFE_INTEGER,
      modifierRank: Number.MAX_SAFE_INTEGER
    }
  }

  const base = match[1]
  const modifier = match[2]
  const baseRank = base.charCodeAt(0) - 65
  const modifierRank = modifier === '+' ? 0 : modifier === '' ? 1 : 2

  return {
    letter: normalized,
    baseRank,
    modifierRank
  }
}

const sortGpaScaleByGradeOrder = () => {
  gpaScale.sort((a, b) => {
    const aParts = getGradeSortParts(a.letter)
    const bParts = getGradeSortParts(b.letter)

    if (aParts.baseRank !== bParts.baseRank) {
      return aParts.baseRank - bParts.baseRank
    }

    if (aParts.modifierRank !== bParts.modifierRank) {
      return aParts.modifierRank - bParts.modifierRank
    }

    return aParts.letter.localeCompare(bParts.letter)
  })
}

sortGpaScaleByGradeOrder()

const cloneScaleRows = (rows) => rows.map((row) => ({
  letter: String(row.letter || '').trim().toUpperCase(),
  min: Number(row.min),
  points: Number(row.points)
}))

const replaceAppliedGpaScale = (rows) => {
  const cloned = cloneScaleRows(rows)
  appliedGpaScale.splice(0, appliedGpaScale.length, ...cloned)
}

replaceAppliedGpaScale(gpaScale)

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const validateGpaScale = () => {
  gpaScaleError.value = ''
  const letterSet = new Set()

  for (const row of gpaScale) {
    const normalizedLetter = String(row.letter || '').trim().toUpperCase()
    if (!normalizedLetter) {
      gpaScaleError.value = 'Each GPA row needs a letter.'
      return false
    }

    if (letterSet.has(normalizedLetter)) {
      gpaScaleError.value = `Duplicate letter found: ${normalizedLetter}.`
      return false
    }

    row.letter = normalizedLetter
    letterSet.add(normalizedLetter)

    const min = toNumber(row.min)
    const points = toNumber(row.points)

    if (min === null || min < 0 || min > 100) {
      gpaScaleError.value = `Invalid minimum percent for ${row.letter}. Use 0 to 100.`
      return false
    }

    if (points === null || points < 0) {
      gpaScaleError.value = `Invalid GPA points for ${row.letter}. Use 0 or higher.`
      return false
    }
  }

  return true
}

const getScaleSorted = (rows) =>
  [...rows]
    .map((row) => ({
      letter: row.letter,
      min: Number(row.min),
      points: Number(row.points)
    }))
    .sort((a, b) => b.min - a.min)

const getLetterForPercent = (percent) => {
  const sortedScale = getScaleSorted(appliedGpaScale)
  const hit = sortedScale.find((row) => percent >= row.min)
  return hit ? hit.letter : sortedScale[sortedScale.length - 1].letter
}

const getPointsForLetter = (letter) => {
  const found = appliedGpaScale.find((row) => row.letter === letter)
  return found ? Number(found.points) : 0
}

const saveGpaScale = () => {
  if (!validateGpaScale()) {
    gpaScaleSavedMessage.value = ''
    return
  }

  sortGpaScaleByGradeOrder()
  replaceAppliedGpaScale(gpaScale)
  gpaScaleSavedMessage.value = 'GPA settings saved. Charts and GPA values now use the new scale.'
  renderSavedClassCharts()
}

const addGpaLetter = () => {
  gpaScaleError.value = ''
  const letter = String(newLetterInput.value || '').trim().toUpperCase()

  if (!letter) {
    gpaScaleError.value = 'Enter a letter before adding.'
    return
  }

  const exists = gpaScale.some((row) => row.letter === letter)
  if (exists) {
    gpaScaleError.value = `Letter ${letter} already exists.`
    return
  }

  gpaScale.push(createScaleRow(letter, '0', '0'))
  sortGpaScaleByGradeOrder()
  newLetterInput.value = ''
}

const sortScaleAfterEdit = () => {
  sortGpaScaleByGradeOrder()
}

const getSavedClassResult = (course) => {
  if (!course.savedChart) {
    return null
  }

  const percent = course.savedChart.weightedPercent
  const letter = getLetterForPercent(percent)
  const gpaPoints = getPointsForLetter(letter)

  return {
    percent,
    letter,
    gpaPoints
  }
}

const overallGpa = computed(() => {
  const saved = student.classes
    .map((course) => getSavedClassResult(course))
    .filter((item) => item !== null)

  if (!saved.length) {
    return 0
  }

  const total = saved.reduce((sum, item) => sum + item.gpaPoints, 0)
  return total / saved.length
})

const parseCsvLine = (line) => {
  const values = []
  let currentValue = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextCharacter = line[index + 1]

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        currentValue += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (character === ',' && !inQuotes) {
      values.push(currentValue)
      currentValue = ''
      continue
    }

    currentValue += character
  }

  values.push(currentValue)
  return values
}

const parseGradesCsv = (csvText) => {
  const rows = String(csvText || '')
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)

  if (!rows.length) {
    return {
      headers: [],
      rows: []
    }
  }

  const headers = parseCsvLine(rows[0]).map((header) => header.trim())
  const data = rows.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const row = {}

    headers.forEach((header, index) => {
      row[header] = (values[index] || '').trim()
    })

    return row
  })

  return {
    headers,
    rows: data
  }
}

const setClassChartContainer = (courseId, element) => {
  if (element) {
    classChartContainers[courseId] = element
    return
  }

  delete classChartContainers[courseId]
}

const buildCourseChart = (course) => {
  const className = String(course.name || '').trim()

  if (!className) {
    return {
      error: 'Class name is required before saving.',
      savedChart: null,
      className: ''
    }
  }

  const chartRows = []
  let weightedSum = 0
  let totalWeight = 0

  for (const assignment of course.assignments) {
    const title = String(assignment.title || '').trim()
    const score = toNumber(assignment.score)
    const weight = toNumber(assignment.weight)

    if (!title) {
      return {
        error: 'Each assignment must have a name before saving.',
        savedChart: null,
        className
      }
    }

    if (score === null || score < 0 || score > 100) {
      return {
        error: `Assignment "${title}" needs a score from 0 to 100.`,
        savedChart: null,
        className
      }
    }

    if (weight === null || weight < 0) {
      return {
        error: `Assignment "${title}" needs a valid weight (>= 0).`,
        savedChart: null,
        className
      }
    }

    chartRows.push({
      title,
      score,
      weight,
      percent: score,
      weightedContribution: (score * weight) / 100
    })

    weightedSum += score * weight
    totalWeight += weight
  }

  // Prevent saving invalid class configurations above 100% total weight.
  if (totalWeight > 100) {
    return {
      error: `Total class weight is ${totalWeight.toFixed(2)}%. It must be 100% or less.`,
      savedChart: null,
      className
    }
  }

  const weightedPercent = totalWeight > 0 ? weightedSum / totalWeight : 0

  return {
    error: '',
    className,
    savedChart: {
      rows: chartRows,
      totalWeight,
      weightedPercent
    }
  }
}

const resetClassCounters = () => {
  classCounter.value = 1
  assignmentCounter.value = 1
}

const applyLoadedClasses = (rows, hasWeightColumn) => {
  resetClassCounters()
  const groupedClasses = new Map()

  for (const row of rows) {
    const className = String(row.class || '').trim() || 'Untitled Class'
    const assignmentTitle = String(row.assignment || '').trim()
    const score = String(row.score || '').trim()
    const weight = hasWeightColumn ? String(row.weight || '').trim() : ''

    if (!groupedClasses.has(className)) {
      groupedClasses.set(className, [])
    }

    groupedClasses.get(className).push({
      title: assignmentTitle,
      score,
      weight
    })
  }

  const loadedClasses = []

  for (const [className, assignments] of groupedClasses.entries()) {
    const normalizedAssignments = assignments.map((assignment) => ({
      title: assignment.title,
      score: assignment.score,
      weight: assignment.weight
    }))

    if (!hasWeightColumn) {
      const evenWeight = normalizedAssignments.length > 0 ? (100 / normalizedAssignments.length).toFixed(2) : '0'
      normalizedAssignments.forEach((assignment) => {
        assignment.weight = evenWeight
      })
    }

    const course = createClass(className, className, normalizedAssignments)
    const chartResult = buildCourseChart(course)

    course.error = chartResult.error
    course.savedChart = chartResult.savedChart
    loadedClasses.push(course)
  }

  student.classes.splice(0, student.classes.length, ...loadedClasses)
}

const renderClassGradeChart = (course, container) => {
  if (!container || !course.savedChart) {
    return
  }

  d3.select(container).selectAll('*').remove()

  const chartRows = course.savedChart.rows

  if (!chartRows.length) {
    return
  }

  const margin = { top: 24, right: 18, bottom: 72, left: 48 }
  const outerWidth = Math.max(container.clientWidth || 0, 280)
  const outerHeight = 280
  const width = Math.max(outerWidth - margin.left - margin.right, 120)
  const height = Math.max(outerHeight - margin.top - margin.bottom, 120)

  const svg = d3.select(container)
    .append('svg')
    .attr('width', outerWidth)
    .attr('height', outerHeight)
    .attr('viewBox', `0 0 ${outerWidth} ${outerHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('display', 'block')
    .style('width', '100%')
    .style('height', 'auto')
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const xScale = d3.scaleBand()
    .domain(chartRows.map((row) => row.title))
    .range([0, width])
    .padding(0.15)

  const yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0])

  svg.selectAll('rect')
    .data(chartRows)
    .enter()
    .append('rect')
    .attr('x', (row) => xScale(row.title))
    .attr('y', (row) => yScale(row.percent))
    .attr('width', xScale.bandwidth())
    .attr('height', (row) => height - yScale(row.percent))
    .attr('fill', '#3498db')

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll('text')
    .attr('transform', 'rotate(-35)')
    .style('text-anchor', 'end')
    .style('font-size', '11px')

  svg.append('g')
    .call(d3.axisLeft(yScale))

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - (height / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Percent')
}

const renderSavedClassCharts = async () => {
  await nextTick()

  for (const course of student.classes) {
    const container = classChartContainers[course.id]

    if (!container) {
      continue
    }

    renderClassGradeChart(course, container)
  }
}

const loadGradesFromCsv = async () => {
  csvGrades.loading = true
  csvGrades.error = ''

  try {
    const username = getCurrentUsername()

    if (!username) {
      csvGrades.error = 'Enter a username before loading grades.'
      return
    }

    const response = await axios.get(`${backendBaseUrl}/grades.csv`, {
      responseType: 'text'
    })

    const parsed = parseGradesCsv(response.data)
    const userRows = parsed.rows.filter((row) => String(row.username || '').trim() === username)

    applyLoadedClasses(userRows, parsed.headers.includes('weight'))
    csvGrades.loaded = true
    await renderSavedClassCharts()
  } catch (error) {
    csvGrades.error = `Failed to load CSV: ${error.message}`
  } finally {
    csvGrades.loading = false
  }
}

const saveCourseToCsv = async (course) => {
  const username = getCurrentUsername()
  const currentName = String(course.name || '').trim()
  const originalName = String(course.sourceName || currentName).trim()

  await axios.post(`${backendBaseUrl}/api/grades`, {
    username,
    originalName,
    className: currentName,
    assignments: course.savedChart.rows.map((assignment) => ({
      title: assignment.title,
      score: assignment.score,
      weight: assignment.weight
    }))
  })

  course.sourceName = currentName
}

const getPerformanceBand = (score) => {
  if (score >= 90) {
    return 'A'
  }

  if (score >= 80) {
    return 'B'
  }

  if (score >= 70) {
    return 'C'
  }

  if (score >= 60) {
    return 'D'
  }

  return 'F'
}

const getClassDistribution = () => {
  const distribution = {}

  for (const course of student.classes) {
    const className = String(course.name || '').trim() || 'Untitled Class'
    distribution[className] = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0
    }

    for (const assignment of course.assignments) {
      const score = toNumber(assignment.score)

      if (score === null) {
        continue
      }

      distribution[className][getPerformanceBand(score)] += 1
    }
  }

  return distribution
}

const renderD3GradeDistribution = () => {
  if (!d3ChartContainer.value) {
    return
  }

  const distribution = getClassDistribution()
  const classes = Object.keys(distribution)

  d3.select(d3ChartContainer.value).selectAll('*').remove()

  if (!classes.length) {
    return
  }

  const chartData = []
  for (const className of classes) {
    for (const grade of ['A', 'B', 'C', 'D', 'F']) {
      chartData.push({
        class: className,
        grade,
        count: distribution[className][grade]
      })
    }
  }

  const margin = { top: 24, right: 24, bottom: 90, left: 56 }
  const width = 900 - margin.left - margin.right
  const height = 380 - margin.top - margin.bottom

  const svg = d3.select(d3ChartContainer.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const xScale = d3.scaleBand()
    .domain(chartData.map((datum) => `${datum.class} - ${datum.grade}`))
    .range([0, width])
    .padding(0.12)

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(chartData, (datum) => datum.count) + 1])
    .range([height, 0])

  const colorScale = d3.scaleOrdinal()
    .domain(['A', 'B', 'C', 'D', 'F'])
    .range(['#2ecc71', '#3498db', '#f39c12', '#e67e22', '#e74c3c'])

  svg.selectAll('rect')
    .data(chartData)
    .enter()
    .append('rect')
    .attr('x', (datum) => xScale(`${datum.class} - ${datum.grade}`))
    .attr('y', (datum) => yScale(datum.count))
    .attr('width', xScale.bandwidth())
    .attr('height', (datum) => height - yScale(datum.count))
    .attr('fill', (datum) => colorScale(datum.grade))

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .style('font-size', '11px')

  svg.append('g')
    .call(d3.axisLeft(yScale))

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - (height / 2))
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Count of Assignments')

  svg.append('text')
    .attr('x', width / 2)
    .attr('y', -8)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .text('Grade Distribution by Class')
}

const addClass = () => {
  const name = classNameInput.value.trim()
  student.classes.push(createClass(name || `Class ${classCounter.value}`))
  classNameInput.value = ''
}

const addAssignment = (courseIndex) => {
  student.classes[courseIndex].assignments.push(createAssignment())
  student.classes[courseIndex].savedChart = null
}

const removeAssignment = (courseIndex, assignmentIndex) => {
  const course = student.classes[courseIndex]
  course.assignments.splice(assignmentIndex, 1)
  if (!course.assignments.length) {
    course.assignments.push(createAssignment())
  }
  course.savedChart = null
}

const saveClass = async (courseIndex) => {
  const course = student.classes[courseIndex]
  const result = buildCourseChart(course)

  course.error = result.error
  course.savedChart = result.savedChart

  if (result.error) {
    return
  }

  course.name = result.className

  try {
    await saveCourseToCsv(course)
    csvGrades.loaded = true
    await renderSavedClassCharts()
  } catch (error) {
    course.error = `Unable to save CSV: ${error.message}`
  }
}

onMounted(() => {
  loadGradesFromCsv()
})
</script>

<template>
  <main class="grades-page">
    <div class="glass-panel top-summary">
    <h1>Grades</h1>
    <p>Showing grades for: {{ currentUsername }}</p>
    <p>Overall GPA: {{ overallGpa.toFixed(2) }}</p>

    <p v-if="csvGrades.loading">Loading grades from CSV...</p>
    <p v-if="csvGrades.error" class="error-text">{{ csvGrades.error }}</p>
  </div>

  <hr>

  <div class="glass-panel">
    <h2>GPA Weighting Options</h2>
    <p>Modify the GPA points and letter cutoffs below. These settings will apply to all classes.</p>

    <p>
      <label for="new-gpa-letter">Add Letter Grade: </label>
      <input id="new-gpa-letter" v-model="newLetterInput" type="text" maxlength="3" placeholder="e.g. A">
      <button type="button" @click="addGpaLetter">Add Letter</button>
    </p>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>Grade</th>
          <th>Minimum Percentage</th>
          <th>GPA Points</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in gpaScale" :key="row.id">
          <td>
            <input v-model="row.letter" type="text" maxlength="3" @blur="sortScaleAfterEdit">
          </td>
          <td>
            <input v-model="row.min" type="number" min="0" max="100" step="0.01">
          </td>
          <td>
            <input v-model="row.points" type="number" min="0" step="0.01">
          </td>
        </tr>
      </tbody>
    </table>
    
    <p class="button-row">
      <button type="button" @click="saveGpaScale">Save GPA Weighting Settings</button>
    </p>

    <p v-if="gpaScaleError" class="error-text">{{ gpaScaleError }}</p>
    <p v-if="gpaScaleSavedMessage" class="success-text">{{ gpaScaleSavedMessage }}</p>
  </div>

    <div class="glass-panel add-class-row">
      <label for="new-class-name">Add New Class: </label>
      <input id="new-class-name" v-model="classNameInput" type="text" placeholder="e.g. Web Dev">
      <button type="button" @click="addClass">Add New Class</button>
    </div>

    <hr>

    <section 
      v-for="(course, courseIndex) in student.classes" 
      :key="course.id" 
      class="class-card glass-panel"
>
      <h2>
        Class:
        <input v-model="course.name" type="text" placeholder="Class Name">
      </h2>

      <table border="1" cellpadding="6" cellspacing="0">
        <thead>
          <tr>
            <th>Assignment</th>
            <th>Score</th>
            <th>Weight (%)</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(assignment, assignmentIndex) in course.assignments" :key="assignment.id">
            <td>
              <input v-model="assignment.title" type="text" placeholder="Assignment name">
            </td>
            <td>
              <input v-model="assignment.score" type="number" min="0" max="100" step="0.01" placeholder="0-100">
            </td>
            <td>
              <input v-model="assignment.weight" type="number" min="0" step="0.01" placeholder="0">
            </td>
            <td>
              <button type="button" @click="removeAssignment(courseIndex, assignmentIndex)">Remove</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="button-row">
        <button type="button" @click="addAssignment(courseIndex)">Add Assignment</button>
        <button type="button" @click="saveClass(courseIndex)">Save</button>
      </div>

      <p v-if="course.error" class="error-text">{{ course.error }}</p>

      <div v-if="course.savedChart">
        <h3>{{ course.name || 'Untitled Class' }} Chart</h3>
        <p>
          Letter Grade: {{ getSavedClassResult(course)?.letter }} |
          GPA Points: {{ getSavedClassResult(course)?.gpaPoints.toFixed(2) }}
        </p>
        <p>
          Weighted Grade: {{ course.savedChart.weightedPercent.toFixed(2) }}%
        </p>
        <p>Total Class Weight: {{ course.savedChart.totalWeight.toFixed(2) }}%</p>

        <div :ref="(element) => setClassChartContainer(course.id, element)"></div>
      </div>

      <p v-else class="empty-text">Click Save to generate this class chart.</p>

      <hr>
    </section>
  </main>
</template>

<style scoped>
.grades-page {
  min-height: 100vh;
  padding: 3.5rem 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.glass-panel {
  position: relative;
  padding: 1.5rem;
  margin-bottom: 25px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.28);
}

.glass-panel::before {
  content: "";
  position: absolute;
  inset: -2px;
  z-index: -1;
  border-radius: 24px;
  background:
    radial-gradient(circle at 20% 20%, rgba(124, 77, 255, 0.28), transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(46, 196, 182, 0.22), transparent 40%);
  filter: blur(22px);
}

h1,
h2,
h3 {
  margin: 0 0 0.75rem 0;
  color: white;
}

p,
label {
  color: rgba(255, 255, 255, 0.82);
}

hr {
  border: none;
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 0;
}

.button-row {
  margin-top: 20px;
  display: flex;
  gap: 20px; 
}

.add-class-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 1rem;
}

.add-class-row label {
  font-size: 1rem;
  font-weight: 500;
}

.add-class-row input {
  font-size: 0.95rem;
}

.add-class-row button {
  font-size: 0.95rem;
}

.top-summary {
  text-align: center;
}

.top-summary p {
  margin-top: 0.5rem;
}

input {
  padding: 0.8rem 0.95rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
  color: white;
  outline: none;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.55);
}

input:focus {
  border-color: #7c4dff;
  box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.18);
}

button {
  border: none;
  padding: 0.8rem 1.1rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  background: #7c4dff;
  color: white;
  transition: 0.2s ease;
}

button:hover {
  background: #6a3df0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

th,
td {
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.85rem;
  text-align: left;
  color: white;
}

th {
  background: rgba(124, 77, 255, 0.16);
  font-weight: 700;
}

tr:nth-child(even) td {
  background: rgba(255, 255, 255, 0.03);
}

.class-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.error-text {
  color: #ff8c8c;
}

.success-text {
  color: #7ff0c8;
}

.empty-text {
  color: rgba(255, 255, 255, 0.65);
}

progress {
  width: 100%;
  height: 14px;
}

@media (max-width: 768px) {
  .grades-page {
    padding: 2rem 1rem 1rem;
  }

  .glass-panel {
    padding: 1rem;
  }

  table {
    display: block;
    overflow-x: auto;
  }

  input,
  button {
    width: 100%;
  }
}
</style>