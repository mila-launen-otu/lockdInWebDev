const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs/promises');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const gradesCsvPath = path.join(__dirname, 'public', 'grades.csv');
const usersCsvPath = path.join(__dirname, 'public', 'users.csv');

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

const io = new Server(server, {
  cors: {
    origin: '*'
  },
});

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

const escapeCsvValue = (value) => {
  const text = String(value ?? '')

  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

const parseGradesCsv = (csvText) => {
  const lines = String(csvText || '')
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)

  if (!lines.length) {
    return []
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim())

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const row = {}

    headers.forEach((header, index) => {
      row[header] = (values[index] || '').trim()
    })

    return row
  })
}

const readGradesCsv = async () => {
  try {
    const csvText = await fs.readFile(gradesCsvPath, 'utf8')
    return parseGradesCsv(csvText)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }

    throw error
  }
}

const parseUsersCsv = (csvText) => {
  const lines = String(csvText || '')
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)

  if (!lines.length) {
    return []
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim())
  const usernameIndex = headers.findIndex((header) => header === 'username')

  if (usernameIndex < 0) {
    return []
  }

  return lines.slice(1)
    .map((line) => parseCsvLine(line)[usernameIndex] || '')
    .map((username) => String(username || '').trim())
    .filter((username) => username.length > 0)
}

const writeUsersCsv = async (usernames) => {
  const uniqueUsernames = []
  const seen = new Set()

  for (const username of usernames) {
    const normalized = String(username || '').trim()

    if (!normalized || seen.has(normalized)) {
      continue
    }

    seen.add(normalized)
    uniqueUsernames.push(normalized)
  }

  const csvLines = ['username']
  for (const username of uniqueUsernames) {
    csvLines.push(escapeCsvValue(username))
  }

  await fs.writeFile(usersCsvPath, `${csvLines.join('\n')}\n`, 'utf8')
}

const readUsersCsv = async () => {
  try {
    const csvText = await fs.readFile(usersCsvPath, 'utf8')
    const usernames = parseUsersCsv(csvText)

    if (!usernames.length) {
      const defaults = ['demo', 'tester2']
      await writeUsersCsv(defaults)
      return defaults
    }

    return usernames
  } catch (error) {
    if (error.code === 'ENOENT') {
      const defaults = ['demo', 'tester2']
      await writeUsersCsv(defaults)
      return defaults
    }

    throw error
  }
}

const writeGradesCsv = async (rows) => {
  const groupedRows = new Map()

  for (const row of rows) {
    const username = String(row.username || '').trim()
    const className = String(row.class || '').trim()
    const groupKey = `${username}::${className}`

    if (!groupedRows.has(groupKey)) {
      groupedRows.set(groupKey, [])
    }

    groupedRows.get(groupKey).push({
      username,
      class: className,
      assignment: String(row.assignment || '').trim(),
      grade: String(row.grade || '').trim(),
      weight: String(row.weight || '').trim()
    })
  }

  const normalizedRows = []

  for (const classRows of groupedRows.values()) {
    const hasAnyWeight = classRows.some((row) => row.weight.length > 0)

    if (hasAnyWeight) {
      for (const row of classRows) {
        normalizedRows.push({
          ...row,
          weight: row.weight || '0'
        })
      }
      continue
    }

    const equalWeight = classRows.length > 0 ? (100 / classRows.length).toFixed(2) : '0'
    for (const row of classRows) {
      normalizedRows.push({
        ...row,
        weight: equalWeight
      })
    }
  }

  const csvLines = ['username,class,assignment,grade,weight']

  for (const row of normalizedRows) {
    csvLines.push([
      row.username,
      row.class,
      row.assignment,
      row.grade,
      row.weight
    ].map(escapeCsvValue).join(','))
  }

  await fs.writeFile(gradesCsvPath, `${csvLines.join('\n')}\n`, 'utf8')
}

app.post('/api/grades', async (req, res) => {
  try {
    const payload = req.body || {}
    const username = String(payload.username || '').trim()
    const currentName = String(payload.className || '').trim()
    const originalName = String(payload.originalName || currentName).trim()
    const assignments = Array.isArray(payload.assignments) ? payload.assignments : []

    if (!username) {
      return res.status(400).json({ message: 'Username is required.' })
    }

    if (!currentName) {
      return res.status(400).json({ message: 'Class name is required.' })
    }

    if (!assignments.length) {
      return res.status(400).json({ message: 'At least one assignment is required.' })
    }

    const existingRows = await readGradesCsv()
    const targetNames = new Set([originalName, currentName].filter((value) => value.length > 0))

    const filteredRows = existingRows.filter((row) => {
      const rowUsername = String(row.username || '').trim()
      const rowClassName = String(row.class || '').trim()
      return rowUsername !== username || !targetNames.has(rowClassName)
    })

    const nextRows = assignments.map((assignment) => ({
      username,
      class: currentName,
      assignment: String(assignment.title || '').trim(),
      grade: String(assignment.grade ?? '').trim(),
      weight: String(assignment.weight ?? '').trim()
    }))

    await writeGradesCsv([...filteredRows, ...nextRows])

    return res.json({
      success: true,
      className: currentName,
      rowsWritten: nextRows.length
    })
  } catch (error) {
    return res.status(500).json({ message: `Failed to save CSV: ${error.message}` })
  }
})

app.get('/api/users', async (_req, res) => {
  try {
    const usernames = await readUsersCsv()
    return res.json({ usernames })
  } catch (error) {
    return res.status(500).json({ message: `Failed to load users: ${error.message}` })
  }
})

app.post('/api/users', async (req, res) => {
  try {
    const username = String(req.body?.username || '').trim()

    if (!username) {
      return res.status(400).json({ message: 'Username is required.' })
    }

    const usernames = await readUsersCsv()
    const updated = usernames.includes(username) ? usernames : [...usernames, username]
    await writeUsersCsv(updated)

    return res.json({ success: true, username })
  } catch (error) {
    return res.status(500).json({ message: `Failed to save user: ${error.message}` })
  }
})

let whiteboardLines = [];

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  // Send existing lines to the new client
  socket.emit('load_whiteboard', whiteboardLines);

  socket.on('draw_line', (line) => {
    whiteboardLines.push(line);
    socket.broadcast.emit('draw_line', line);
  });

  socket.on('clear_whiteboard', () => {
    whiteboardLines = [];
    io.emit('clear_whiteboard');
  });


  socket.on('send_message', (data) => {
    console.log('Message received:', data);
    io.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });

  socket.on('send_messageQA', (data) => {
  console.log("QA: ",data.subject, data.question, data.answer, data.message, data.user)

  // data is already the full object, just broadcast it
  io.emit('receive_messageQA', data)


})
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});