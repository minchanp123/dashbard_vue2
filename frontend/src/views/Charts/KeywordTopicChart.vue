<template>
  <apexchart type="line" height="400" :options="chartOptions" :series="series"></apexchart>
</template>

<script>
import axios from 'axios';
import EventBus from '../EventBus';

export default {
  name: 'KeywordTopicChart',
  props: ["status"],
  data() {
    return {
      path: './dao/select_keyword_topic',
      series: [],
      chartOptions: {},
      topic: '',
      prevTopic: '',
      item: '',
      material: '',
      startDate: '',
      endDate: '',
      searchOptions: {
        material: '',
        startDate: '',
        endDate: '',
        topic: '',
      },
      searchOptions2: {
        material: '',
        startDate: '',
        endDate: '',
        topic: '',
      },
    }
  },
  watch: {
    searchOptions: {
      handler() {
        this.keywordTopic();
      },
      deep: true,
    },
    searchOptions2: {
      handler() {
        this.keywordTopic();
      },
      deep: true,
    },
    status: {
      handler() {
        this.showChart();
      },
      deep: true,
    }
  },
  mouted() {
    this.setTopic();
    this.setTopicReport();
    this.setTopicCompany();
  },
  methods: {
    showChart: async function () {
      if (this.status.item == 'news') {
        this.path = '/monitoring1/topic/keyword_topic'
      } else if (this.status.item == 'report') {
        this.path = '/monitoring1/topic_report/keyword_topic_report'
      } else if (this.status.item == 'company') {
        this.path = '/monitoring2/topic_company/keyword_topic_company'
      }
      await axios.get(this.path,
        {
          params:
          {
            material: this.status.material,
            startDate: this.status.startDate,
            endDate: this.status.endDate
          }
        }).then((res) => {
          return res['data'];
        }).then((data) => {
          this.series = data;
          if (data.length == 0) {
            return;
          }
          let label = {
            formatter: function (val) {
              if (val != null) {
                return val.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            }
          };
          let yaxisData = [];
          this.dateArr = data[0].datetime;
          for (let i of data) {
            let obj = {};
            obj.seriesName = data[0].name;
            obj.show = false;
            obj.labels = label;
            if (i.name == '가격') {
              obj.opposite = true;
              obj.seriesName = i.name;
              obj.show = true;
              obj.labels = label;
            }
            yaxisData.push(obj);
          }
          yaxisData[0].show = true;
          this.dateArr = data[0].datetime;
          this.chartOptions = {
            chart: {
              toolbar: {
                show: true,
                offsetY: -10,
              },
              height: 400,
              type: 'line',
            },
            stroke: {
              curve: 'smooth'
            },
            colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#66DA26', '#EE82EE'],
            labels: data[0].datetime,
            xaxis: {
              labels: {
                rotate: 0
              },
              tickAmount: 11,
            },
            yaxis: yaxisData,
          }
        });
      this.setTopic();
      this.setTopicReport();
      this.setTopicCompany();
    },
    // 화제어 클릭 시, 원래 있던 그래프에 화제어 데이터 추가
    // 화제어가 이미 있다면 기존 화제어는 삭제 후,
    // 클릭한 화제어 데이터를 보여준다
    keywordTopic: async function () {

      await axios.get('/monitoring1/topic/keyword_frequency',
        {
          params:
          {
            material: this.material,
            startDate: this.startDate,
            endDate: this.endDate,
            keyword: this.topic,
            item: this.status.item,
            date: this.dateArr

          }
        }).then((res) => {
          return res['data'];
        }).then((data) => {
          let seriesLength = this.series.length - 1;

          if (this.status.item == 'news' || this.status.item == 'report') {
            if (data[0].name.includes('화제어') && this.topic == '') {
              this.series.pop();
            } else if (data[0].name.includes('화제어') && data[0].name != `${this.prevTopic}(화제어)` && this.series[seriesLength].name == '가격') {
              this.series.push(data[0]);
            } else if (data[0].name.includes('화제어') && data[0].name != `${this.prevTopic}(화제어)` && this.series[seriesLength].name != '가격') {
              this.series.pop();
              this.series.push(data[0]);
            }

            this.prevTopic = this.topic;
          } else if (this.status.item == 'company') {
            if (data[0].name.includes('화제어') && this.topic == '') {
              this.series.pop();
            } else if (data[0].name.includes('화제어') && data[0].name != `${this.prevTopic}(화제어)` && this.series[seriesLength].name == '환경') {
              this.series.push(data[0]);
            } else if (data[0].name.includes('화제어') && data[0].name != `${this.prevTopic}(화제어)` && this.series[seriesLength].name != '환경') {
              this.series.pop();
              this.series.push(data[0]);
            }

            this.prevTopic = this.topic;
          }
          if (data.length == 0) {
            return;
          }

        });
    },
    setTopic() {
      EventBus.$on('topic', (res) => {
        this.searchOptions = res;
        this.item = this.status.item;
        this.startDate = res.startDate;
        this.endDate = res.endDate;
        this.material = res.material;
        this.topic = res.topic;
      });
    },

    setTopicReport() {
      EventBus.$on('topic_report', (res) => {
        this.searchOptions2 = res;
        this.item = this.status.item;
        this.startDate = res.startDate;
        this.endDate = res.endDate;
        this.material = res.material;
        this.topic = res.topic;
      });
    },
    setTopicCompany() {
      EventBus.$on('setCompanyTopic', (res) => {
        this.searchOptions = res;
        this.startDate = res.startDate;
        this.endDate = res.endDate;
        this.material = res.material;
        this.topic = res.topic;
      });
    },
  }
}
</script>
