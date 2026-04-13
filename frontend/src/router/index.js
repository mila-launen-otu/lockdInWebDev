import {createRouter, createWebHistory} from 'vue-router'

import Chat from '../views/Chat.vue'
import Grades from '../views/Grades.vue'
import Questions from '../views/Questions.vue'
import Whiteboard from '../views/Whiteboard.vue'

const routes = [
    { path: '/chat', component: Chat },
    { path: '/grades', component: Grades },
    { path: '/questions', component: Questions },
    { path: '/whiteboard', component: Whiteboard }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router