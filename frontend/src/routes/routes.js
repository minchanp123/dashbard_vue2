import DashboardLayout from '@/views/Layout/DashboardLayout.vue';

const routes = [
  {
    path: '/',
    redirect: 'main',
    component: DashboardLayout,
    children: [
      {
        path: '/main', //종합상황판
        name: 'main',
        props: true,
        component: () => import(/* webpackChunkName: "demo" */ '../views/mobis/main.vue')
      },
      {
        path: '/materialMarket1',  //원자재별 시황 - 시황예측
        name: 'materialMarket1',
        props: true,
        component: () => import(/* webpackChunkName: "demo" */ '../views/mobis/MaterialMarket1.vue')
      },
      {
        path: '/materialMarket2',  //원자재별 시황 - 시황 모니터링
        name: 'materialMarket2',
        component: () => import(/* webpackChunkName: "demo" */ '../views/mobis/MaterialMarket2.vue')
      },
      {
        path: '/keywordMonitoring1', //키워드 모니터링 - 원자재
        name: 'keywordMonitoring1',
        component: () => import(/* webpackChunkName: "demo" */ '../views/mobis/KeywordMonitoring1.vue')
      },
      {
        path: '/keywordMonitoring2', //키워드 모니터링 - 협력사
        name: 'keywordMonitoring2',
        component: () => import(/* webpackChunkName: "demo" */ '../views/mobis/KeywordMonitoring2.vue')
      }
    ]
  },
];

export default routes;
