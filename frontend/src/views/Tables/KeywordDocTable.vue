<template>
  <div>
    <b-table-simple class="table table-striped">
      <b-thead>
        <b-tr>
          <b-th colspan="5"
            style="font-size:17px; padding: 1.25rem 1.5rem; font-weight: 500; background-color: #ffffff; border-left: 1px solid #e9ecef;">원문보기
            <div class="check_box" v-if="item == 'news'">
              &nbsp;&nbsp;&nbsp;
              <label for="check1">
                <input id="check1" type="checkbox" v-model="checkedValue" value="ALL" @change="checkMaterial">&nbsp;원자재키워드 포함
              </label>
            </div>
          </b-th>
        </b-tr>
        <b-tr v-if="item == 'news'" class="text-center">
          <b-th id="th_header" style="border-left: 1px solid #e9ecef;">일자</b-th>
          <b-th id="th_header">제목</b-th>
          <b-th id="th_header">채널</b-th>
          <b-th id="th_header">키워드</b-th>
          <b-th id="th_header" style="border-right: 1px solid #e9ecef;">url</b-th>
        </b-tr>
        <b-tr v-else class="text-center">
          <b-th id="th_header" style="border-left: 1px solid #e9ecef;">일자</b-th>
          <b-th id="th_header">제목</b-th>
          <b-th id="th_header">채널</b-th>
          <b-th id="th_header" style="border-right: 1px solid #e9ecef;">원문보기</b-th>
        </b-tr>
      </b-thead>
      <b-tbody v-if="item == 'news'">
        <b-tr class="text-center" v-for="(data, index) in pageTable" :key="index"
          style="border-bottom: 1px solid #e9ecef;">
          <b-td id="td_header" style="border-left: 1px solid #e9ecef;">{{ data.datetime }}</b-td>
          <b-td id="td_header" style="width: 40%;">
            <a target="_blank" :href="data.doc_url">{{ data.doc_title }}</a>
          </b-td>
          <b-td id="td_header">{{ data.source }}</b-td>
          <b-td id="td_header">{{ data.topics }}</b-td>
          <b-td id="td_header" style="border-right: 1px solid #e9ecef;">
            <button id="btn_copy" @click="copyUrl(data.doc_url)"> URL 복사 </button>
          </b-td>
        </b-tr>
      </b-tbody>
      <b-tbody v-else>
        <b-tr class="text-center" v-for="(data, index) in pageTable" :key="index"
          style="border-bottom: 1px solid #e9ecef;">
          <b-td id="td_header" style="border-left: 1px solid #e9ecef;">{{ data.datetime }}</b-td>
          <b-td id="td_header" style="width: 40%;">{{ data.doc_title }}</b-td>
          <b-td id="td_header">레포트</b-td>
          <b-td id="td_header">
            <button id="btn_copy" v-on:click="downloadFile(data.org_title)">
              파일 다운로드
            </button>
          </b-td>
        </b-tr>
      </b-tbody>
    </b-table-simple>

    <div v-if="tableData.length != 0" class="text-center">
      <button :disabled="pageNum === 0" @click="prevPage()" id="btn_page">&lt;</button>
      <span>{{ pageNum + 1 }} / {{ count }}</span>
      <button :disabled="pageNum >= count - 1" @click="nextPage()" id="btn_page">&gt;</button>
    </div>

  </div>
</template>



<script>
import EventBus from '../EventBus';
import axios from 'axios';

export default {
  name: 'keyword-doc-table',
  props: ["status"],
  data() {
    return {
      tableData: [],
      searchOptions: {
        material: '',
        startDate: '',
        endDate: '',
        topic: '',
      },
      checkedValue: [],
      item: '',
      startDate: '',
      endDate: '',
      material: 'NI',
      topic: '',
      pageNum: 0,
      pageTable: [],
      page: 0,
      count: 0,
      pageSize: 5,
    }
  },
  watch: {
    searchOptions: {
      handler() {
        this.takeTableData2();
      },
      deep: true,
    },
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
    this.setTopic();
    // this.initMaterial();
  },
  methods: {
    async takeTableData() {

      this.tableData = [];
      this.item = this.status.item;

      if (this.item == 'news') {
        axios.get("/monitoring1/document/material_news_original_text",
          { params: { startDate: this.status.startDate, endDate: this.status.endDate, material: this.status.material, topic: '', checkedValue: this.checkedValue[0] } })
          .then((res) => {
            let result = res['data'];
            return result;
          }).then((data) => {

            for (var i of data) {
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
      } else if (this.item == 'report') {
        axios.get("/monitoring1/document_report/material_report_original_text",
          { params: { startDate: this.status.startDate, endDate: this.status.endDate, material: this.status.material } })
          .then((res) => {
            let result = res['data'];
            return result;
          }).then((data) => {

            for (var i of data) {
              i.org_title = i.doc_title;
              i.doc_title = i.doc_title.split('@@')[1];
            }

            this.tableData = data;

            if (this.tableData.length == 0) {
              this.pageTable = [];
            } else {
              this.pageNum = 0;
              this.paginatedData(this.tableData);
              this.pageCount();
            }

          })
      }
    },
    // topic 클릭했을 때, 실행하는 함수
    async takeTableData2() {

      this.tableData = [];
      this.item = this.status.item;

      if (this.item == 'news') {
        axios.get("/monitoring1/document/material_news_original_text",
          { params: { startDate: this.startDate, endDate: this.endDate, material: this.material, topic: this.topic, checkedValue: this.checkedValue[0] } })
          .then((res) => {
            let result = res['data'];
            return result;
          }).then((data) => {

            for (var i of data) {
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
      }
    },
    downloadFile(title) {
      const config = {
        headers: {
          "Content-Type": "blob"
        },
        url: "http://10.240.252.22/download_report",
        params: {
          title: title
        },
        method: "GET",
        responseType: "blob",
      }
      axios(config)
        .then((res) => {
          console.log('download_report');
          // 다운로드 요청을 처리할 임시 링크 엘리먼트 생성
          const href = URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.href = href;
          // 링크 엘리먼트에 download 속성 지정
          link.setAttribute('download', decodeURIComponent(`${title.split('@@')[1]}.pdf`));
          document.body.appendChild(link);
          link.click();
          // 임시로 생성한 링크 엘리먼트 삭제
          document.body.removeChild(link);
          URL.revokeObjectURL(href);
        })
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

    copyUrl(text) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Unable to copy to clipboard', err);
      }
      document.body.removeChild(textArea);
      alert('url 복사 완료');
    },

    checkMaterial(event) {
      for (let i = 0; i < this.checkedValue.length; i++) {
        if (this.checkedValue[i] !== event.target.value) {
          this.checkedValue.splice(i, 1);
        }
      }

      this.takeTableData();
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

#td_header {
  font-size: 14px;
  background-color: #ffffff;
}

#th_header {
  font-size: 14px;
  font-weight: 500;
  padding: 0.8rem;
  background-color: #f6f9fc;
  vertical-align: middle;
}

#btn_copy {
  background: #5e72e4;
  border-width: 0px;
  color: white;
  border-radius: 0.375rem;
  padding-top: 2px;
  padding-bottom: 2px;
  box-shadow: 0 4px 6px rgb(50 50 93 / 11%), 0 1px 3px rgb(0 0 0 / 8%);
}

#btn_page {
  background: #5e72e4;
  border-width: 0px;
  color: white;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px rgb(50 50 93 / 11%), 0 1px 3px rgb(0 0 0 / 8%);
}

.check_box {
  display: inline-block;
}
</style>
