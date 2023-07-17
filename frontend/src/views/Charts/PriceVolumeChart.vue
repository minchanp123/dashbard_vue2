<template>
  <card v-if="this.status1.material == 'CU' || this.status1.material == 'NI' || this.status1.material == 'AL'"
    header-classes="bg-transparent">
    <b-row align-v="center" slot="header">
      <b-col xl="10">
        <h6 class="text-uppercase text-muted ls-1 mb-1"></h6>
        <span id="title2">가격, 재고량</span>
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
    <h4 class="text-right" id="source">출처 : LME</h4>
  </card>

  <card v-else-if="this.status1.material == 'PP'" header-classes="bg-transparent">
    <b-row align-v="center" slot="header">
      <b-col xl="10">
        <h6 class="text-uppercase text-muted ls-1 mb-1"></h6>
        <span id="title2">가격, 선물 거래량</span>
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
    <h4 class="text-right" id="source">가격 : 극동아시아 현물</h4>
    <h4 class="text-right" id="source">거래량 : 인베스팅 PP선물 거래량</h4>
  </card>
</template>

<script>
import axios from 'axios';

export default {
  name: 'price-volume-chart',
  props: ["status1"],

  data() {
    return {
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

      this.series = []
      this.chartOptions = {}

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
          let label = {
            formatter: function (val) {
              if (val != null) {
                return val.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            }
          }
          if (this.status1.material == "CU" || this.status1.material == "NI" || this.status1.material == "AL") {
            this.series = [{
              name: '재고량',
              type: 'column',
              data: []
            }, {
              name: '가격',
              type: 'line',
              data: []
            }]

            this.chartOptions = {
              chart: {
                toolbar: {
                  show: true,
                  offsetY: -10,
                },
                height: 350,
                type: 'line',

              },
              colors: ["#008ffb", "#00e396", "#FF4560"],
              stroke: {
                width: [0, 4, 4],
                curve: 'smooth',
                colors: ["#008ffb", "#00e396", "#FF4560"]
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
                  seriesName: "재고량",
                  labels: label
                },
                {
                  opposite: true,
                  seriesName: "가격",
                  labels: label
                },
                {
                  show: false,
                  seriesName: "가격",
                  labels: label
                }

              ],
            }
            for (var json of data) {
              this.series[0].data.push(json.stock);
              this.series[1].data.push(json.price);

              if (json.price != "" && json.price != undefined) {
                this.chartOptions.labels.push(json.datetime.split("T")[0]);
              }
            }

          } else if (this.status1.material == "PP") { //PP
            this.series = [{
              name: '선물거래량',
              type: 'column',
              data: []
            }, {
              name: '가격',
              type: 'line',
              data: []
            }]

            this.chartOptions = {
              chart: {
                toolbar: {
                  show: true,
                  offsetY: -10,
                },
                height: 350,
                type: 'line',
              },
              colors: ["#008ffb", "#00e396", "#FF4560"],
              stroke: {
                width: [0, 4, 4],
                curve: 'smooth',
                colors: ["#008ffb", "#00e396", "#FF4560"]
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
                  seriesName: "선물거래량",
                  labels: label
                },
                {
                  opposite: true,
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
              this.series[0].data.push(parseFloat(json.stock).toFixed(2));
              this.series[1].data.push(parseFloat(json.price).toFixed(2));

              if (json.price != "" && json.price != undefined) {
                this.chartOptions.labels.push(json.datetime.split("T")[0]);
              }
            }
          }
          var sum = 0;
          var json_avg = {

            name: '가격 평균',
            type: 'line',
            data: []

          }

          for (var data of this.series[1].data) {
            sum += parseFloat(data);
          }

          var avg = (sum / this.series[1].data.length).toFixed(0);
          for (var i of this.series[1].data) {
            json_avg.data.push(avg);
          }
          this.series.push(json_avg);
        });

    },
    showAvg: async function () { //가격평균 이벤트
      if (this.series.length < 3) {
        if (this.status1.material !== "PP") { //CU AL NI

          this.chartOptions.stroke.width.push(4);
          this.chartOptions.stroke.colors.push("#FF4560");

          this.chartOptions.yaxis = [
            {
              seriesName: "재고량",
            },
            {
              opposite: true,
              seriesName: "가격",
            },
            {
              show: false,
              seriesName: "가격",
            }

          ]
        } else {

          this.chartOptions.stroke.width.push(4);
          this.chartOptions.stroke.colors.push("#FF4560");
          this.chartOptions.yaxis = [
            {
              seriesName: "선물거래량",
            },
            {
              opposite: true,
              seriesName: "가격",
            },
            {
              show: false,
              seriesName: "가격",
            }

          ]
        }

        var sum = 0;
        var json_avg = {

          name: '가격 평균',
          type: 'line',
          data: []

        }

        for (var data of this.series[1].data) {
          sum += parseFloat(data);
        }

        var avg = (sum / this.series[1].data.length).toFixed(0);
        for (var i of this.series[1].data) {
          json_avg.data.push(avg);
        }

        this.series.push(json_avg);

      } else {
        this.series.pop(); //series 가격 평균 json 제거
        this.chartOptions.yaxis.pop(); //가격 평균 세로축 제거
        this.chartOptions.stroke.width.pop();
        this.chartOptions.stroke.colors.pop();
      }

    },
  },
  updated() {
    this.avgHidden();
  }
}
</script>
