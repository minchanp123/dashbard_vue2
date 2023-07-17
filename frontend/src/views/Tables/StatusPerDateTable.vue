<template>
  <b-card class="text-center" body-class="p-0" header-class="border-0" style="border-top: 0px;">
    <b-table-simple v-if="tableData[0] != undefined || tableData[0] != null" style="table-layout: fixed;">
      <b-thead>
        <b-tr style="background-color: #f6f9fc;">
          <b-th v-for="(key, index) in Object.keys(tableData[0]) " :key="index">
            <span v-if="(key == 'datetime' || key == '_id') && status2.date == 'd1'" id="th_header">일</span>
            <span v-else-if="key == '_id' && status2.date == 'd2'" id="th_header">월</span>
            <span v-else-if="key == '_id' && status2.date == 'd3'" id="th_header">분기</span>
            <span v-else-if="key == '_id' && status2.date == 'd4'" id="th_header">연도</span>
            <span v-else-if="key == 'price'" id="th_header">가격</span>
            <span v-else-if="key == 'variation'" id="th_header">변동가격</span>
            <span v-else-if="key == 'variation_price'" id="th_header">변동율</span>
            <span v-else-if="key == 'stock' && status2.material != 'PP'" id="th_header">재고량</span>
            <span v-else-if="key == 'stock' && status2.material == 'PP'" id="th_header">거래량</span>
          </b-th>
        </b-tr>
      </b-thead>

      <b-tbody>
        <b-tr v-for="(data, index01) in tableData" :key="index01">
          <b-td v-if="data._id.length == 6 && index01 != 6" id="td_header">{{ data._id }}분기</b-td>
          <b-td v-else-if="data._id.length != 6 && index01 != 6" id="td_header">{{ data._id }}</b-td>
          <b-td v-if="index01 != 6" id="td_header">{{ data.price.slice(0, -1) }}
            <span v-if="data.price != '--'">
              (<span v-bind:class="{ 'up': data.price.slice(-1) == '▲', 'equal': data.price.slice(-1) == '-', 'down': data.price.slice(-1) == '▼' }">
                {{ data.price.slice(-1) }}
              </span>)
            </span>
          </b-td>
          <b-td v-if="index01 != 6" id="td_header">
            {{ data.variation.slice(0, -1) }}
            <span v-if="data.variation != '--'">
              (<span v-bind:class="{ 'up': data.variation.slice(-1) == '▲', 'equal': data.variation.slice(-1) == '-', 'down': data.variation.slice(-1) == '▼' }">
                {{ data.variation.slice(-1) }}
              </span>)
            </span>
          </b-td>
          <b-td v-if="index01 != 6" id="td_header">
            {{ data.variation_price.slice(0, -1) }}%
            <span v-if="data.variation_price != '--'">
              (<span v-bind:class="{ 'up': data.variation_price.slice(-1) == '▲', 'equal': data.variation_price.slice(-1) == '-', 'down': data.variation_price.slice(-1) == '▼' }">
                {{ data.variation_price.slice(-1) }}
              </span>)
            </span>
          </b-td>
          <b-td v-if="index01 != 6 && data.stock != undefined" id="td_header">
            {{ data.stock.slice(0, -1) }}
            <span v-if="data.stock != '--'">
              (<span v-bind:class="{ 'up': data.stock.slice(-1) == '▲', 'equal': data.stock.slice(-1) == '-', 'down': data.stock.slice(-1) == '▼' }">
                {{ data.stock.slice(-1) }}
              </span>)
            </span>
          </b-td>
        </b-tr>
      </b-tbody>
    </b-table-simple>
  </b-card>
</template>

<script>
import axios from 'axios';

