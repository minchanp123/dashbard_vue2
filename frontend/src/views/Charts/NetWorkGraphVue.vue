<template>
  <card ref="netWorkHeight" style="height: 100%; width: 100%;">
    <b-row style="vertical-align: middle; ">
      <b-col xl="8" class="text-left">
        <span style="vertical-align: middle; font-size: 25px; font-weight: 800; padding-right: 20px;">{{ this.material }}</span>
        <b-button v-if="frequency == 'f1'" id="btn2" variant="primary">1일</b-button>
        <b-button v-else id="btn2" style="background-color: white; color: mediumslateblue;" data-id="f1"
          v-on:click="btnFrequency">1일</b-button>
        <b-button v-if="frequency == 'f2'" id="btn2" variant="primary">7일</b-button>
        <b-button v-else id="btn2" style="background-color: white; color: mediumslateblue;" data-id="f2"
          v-on:click="btnFrequency">7일</b-button>
        <b-button v-if="frequency == 'f3'" id="btn2" variant="primary">30일</b-button>
        <b-button v-else id="btn2" style="background-color: white; color: mediumslateblue;" data-id="f3"
          v-on:click="btnFrequency">30일</b-button>
      </b-col>
      <b-col xl="4" class="text-right">기간 : {{ this.startDate }} ~ {{ this.endDate }}</b-col>
    </b-row>
    <v-chart v-if="(this.option.series[0].links.length > 0)" :align="center" :option="option"></v-chart>
    <b-row align-v="center" v-else style="height:90%;">
      <b-col class="text-center"><span>"해당 기간 내 자료가 없습니다."</span></b-col>
    </b-row>
  </card>
</template>

<script>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { GraphChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import axios from 'axios';
import dayjs from 'dayjs';

use([
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GraphChart
]);

export default {

  name: 'NetWorkGraphVue',
  props: ["status"],
  components: {
    VChart
  },
  data() {
    return {
      arr: [],
      material: '',
      startDate: this.getToday(),
      endDate: this.getToday(),
      graphHeight: null,
      frequency: 'f1',
      option: {
        title: {
          text: '',
        },
        tooltip: {
        },
        legend: {
          bottom: '40%',
          right: '5%',
          orient: 'vertical',
          itemGap: 20,
          data: [],
        },
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            type: 'graph',
            layout: 'force',
            force: {
              initLayout: 'circular',
              layoutAnimation: true,
              repulsion: 90, // 노드 사이의 반발 계수
            },
            zoom: 1.7,

            data: [],
            links: [],
            categories: [],
            roam: "move",
            label: {
              show: true,
              position: 'inside',
              fontSize: 13,
              formatter: '{b}'
            },
            lineStyle: {
              color: 'source',
            },
            emphasis: {
              focus: 'adjacency',
              lineStyle: {
                width: 10
              },
            },
          }
        ],
      },
    }
  },
  watch: {
    status: {
      handler() {
        this.showNetworkGraph();
      },
      deep: true,
    }
  },
  mounted() {
    // this.showNetworkGraph();
  },
  methods: {
    btnFrequency: async function (event) {
      this.frequency = event.target.getAttribute('data-id');
      this.endDate = this.getToday();
      if (this.frequency == 'f1') {
        this.startDate = this.getToday();
      } else if (this.frequency == 'f2') {
        this.startDate = this.getF2day();
      } else if (this.frequency == 'f3') {
        this.startDate = this.getF3day();
      }
      this.showNetworkGraph();
    },

    // 오늘 날짜 가져오는 함수
    getToday: function () {
      let now = new dayjs();
      now = now.subtract(1, 'day').format('YYYY-MM-DD');
      return now;
    },
    // 7일 전 날짜 가져오는 함수
    getF2day: function () {
      let date = new dayjs();
      date = date.subtract(8, 'day').format('YYYY-MM-DD');
      return date;
    },
    // 한달 전 날짜 가져오는 함수
    getF3day: function () {
      let date = new dayjs();
      date = date.subtract(1, 'month').subtract(1, 'day').format('YYYY-MM-DD');
      return date;
    },

    async showNetworkGraph() {
      if (this.status.material == 'CU') {
        this.material = 'Cu'
      } else if (this.status.material == 'AL') {
        this.material = 'Al'
      } else if (this.status.material == 'NI') {
        this.material = 'Ni'
      } else {
        this.material = this.status.material;
      }
      await axios.get("/monitoring1/network_graph/select_network_graph",
        {
          params:
          {
            material: this.status.material,
            frequency: this.frequency
          }
        })
        .then((res) => {
          let result = res['data'];
          return result;
        }).then((data) => {
          this.arr = [];
          if (data[1].length > 0) {
            for (var i = 1; i < data[0].length - 1; i++) {
              this.arr.push(data[0][i].name);
            }
            this.option.legend.data = this.arr;
            this.option.series[0].categories = data[0];
            this.option.series[0].data = data[1];
            this.option.series[0].links = data[2];
          }

        });
    },
  }
}
</script>
<style>
.echarts {
  width: 100%;
  min-height: auto;
  height: 90%;
}

#btn2 {
  padding: 5px 15px;
  font-size: 13px;
  font-weight: 50;
}
</style>
