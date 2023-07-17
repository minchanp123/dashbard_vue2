<template>
  <div>
    <b-container id="content" style="padding: 30px">
      <b-row>
        <b-col>
          <h2>시황 모니터링</h2>
        </b-col>
      </b-row>

      <b-row style="padding-top: 30px;">
        <b-col xl="2">
          <b-form-select v-model="material2" :options="material_list2" v-on:change="setMaterial2"></b-form-select>
        </b-col>
      </b-row>

      <b-row style="padding-top: 30px;">
        <b-col xl="12" class="mb-5 mb-xl-0">
          <all-price-detail-table v-bind:status3="status3" />
        </b-col>
      </b-row>

      <b-row style="font-size:19px; padding-top: 30px;">
        <b-col>
          <h2>원자재 시황</h2>
        </b-col>
      </b-row>

      <b-row style="padding-top: 30px;">
        <b-col xl="2">
          <b-form-select v-model="material" :options="material_list"></b-form-select>
        </b-col>
        <b-col xl="2">
          <b-input type="date" value="시작 날짜" v-model="startDate"></b-input>
        </b-col>
        <b-col xl=0 align-self="center">
          <span>~</span>
        </b-col>
        <b-col xl="2">
          <b-input type="date" value="종료 날짜" v-model="endDate" :min="startDate" :max="this.getToday()"></b-input>
        </b-col>
        <b-col xl="2">
          <b-button class="btn1" variant="primary" v-on:click="showChart">확인</b-button>
        </b-col>
      </b-row>

      <b-row style="padding-top: 30px;">
        <b-col xl="12" class="mb-5 mb-xl-0">

          <price-volume-chart v-show="volume_b1" v-bind:status1="status1"></price-volume-chart>
          <price-volume-chart2 v-show="volume_b2" v-bind:status1="status1"></price-volume-chart2>
        </b-col>
      </b-row>

      <b-row style="padding-top: 30px;">
        <b-col xl="2">
          <b-form-select v-model="date" :options="date_list"></b-form-select>
        </b-col>
        <b-col>
          <b-button class="btn1" variant="primary" v-on:click="searchDate">확인</b-button>
        </b-col>
        <b-col class="text-right">
          <b-button class="btn1" variant="primary" v-on:click="extractExcel">Excel 추출</b-button>
        </b-col>
      </b-row>

      <b-row style="padding-top: 30px;">
        <b-col xl="12" class="mb-5 mb-xl-0">
          <status-per-date-table v-bind:status2="status2" id='statusPerDateTable'></status-per-date-table>
        </b-col>
      </b-row>

    </b-container>
  </div>
</template>

<script>

// Components
import StatusPerDateTable from '../Tables/StatusPerDateTable.vue';
import AllPriceDetailTable from '../Tables/AllPriceDetailTable.vue';
import PriceVolumeChart from '../Charts/PriceVolumeChart.vue';
import PriceVolumeChart2 from '../Charts/PriceVolumeChart2.vue';

import * as XLSX from 'xlsx';
import axios from 'axios';
import dayjs from 'dayjs';

