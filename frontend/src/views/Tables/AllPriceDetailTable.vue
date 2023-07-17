<template>
  <b-card class="text-center" body-class="p-0" header-class="border-0" style="border-top: 0px;" align-self="center">
    <b-table-simple style="table-layout: fixed;">
      <b-thead>
        <b-tr style="background-color: #f6f9fc;">
          <b-th id="th_header1">품목</b-th>
          <b-th id="th_header1" style="width: 30vh;">기준</b-th>
          <b-th id="th_header1">단위</b-th>
          <b-th id="th_header1">전년평균<br><span id="th_header3">({{ this.prevYear }})</span></b-th>
          <b-th id="th_header1">전분기평균<br><span id="th_header3">({{ this.prevQuarter }})</span></b-th>
          <b-th id="th_header1">전월평균<br><span id="th_header3">({{ this.prevMonth }})</span></b-th>
          <b-th id="th_header1">현황</b-th>
          <b-th id="th_header2">전년<br>대비</b-th>
          <b-th id="th_header2">전분기<br>대비</b-th>
          <b-th id="th_header2">전월<br>대비</b-th>
          <b-th id="th_header1">기준일</b-th>
        </b-tr>
      </b-thead>

      <b-tbody>
        <b-tr v-for="(item, index) in tableData" :key="index" style="font-size: 14px;">
          <b-td style="vertical-align: middle;">{{ item.material }}</b-td>
          <b-td style="vertical-align: middle;">{{ item.source }}</b-td>
          <b-td style="vertical-align: middle;">{{ item.unit }}</b-td>
          <b-td style="vertical-align: middle;">{{ item.last_year_avg }}</b-td>
          <b-td style="vertical-align: middle;">{{ item.last_quarter_avg }}</b-td>
          <b-td style="vertical-align: middle;">{{ item.last_month_avg }}</b-td>
          <b-td style="vertical-align: middle;">{{ item.current }}</b-td>
          <b-td style="vertical-align: middle;">
            <span v-if="item.last_year_rate != null"
              v-bind:class="{ 'up': item.last_year_rate > 0, 'equal': item.last_year_rate == 0, 'down': item.last_year_rate < 0 }">
              {{ item.last_year_rate }}%
            </span>
          </b-td>
          <b-td style="vertical-align: middle;">
            <span v-if="item.last_quarter_rate != null"
              v-bind:class="{ 'up': item.last_quarter_rate > 0, 'equal': item.last_quarter_rate == 0, 'down': item.last_quarter_rate < 0 }">
              {{ item.last_quarter_rate }}%
            </span>
          </b-td>
          <b-td style="vertical-align: middle;">
            <span v-if="item.last_month_rate != null"
              v-bind:class="{ 'up': item.last_month_rate > 0, 'equal': item.last_month_rate == 0, 'down': item.last_month_rate < 0 }">
              {{ item.last_month_rate }}%
            </span>
          </b-td>
          <b-td v-if="(item.ref_date != null)" style="vertical-align: middle;">{{ item.ref_date }}<br>
            <span style="font-size:11px;">{{ item.frequency }}</span>
          </b-td>
          <b-td v-else></b-td>
        </b-tr>
      </b-tbody>
    </b-table-simple>
  </b-card>
</template>



<script>
import axios from 'axios';

export default {
  name: 'all-price-detail-table',
  props: ["status3"],
  data() {
    return {
      loading: true,
      material: '',
      tableData: [],
      tableLength: 0,

      prevYear: '',
      prevQuarter: '',
      prevMonth: '',
      nowMonth: '',
    }
  },
  watch: {
    status3: {
      handler() {
        this.takeTableData();
        this.initTableData();
      },
      deep: true,
    }
  },

  mounted() {
    this.takeTableData();
    this.initTableData();
    this.getPrev();
  },
  methods: {
    takeTableData: async function () {

      this.material = this.status3.material2;

      this.materialDivision(this.material);

      this.tableData = [];

      axios.get('/material2/real_price_trend_today/monitoring_conditions', { params: { material: this.material } })
        .then((res) => {
          return res['data'];
        })
        .then((data) => {
          let keys = ['last_year_avg', 'last_quarter_avg', 'last_month_avg', 'current', 'ref_date'];

          for (var i of data) {
            if (i.current !== null) {
              if (this.material == '경제지표') {
                i.current = parseFloat(i.current).toFixed(2);
              } else if (this.material == '석유화학') {
                if (i > 2) {
                  i.current = parseFloat(i.current).toFixed(2);
                }
              } else {
                i.current = parseFloat(i.current).toFixed(0);
              }
            }

            for (var j of keys) {
              if (i[j] != null && j != "ref_date") {
                i[j] = i[j].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              } else {
                if (i[j] != null) {
                  i[j] = i[j].split("T")[0];
                }
              }
            }

          }
          this.tableData = data;
        });

    },
    getPrev: function () {
      let now = new Date();
      let nowYear = (now.getFullYear().toString()).slice(-2);
      this.prevYear = ((now.getFullYear() - 1).toString()).slice(-2) + "년";

      let nowMonth = now.getMonth() + 1;
      this.prevMonth = (nowMonth - 1);

      if (nowMonth == 1) {
        this.prevMonth = this.prevYear + " " + "12월";
      } else {
        this.prevMonth = nowYear + "년 " + this.prevMonth + "월";
      }

      if (nowMonth > 0 && nowMonth < 4) {
        // 현재: 1분기
        this.prevQuarter = this.prevYear + ' 4분기';
      } else if (nowMonth > 3 && nowMonth < 7) {
        // 현재: 2분기
        this.prevQuarter = nowYear + '년 1분기';
      } else if (nowMonth > 6 && nowMonth < 10) {
        // 현재: 3분기
        this.prevQuarter = nowYear + '년 2분기';
      } else {
        // 현재: 4분기
        this.prevQuarter = nowYear + '년 3분기';
      }

      this.nowMonth = nowYear + "." + nowMonth + "월 현황";

    },

    materialDivision: function (material) {
      if (material == '석유화학') {
        this.division = this.석유화학;
        this.tableLength = 7;
      } else if (material == '강재') {
        this.division = this.강재;
        this.tableLength = 3;
      } else if (material == '비철금속') {
        this.division = this.비철금속;
        this.tableLength = 3;
      } else {
        this.division = this.경제지표;
        this.tableLength = 4;
      }
    },

    initTableData: function () {
      this.tableData.length = this.tableLength;
      for (var i = 0; i < this.tableLength; i++) {
        this.tableData[i] = new Array(10);
        this.tableData[i].fill('ㅤ');
      }
    }
  },
}
</script>

<style>
.centerStyle {
  text-align: center;
}

.rightStyle {
  text-align: right;
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

#th_header1 {
  font-size: 14px;
  font-weight: 500;
  vertical-align: middle;
}

#th_header2 {
  font-size: 14px;
  font-weight: 500;
}

#th_header3 {
  font-size: 12px;
  font-weight: 300;
}
</style>
