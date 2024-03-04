// Composables
import { createRouter, createWebHistory } from 'vue-router'


const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        // route level code-splitting
        // this generates a separate chunk (Home-[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import('@/views/Home.vue'),
      },
      {
        path: '/tickets',
        name: 'Tickets',
        component: () => import('@/views/Tickets.vue'),
      },
      {
        path: '/tickets/:id',
        name: 'TicketDetail',
        component: () => import('@/views/TicketDetail.vue'),
      },

      {
        path: '/Tastatur',
        name: 'Tastaturbelegung',
        component: () => import('@/views/Tastatur.vue'),
      },

      {
        path: '/Regeln',
        name: 'Regeln',
        component: () => import('@/views/Regeln.vue'),
      },
      {
        path: '/user',
        name: 'User',
        component: () => import('@/views/User.vue'),
       
      },
      {
        path: '/Whitelist',
        name: 'Whitelist',
        component: () => import('@/views/Whitelist.vue'),
       
      },
      {
        path: '/:catchAll(.*)',
        redirect: '/',
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})


export default router
