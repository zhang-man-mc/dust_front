import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/layout',
      name: 'home',
      meta: { title: '首页' },
      component: () => import('@/components/layout/AppLayout.vue'),
      children: [
        // 数据风险模型
        {
          path: '/avgDay',
          name: 'avgDay',
          meta: { title: '数据风险模型', keepAlive: false },
          component: () => import('@/views/risk_assessment/DataRiskModel.vue')
        },

        //  数据指标排名
        {
          path: '/analysis',
          name: 'analysis',
          meta: { title: '数据指标排名', keepAlive: true },
          component: () => import('@/views/risk_assessment/DataIndexRank.vue')
        },

        //  数据风险排名
        {
          path: '/riskrank',
          name: 'riskrank',
          meta: { title: '数据风险排名', keepAlive: true },
          component: () => import('@/views/risk_assessment/DataRiskRank.vue')
        },

        // 飞行巡检
        {
          path: '/edata',
          name: 'edata',
          meta: { title: '飞行巡检', keepAlive: true },
          component: () => import('@/views/exception/FlightInspection.vue')
        },

        //  站点审核辅助
        {
          path: '/testData',
          name: 'testData',
          meta: { title: '站点审核辅助', keepAlive: true },
          component: () => import('@/views/exception/SiteAuditAssistance.vue')
        },
        
        // 历史数据
        {
          path: '/hdata',
          name: 'hdata',
          meta: { title: '历史数据管理', keepAlive: true },
          component: () => import('@/views/data_management/HistoryData.vue')
        },
        //  数据接入管理
        {
          path: '/management',
          name: 'management',
          meta: { title: '数据接入管理' },
          component: () => import('@/views/data_management/DataAccessManagement.vue')
        },

        //  参数配置
        {
          path: '/config',
          name: 'config',
          meta: { title: '参数配置' },
          component: () => import('@/views/data_management/ParameterConfiguration.vue')
        },

        //  数据接入配置
        {
          path: '/setting',
          name: 'setting',
          meta: { title: '数据接入配置' },
          component: () => import('@/views/setting/SetConfiguration.vue')
        },

        // 审核辅助嵌入过渡页面
        {
          path: '/AuditDetail/:beginTime/:endTime/:exceptionType',
          name: 'siteAuditDetail',
          meta: { title: '异常审核具体信息', transition: 'slide-left' },
          component: () => import('@/views/exception/components/exceptionDetail.vue')
        },

        // 审核辅助嵌入
        {
          path: '/SubSiteAudit',
          name: 'SubSiteAudit',
          meta: { title: '审核辅助嵌入' },
          component: () => import('@/views/exception/components/SubSiteAudit.vue')
        },

        // 异常详情嵌入过渡页面
        {
          path: '/exceptionDetail/:siteName/:time/:timeType/:jumpPage',
          name: 'exceptionDetail',
          meta: { title: '异常具体信息', transition: 'slide-left' },
          component: () => import('@/views/risk_assessment/components/SiteDetail.vue')
        },

        // 异常详情嵌入
        {
          path: '/CompFlightInspection',
          name: 'CompFlightInspection',
          meta: { title: '异常详情嵌入' },
          component: () => import('@/views/exception/components/CompFlightInspection.vue')
        }
      ]
    },

    // 登陆页面
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/LoginSystem.vue')
    },
    {
      path: '/',
      redirect: '/edata'
    }
  ]
})

export default router