export default {
  name: 'status-per-date-table',
  props: ["status2"],
  data() {
    return {
      tableData: [],
    }
  },
  watch: {
    status2: {
      handler() {
        this.takeTableData();
      },
      deep: true,
    }
  },
  mounted() {
  },
  methods: {
    takeTableData: async function () {

      this.tableData = [];

      let dataKey = ['price', 'stock', 'variation', 'variation_price'];
      if (this.status2.material == 'PP') {
        dataKey = ['price', 'variation', 'variation_price', 'stock'];
      } else if (this.status2.material == 'PC' || this.status2.material == 'HR') {
        dataKey = ['price', 'variation', 'variation_price'];
      }

      // 'd1': 일별 조회
      if (this.status2.date == 'd1') {
        await axios.get('/material2/real_price_trend/select_day', { params: { material: this.status2.material } })
          .then((res) => {
            return res['data'];
          })
          .then((data) => {

            for (var i of data) {

              for (var j of dataKey) {
                if (i[j] != null || i[j] != undefined) {
                  i[j] = i[j].toFixed(2);
                }
              }
              this.tableData.push(i);
            }

            // 필드 별 status 구하기
            this.getStatus(this.tableData);

          })
      }
      // 'd2': 월별 조회
      else if (this.status2.date == 'd2') {
        await axios.get('/material2/real_price_trend/select_month', { params: { material: this.status2.material } })
          .then((res) => {
            return res['data'];
          })
          .then((data) => {

            for (var i = 0; i < data.length; i++) {
              for (var j = 0; j < dataKey.length; j++) {
                if (data[i][dataKey[j]] != null || data[i][dataKey[j]] != undefined) {
                  data[i][dataKey[j]] = (data[i][dataKey[j]]).toFixed(2);
                }
              }
              this.tableData.push(data[i]);
            }

            this.getStatus2(this.tableData);

          });
      }
      // 'd3': 분기별 조회
      else if (this.status2.date == 'd3') {
        await axios.get('/material2/real_price_trend/select_quarter', { params: { material: this.status2.material } })
          .then((res) => {
            return res['data'];
          })
          .then((data) => {

            for (var i = 0; i < data.length; i++) {
              for (var j = 0; j < dataKey.length; j++) {
                if (data[i][dataKey[j]] != null || data[i][dataKey[j]] != undefined) {
                  data[i][dataKey[j]] = (data[i][dataKey[j]]).toFixed(2);
                }
              }

              this.tableData.push(data[i]);
            }

            this.getStatus2(this.tableData);

          });
      }

      // 'd4': 연도별 조회
      else if (this.status2.date == 'd4') {
        await axios.get('/material2/real_price_trend/select_year', { params: { material: this.status2.material } })
          .then((res) => {
            return res['data'];
          })
          .then((data) => {

            for (var i = 0; i < data.length; i++) {
              for (var j = 0; j < dataKey.length; j++) {
                if (data[i][dataKey[j]] != null || data[i][dataKey[j]] != undefined) {
                  data[i][dataKey[j]] = (data[i][dataKey[j]]).toFixed(2);
                }
              }

              this.tableData.push(data[i]);
            }

            this.getStatus2(this.tableData);
          });
      }
    },

    getStatus: async function (tableData) {

      let dataKey = ['price', 'variation', 'variation_price', 'stock'];
      if (this.status2.material == 'PP') {
        dataKey = ['price', 'variation', 'variation_price', 'stock'];
      } else if (this.status2.material == 'PC' || this.status2.material == 'HR') {
        dataKey = ['price', 'variation', 'variation_price'];
      }

      for (var i = 0; i < tableData.length; i++) {
        if (typeof (tableData[i + 1]) != "undefined" || tableData[i + 1] != null) {

          for (var j = 0; j < dataKey.length; j++) {

            if (tableData[i][dataKey[j]] == null) {
              tableData[i][dataKey[j]] = '-';
            }

            if (dataKey[j] != 'stock') {
              if (parseFloat(tableData[i].price) > parseFloat(tableData[i + 1].price)) {
                tableData[i][dataKey[j]] += "▲";
              } else if ((parseFloat(tableData[i].price) < parseFloat(tableData[i + 1].price))) {
                tableData[i][dataKey[j]] += "▼";
              } else {
                tableData[i][dataKey[j]] += "-";
              }
            }
          }

          if (typeof (tableData[i + 1].stock) != 'undefined' && tableData[i + 1].stock != null) {
            if (parseFloat(tableData[i].stock) > parseFloat(tableData[i + 1].stock)) {
              tableData[i].stock += "▲";
            } else if ((parseFloat(tableData[i].stock) < parseFloat(tableData[i + 1].stock))) {
              tableData[i].stock += "▼";
            } else {
              tableData[i].stock += "-";
            }
          }

        } else {
          tableData[i][dataKey[j]] += "·";
        }

        if (j == 0) {
          tableData[i][dataKey[j]] = tableData[i][dataKey[j]].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

      }
    },
    getStatus2: async function (tableData) {

      let dataKey = ['price', 'variation', 'variation_price', 'stock'];
      if (this.status2.material == 'PP') {
        dataKey = ['price', 'variation', 'variation_price', 'stock'];
      } else if (this.status2.material == 'PC' || this.status2.material == 'HR') {
        dataKey = ['price', 'variation', 'variation_price'];
      }

      for (var i = 0; i < tableData.length; i++) {
        for (var j = 0; j < dataKey.length; j++) {
          if (typeof (tableData[i + 1]) != "undefined" || tableData[i + 1] != null) {

            if (tableData[i][dataKey[j]] == null) {
              tableData[i][dataKey[j]] = '-';
            }

            if (dataKey[j] == 'stock') {
              if (parseFloat(tableData[i]['stock']) > parseFloat(tableData[i + 1]['stock'])) {
                tableData[i]['stock'] += "▲";
              } else if (parseFloat(tableData[i]['stock']) < parseFloat(tableData[i + 1]['stock'])) {
                tableData[i]['stock'] += "▼";
              } else {
                tableData[i]['stock'] += "-";
              }
            }

            else {
              if (parseFloat(tableData[i]['variation']) > 0) {
                tableData[i][dataKey[j]] += "▲";
              } else if (parseFloat(tableData[i]['variation']) < 0) {
                tableData[i][dataKey[j]] += "▼";
              } else {
                tableData[i][dataKey[j]] += "-";
              }
            }

          } else {
            tableData[i][dataKey[j]] += "·";
          }
          if (j == 0) {
            tableData[i][dataKey[j]] = tableData[i][dataKey[j]].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          }
        }
      }
    }

  },
}
</script>

<style>
.up {
  color: red;
}

.equal {
  color: black;
}

.down {
  color: blue;
}

#th_header {
  font-size: 14px;
  font-weight: 500;
}

#td_header {
  font-size: 14px;
}
</style>
