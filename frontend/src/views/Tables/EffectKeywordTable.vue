<template>
  <b-card body-class="p-0" style="height: 100%; border-top: 0px;">
    <b-table-simple class="table1" style="table-layout: auto; border-top: none; border-bottom: none;">
      <b-thead>
        <b-tr style="background-color: #FFFAF0;">
          <b-th colspan="7" style="font-size:17px; font-weight:500;">영향 키워드 동향</b-th>
        </b-tr>
        <b-tr class="text-center" style="background-color: #f6f9fc;">
          <b-th style="width: 10%;" id="th_header">순위</b-th>
          <b-th id="th_header">Cu</b-th>
          <b-th id="th_header">AL</b-th>
          <b-th id="th_header">Ni</b-th>
          <b-th id="th_header">PP</b-th>
          <b-th id="th_header">PC</b-th>
          <b-th id="th_header">HR</b-th>
        </b-tr>
      </b-thead>
      <b-tbody>
        <b-tr class="text-center" v-for="(data, index01) in tableData" :key="index01">
          <b-td style="width: 10%;" id="th_header">{{ index01 + 1 }}</b-td>
          <b-td class="text-center" v-for="(key, index02) in Object.keys(data)" :key="index02">
            <sapn v-if="data[key] == null"></sapn>
            <sapn v-else>{{ data[key].topic }}</sapn>
          </b-td>
        </b-tr>
      </b-tbody>
    </b-table-simple>
  </b-card>
</template>

<script>
import axios from 'axios';

export default {
  name: 'effect-keyword-table',
  data() {
    return {
      tableData: [],
    }
  },

  mounted() {
    this.takeTableData();
  },
  methods: {
    async takeTableData() {
      this.tableData = [];
      axios.get('/main/topic_main/effect_keyword_rank')
        .then((res) => {
          let result = res['data'];
          return result;
        }).then((data) => {
          this.tableData = data;
        });
    },
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

#th_header {
  font-size: 14px;
  font-weight: 500;
}

#td_header {
  font-size: 14px;
}
</style>
