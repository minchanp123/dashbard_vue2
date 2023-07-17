<template>
  <div>
    <b-card body-class="p-0" style="height: 100%; border-top: 0px;">
      <b-table-simple class="table table-striped"
        style="table-layout: auto; border-top: none; border-bottom: none; word-wrap: break-word; white-space : nowrap;">
        <b-thead>
          <b-tr style="background-color: #FFFAF0;">
            <b-th colspan="5" style="font-size:17px; font-weight:500;">키워드 뉴스</b-th>
          </b-tr>
          <b-tr class="text-center" style="background-color: #f6f9fc;">
            <b-th style="font-size: 14px; font-weight: 500;">날짜</b-th>
            <b-th style="font-size: 14px; font-weight: 500;">분류</b-th>
            <b-th style="font-size: 14px; font-weight: 500;">제목</b-th>
            <b-th style="font-size: 14px; font-weight: 500; padding-left: 0px; padding-right: 0px;">유사도&nbsp;
              <img id="target-1" style="max-width: 2vh" :src="info_circle" /></b-th>
            <b-th style="font-size: 14px; font-weight: 500;">키워드 요약 (5개)</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr v-for="(data, index01) in pageTable" :key="index01">
            <b-td class="text-center" style="padding-right: 0px;">{{ data.datetime }}</b-td>
            <b-td class="text-center" style="padding-left: 0px; padding-right: 0px;"> {{ data.material }} </b-td>
            <b-td class="text-center" style="padding-left: 0px; padding-right: 0px;">
              <a target="_blank" :href="data.doc_url"> {{ data.doc_title }}</a>
            </b-td>
            <b-td class="text-center" style="padding-left: 0px; padding-right: 0px;"> {{ data.prob }} </b-td>
            <b-td class="text-center" style="font-size: 12px; padding-left: 0px; padding-right: 0px;"> {{ data.topics }}</b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>

    </b-card>

    <div v-if="tableData.length != 0" class="text-center">
      <button :disabled="pageNum === 0" @click="prevPage()" id="btn_page">&lt;</button>
      <span>{{ pageNum + 1 }} / {{ count }}</span>
      <button :disabled="pageNum >= count - 1" @click="nextPage()" id="btn_page">&gt;</button>
    </div>

    <b-tooltip target="target-1">
      <div style="text-align: left">
        [유사도 산정 기준]<br>
        원자재 보고서와 뉴스 원문 내용의 코사인 유사도를 비교하여, 유사도를 나타냄<br><br>

        분석을 통해 수집 목적과 부합한 문서의 최대 유사치를 0.35로 선정<br><br>

        문서의 유사도는 해당 문서의 유사도값/0.35 로 계산함<br><br>

        *코사인 유사도: 코사인 각도를 이용하여 벡터 간의 유사도를 추정하는 방법
      </div>
    </b-tooltip>
  </div>
</template>

<script>

import axios from 'axios';

export default {
  name: 'keyword-news-table',
  props: ["status"],
  data() {
    return {
      info_circle: require('@/assets/info_circle.png'),
      tableData: [],
      pageNum: 0,
      pageTable: [],
      page: 0,
      count: 0,
      pageSize: 5,
    }
  },
  watch: {
    status: {
      handler() {
        this.takeTableData();
      },
      deep: true,
    },
    pageNum: {
      handler() {
        this.paginatedData(this.tableData);
      }
    },
  },

  mounted() {
  },

  methods: {
    async takeTableData() {
      this.tableData = [];

      axios.get("/main/document/keyword_news")
        .then((res) => {
          let result = res['data'];
          return result;
        }).then((data) => {

          for (var i of data) {
            if (i.material == "all") {
              i.material = "전체";
            }

            i.datetime = i.datetime.slice(0, 10);
          }

          this.tableData = data;

          if (this.tableData.length == 0) {
            this.pageTable = [];
          } else {
            this.pageNum = 0;
            this.paginatedData(this.tableData);
            this.pageCount();
          }
        });
    },

    nextPage() {
      this.pageNum += 1;
    },
    prevPage() {
      this.pageNum -= 1;
    },
    async pageCount() {
      let listLength = this.tableData.length;
      let listSize = this.pageSize;
      let page = Math.floor(listLength / listSize);

      if (listLength % listSize > 0) page += 1;

      this.count = page;
    },
    async paginatedData(tableData) {
      let start = this.pageNum * this.pageSize;
      let end = start + this.pageSize;

      if (typeof (tableData) != 'undefined') {
        this.pageTable = tableData.slice(start, end);
      } else {
        this.pageTable = tableData;
      }
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
  font-size: 15px;
  font-weight: 500;
}

#btn_page {
  background: #5e72e4;
  border-width: 0px;
  color: white;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px rgb(50 50 93 / 11%), 0 1px 3px rgb(0 0 0 / 8%);
}
</style>
