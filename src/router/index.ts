import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/yanzhouzhengfu/'),
  routes: [
    {
      path: '/',
      component: () => import('@/views/layout/index.vue'),
      redirect: '/login',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '首页', icon: 'House' }
        },
        {
          path: 'user',
          name: 'User',
          component: () => import('@/views/user/index.vue'),
          meta: { title: '用户管理', icon: 'User' }
        },
        {
          path: 'device',
          name: 'Device',
          component: () => import('@/views/device/index.vue'),
          meta: { title: '设备管理', icon: 'Monitor' }
        },
        {
          path: 'resource',
          name: 'Resource',
          component: () => import('@/views/resource/index.vue'),
          meta: { title: '资源管理', icon: 'Connection' }
        },
        {
          path: 'data',
          name: 'Data',
          component: () => import('@/views/data/index.vue'),
          meta: { title: '数据服务', icon: 'DataLine' }
        },
        {
          path: 'monitor',
          name: 'Monitor',
          component: () => import('@/views/monitor/index.vue'),
          meta: { title: '监控告警', icon: 'Warning' }
        }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue')
    }
  ]
})

export default router 