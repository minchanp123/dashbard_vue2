<template>
  <apexchart ref="prediction_chart" type="line" height="300" :options="chartOptions" :series="series"></apexchart>
</template>

<script>
import axios from 'axios';

export default {
  name: 'MainPriceTrendChart',
  props: ["status"],
  data() {
    return {
      series: [],
      chartOptions: {},
      hidden: []
    }
  },
  watch: {
    status: {
      handler() {
        this.mainPriceTrend();
      },
      deep: true,
    }
  },
  methods: {
    // 다른 모델들은 초기에 보이지 않도록 설정한다.
    modelHidden: function () {
      for (let i of this.hidden) {
        this.$refs.prediction_chart.toggleSeries(i);
      }
    },
    mainPriceTrend: async function () {

      let frequency;

      if (this.status.frequency == 'f1') {
        frequency = '단기(1M)';
      } else if (this.status.frequency == 'f2') {
        frequency = '중기(3M)';
      } else {
        frequency = '장기(6M)';
      }

      axios.get("/main/price_prediction/chart",
        {
          params:
          {
            material: this.status.material,
            frequency: frequency
          }
        }).then((res) => {
          return res['data'];
        }).then((data) => {
          this.series = data;
          let dateArray = this.series[1].date;
          this.hidden = data[0].hidden;

          if (data.length == 0) {
            return;
          }
          this.chartOptions = {
            chart: {
              toolbar: {
                show: true,
                offsetY: -10,
                tools: {
                  download: true,
                },
                export: {
                  csv: {
                    filename: `가격동향_${this.status.material}_${frequency}`,
                    columnDelimiter: ',',
                    headerCategory: '날짜',
                    headerValue: dateArray,
                  },
                  svg: {
                    filename: `가격동향_${this.status.material}_${frequency}`,
                  },
                  png: {
                    filename: `가격동향_${this.status.material}_${frequency}`,
                  }
                },
              },
              height: 350,
              type: 'line',
            },
            colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#66DA26'],
            labels: data[0].date,
            xaxis: {
              labels: {
                rotate: 0
              },
              tickAmount: 11,
            },
            yaxis: {
              labels: {
                formatter: function (val) {
                  if (val != null) {
                    return val.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                }
              }
            },
          }
        });
    },
  },
  updated() {
    this.modelHidden();
  }
}

</script>
