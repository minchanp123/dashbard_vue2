/*!

=========================================================
* BootstrapVue Argon Dashboard - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/bootstrap-vue-argon-dashboard
* Copyright 2020 Creative Tim (https://www.creative-tim.com)

* Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Vue from 'vue';
import DashboardPlugin from './plugins/dashboard-plugin';
import App from './App.vue';
import Chartkick from "vue-chartkick";
import Chart from "chart.js";
import HighchartsVue from 'highcharts-vue';
import Highcharts from 'highcharts';
import loadWordCloud from 'highcharts/modules/wordcloud';
import VueApexCharts from 'vue-apexcharts'

// router setup
import router from './routes/router';
import axios from 'axios';

// plugin setup
Vue.use(DashboardPlugin);
Vue.use(VueApexCharts);
loadWordCloud(Highcharts);
Vue.prototype.$http = axios;
Vue.use(Chartkick.use(Chart));
Vue.use(HighchartsVue);
Vue.component('apexchart', VueApexCharts);
Vue.config.silent = true

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router
});
