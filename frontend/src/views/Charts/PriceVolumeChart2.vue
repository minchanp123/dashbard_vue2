<template>
  <card v-if="this.status1.material == 'PC' || this.status1.material == 'HR'" header-classes="bg-transparent">
    <b-row align-v="center" slot="header">
      <b-col xl="10">
        <h6 class="text-uppercase text-muted ls-1 mb-1"></h6>
        <span id="title2">가격</span>
      </b-col>
      <b-col xl="2">
      </b-col>
    </b-row>
    <b-row class="row no-gutters">
      <b-col xl="0" id="card-body-col">
        <h4 class="text-left" id="source" style="writing-mode: vertical-lr; transform: rotate(180deg);">usd/ton</h4>
      </b-col>
      <b-col xl="11">
        <apexchart ref="volume_chart" type="line" height="350" :options="chartOptions" :series="series"></apexchart>
      </b-col>
      <b-col xl="0" id="card-body-col">
        <h4 class="text-left" id="source" style="writing-mode: vertical-lr; transform: rotate(180deg);">ton</h4>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p class="text-right" id="source"> *거래량 그래프 미표기</p>
      </b-col>
    </b-row>
  </card>
</template>

<script>
import axios from 'axios';

export default {
  name: 'price-volume-chart2',
  props: ["status1"],

  data() {
    return {
      chartHeader: null,
      series: [],
      chartOptions: {},

    }
  },
  watch: {
    status1: {
      handler() {
        this.takeChartData();
      },
      deep: true,
    }
  },
  mounted() {
  },
  methods: {
    avgHidden: function () {
      this.$refs.volume_chart.toggleSeries('가격 평균');
    },
    takeChartData: async function () {
      let label = {
        formatter: function (val) {
          if (val != null) {
            return val.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        }
      }
      this.series = [];
      this.chartOptions = {};
      if (this.status1.material == "PC" || this.status1.material == "HR") {

        var req = {
          params: {
            material: this.status1.material,
            startDate: this.status1.startDate,
            endDate: this.status1.endDate,
          }
        }
        axios.get('/material2/real_price_trend/price_volume_chart', req)
          .then((res) => {
            let result = res['data'];
            return result;
          })
          .then((data) => {

            this.series = [{
              name: '가격',
              data: []
            }],
              this.chartOptions = {
                chart: {
                  toolbar: {
                    show: true,
                    offsetY: -10,
                  },
                  height: 350,
                  type: 'line',
                },
                colors: ["#00e396", "#FF4560"],
                stroke: {
                  colors: ["#00e396", "#FF4560"]
                },
                labels: [],
                xaxis: {
                  labels: {
                    rotate: 0
                  },
                  categories: [],
                  tickAmount: 10,
                },
                yaxis: [
                  {
                    seriesName: "가격",
                    labels: label
                  },
                  {
                    show: false,
                    seriesName: "가격",
                    labels: label
                  },

                ]
              }

            for (var json of data) {
              this.series[0].data.push(json.price);
              if (json.price != "" && json.price != undefined) {
                this.chartOptions.xaxis.categories.push(json.datetime.split("T")[0]);
              }
            }

            var sum = 0;
            var json_avg = {

              name: '가격 평균',
              type: 'line',
              data: []

            }

            for (var data of this.series[0].data) {
              sum += parseFloat(data);
            }

            var avg = (sum / this.series[0].data.length).toFixed(0);
            for (var i of this.series[0].data) {
              json_avg.data.push(avg);
            }

            this.series.push(json_avg);
          })
      }
    },
    showAvg: async function () { //가격평균 이벤트
      if (this.series.length < 2) {
        this.chartOptions.stroke.colors.push("#FF4560");
        var sum = 0;
        var json_avg = {

          name: '가격 평균',
          type: 'line',
          data: []

        }

        for (var data of this.series[0].data) {
          sum += parseFloat(data);
        }

        var avg = (sum / this.series[0].data.length).toFixed(0);
        for (var i of this.series[0].data) {
          json_avg.data.push(avg);
        }

        this.series.push(json_avg);

      } else {
        this.series.pop(); //series 가격 평균 json 제거
        this.chartOptions.stroke.colors.pop();
      }

    },
  },
  updated() {
    this.avgHidden();
  }
}
</script>