export default {
  components: {
    StatusPerDateTable,
    AllPriceDetailTable,
    PriceVolumeChart,
    PriceVolumeChart2
  },
  data() {
    return {

      volume_b1: true,
      volume_b2: false,

      material: 'NI',
      material_list: [
        { value: 'CU', text: '구리' },
        { value: 'AL', text: '알루미늄' },
        { value: 'NI', text: '니켈' },
        { value: 'PP', text: 'PP' },
        { value: 'PC', text: 'PC' },
        { value: 'HR', text: '열연코일' },
      ],

      material2: '석유화학',
      material_list2: [
        { value: '석유화학', text: '석유화학' },
        { value: '강재', text: '강재' },
        { value: '비철금속', text: '비철금속' },
        { value: '경제지표', text: '경제지표' },
      ],

      startDate: this.getOneMonth(),
      endDate: this.getToday(),

      date: 'd1',
      date_list: [
        { value: 'd1', text: '일별' },
        { value: 'd2', text: '월별' },
        { value: 'd3', text: '분기별' },
        { value: 'd4', text: '연도별' },
      ],
      frequency: 'f1',
      frequency_list: [
        { value: "f1", text: "단기" },
        { value: "f2", text: "중기" },
        { value: "f3", text: "장기" }
      ],

      status1: {
        material: '',
        material2: '',
        date: '',
        startDate: '',
        endDate: '',
      },
      status2: {
        material: '',
        date: '',
      },
      status3: {
        material2: '',
      },
    }
  },
  mounted() {
    this.status1.material = this.material;
    this.status3.material2 = this.material2;
    this.status2.material = this.material;
    this.status2.date = this.date;
    this.status1.startDate = this.startDate;
    this.status1.endDate = this.endDate;
  },
  methods: {
    keywordMonitoring: function () {
      this.$router.push({ name: 'chart3' });
    },
    predictPrice: function () {
      this.$router.push({ name: 'chart2' });
    },
    searchDate: function () {
      if (this.status2.date != this.date) {
        this.status2.date = this.date;
      }
    },
    setMaterial2: function () {
      this.status3.material2 = this.material2;
    },
    extractExcel: async function () {

      this.status1.material = this.material;
      this.status1.startDate = this.startDate;
      this.status1.endDate = this.endDate;

      let date;

      let dataKey = ['_id', 'price', 'variation', 'variation_price', 'stock'];
      let header = ['날짜', '가격', '변동가격', '변동율', '재고량'];
      if (this.status1.material == 'PP') {
        header[4] = '거래량';
      } else if (this.status1.material == 'PC' || this.status1.material == 'HR') {
        dataKey.pop();
        header.pop();
      }

      if (this.date == 'd1') {
        date = '일별';
      } else if (this.date == 'd2') {
        date = '월별';
      } else if (this.date == 'd3') {
        date = '분기별';
      } else {
        date = '연도별';
      }

      await axios.get('/material2/real_price_trend/toExcel', { params: { material: this.status1.material, startDate: this.status1.startDate, endDate: this.status1.endDate, date: this.status2.date } })
        .then((res) => {
          return res['data'];
        })
        .then((data) => {

          if (this.date == 'd3') {
            for (var i of data) {
              i._id = i._id + "분기";
            }
          }

          // key값 변경
          for (var i of data) {
            for (var [index, j] of dataKey.entries()) {
              Object.defineProperty(
                i,
                header[index],
                Object.getOwnPropertyDescriptor(i, j)
              );
              delete i[j];
            }
          }

          let workBook = XLSX.utils.book_new();
          let workSheet = XLSX.utils.json_to_sheet(data, { raw: true, type: 'string' });

          XLSX.utils.book_append_sheet(workBook, workSheet, '원자재 시황');
          XLSX.writeFile(workBook, `원자재 시황_${this.material}_${date}.xlsx`);

        });

    },
    // 한달 전 날짜 가져오는 함수
    getOneMonth: function () {
      let prevOneMonth = new dayjs().subtract(1, 'month').format('YYYY-MM-DD');
      return prevOneMonth;
    },

    // 오늘 날짜 가져오는 함수
    getToday: function () {
      let now = new dayjs().format('YYYY-MM-DD');
      return now;
    },
    showChart: function () {
      if (this.status1.material != this.material) {
        this.status1.material = this.material;
      }

      this.status1.material = this.material;
      this.status2.material = this.material;
      this.status1.startDate = this.startDate;
      this.status1.endDate = this.endDate;

      if (this.status1.material == "CU" || this.status1.material == "NI" || this.status1.material == "AL" || this.status1.material == "PP") {
        this.volume_b1 = true;
        this.volume_b2 = false;
      } else {
        this.volume_b1 = false;
        this.volume_b2 = true;
      }
    },
    dateChart: function () {
      this.status.price_trend_material = this.material;
      this.status.frequency = this.frequency;
    },
    fetchList: function () {
      this.status1.material = this.material;
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.up {
  color: red;
}

.equal {
  color: black;
}

.down {
  color: blue;
}

.chart1_header {
  display: flex;
  height: 52px;
}

.h1_header1 {
  color: #b5b4ff;
  font-size: 22px;
  line-height: 50px;

}

.h1_header2 {
  color: white;
  font-size: 22px;
  line-height: 50px;

}

.btn1 {
  border-width: 0px;
  background-color: #5e72e4;
}

.hidden_header {
  display: none;
}

.table1 {
  border-collapse: collapse;
  border-radius: 0.375rem;
}

#title2 {
  font-size: 17px;
  font-weight: 500;
}
</style>
