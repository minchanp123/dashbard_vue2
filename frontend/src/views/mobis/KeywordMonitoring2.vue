<template>
  <div>
    <b-container style="padding: 30px">
      <b-row>
        <b-col xl="2">
          <b-form-select v-model="material" :options="material_list"></b-form-select>
        </b-col>
        <b-col xl=2>
          <b-input type="date" value="시작 날짜" v-model="startDate" :max="endDate"></b-input>
        </b-col>

        <b-col xl=0 align-self="center">
          <span>~</span>
        </b-col>

        <b-col xl="2">
          <b-input type="date" value="종료 날짜" v-model="endDate" :min="startDate" :max="this.getToday()"></b-input>
        </b-col>

        <b-col xl="2">
          <b-form-select v-model="frequency" :options="frequency_list" v-on:change="frequencyDate"></b-form-select>
        </b-col>

        <b-col xl="2">
          <b-button class="btn1" variant="primary" v-on:click="showKeywordTopic">확인</b-button>
        </b-col>
      </b-row>

      <b-row style="padding-top: 30px;">
        <b-col xl="8">
          <NetWorkGraphVue v-bind:status="status"></NetWorkGraphVue>
        </b-col>

        <b-col xl="4">
          <keyword-topic-table2 v-bind:status="status"></keyword-topic-table2>
        </b-col>
      </b-row>

      <b-row style="padding-top: 30px;">
        <b-col>
          <card header-classes="bg-transparent">
            <b-row align-v="center" slot="header">
              <b-col>
                <h6 class="text-uppercase text-muted ls-1 mb-1"></h6>
                <span id="title2">카테고리별 화제어 빈도/발생추이</span>
              </b-col>
            </b-row>

            <b-row style="height:450px;">
              <b-col xl="0">
                <h4 class="text-left" id="source" style="writing-mode: vertical-lr; transform: rotate(180deg);">count</h4>
              </b-col>
              <b-col xl="11">
                <KeywordTopicChart v-bind:status="status"></KeywordTopicChart>
              </b-col>
            </b-row>

          </card>
        </b-col>
      </b-row>

      <b-row style="padding-top: 30px;">
        <b-col xl="12">
          <keyword-doc-table2></keyword-doc-table2>
        </b-col>
      </b-row>



    </b-container>
  </div>
</template>

<script>

// Components
import KeywordTopicTable2 from '../Tables/KeywordTopicTable2.vue';
import KeywordDocTable2 from '../Tables/KeywordDocTable2.vue';
import NetWorkGraphVue from '../Charts/NetWorkGraphVue.vue';
import KeywordTopicChart from '../Charts/KeywordTopicChart.vue';

import dayjs from 'dayjs';

export default {
  components: {
    KeywordTopicTable2,
    KeywordDocTable2,
    NetWorkGraphVue,
    KeywordTopicChart
  },
  data() {
    return {
      material: '포스코',
      startDate: this.getF1day(),
      endDate: this.getToday(),
      material_list: [
        { value: '포스코', text: '포스코' },
        { value: 'GS칼텍스', text: 'GS칼텍스' },
        { value: 'LG화학', text: 'LG화학' },
        { value: '라이온델바젤', text: '라이온델바젤' },
        { value: '롯데케미칼', text: '롯데케미칼' },
        { value: '바스프', text: '바스프' },
        { value: '사빅', text: '사빅' },
        { value: '삼양사', text: '삼양사' },
        { value: '코베스트로', text: '코베스트로' },
        { value: '한화토탈에너지스', text: '한화토탈에너지스' },
        { value: '현대제철', text: '현대제철' },
      ],

      frequency: 'f1',
      frequency_list: [
        { value: "f1", text: "단기" },
        { value: "f2", text: "중기" },
        { value: "f3", text: "장기" }
      ],
      topicHeight: null,
      status: {
        item: 'company',
        material: '',
        startDate: '',
        endDate: '',
      },
    }
  },
  mounted() {
    this.status.material = this.material;
    this.status.startDate = this.startDate;
    this.status.endDate = this.endDate;
  },
  methods: {
    getToday: function () {
      let now = new dayjs().format('YYYY-MM-DD');

      return now;
    },

    // 1개월 전 날짜 가져오는 함수 (f1 : 단기, 오늘 날짜 기준)
    getF1day: function () {
      let prevOneMonth = new dayjs().subtract(1, 'month').format('YYYY-MM-DD');

      return prevOneMonth;
    },

    // 3개월 전 날짜 가져오는 함수 (f2 : 중기, 오늘 날짜 기준)
    getF2day: function () {
      let date = new dayjs();
      date = date.subtract(3, 'month').format('YYYY-MM-DD');

      return date;
    },

    // 6개월 전 날짜 가져오는 함수 (f3 : 장기, 오늘 날짜 기준)
    getF3day: function () {
      let date = new dayjs();
      date = date.subtract(6, 'month').format('YYYY-MM-DD');

      return date;
    },

    // 확인 버튼 클릭 시
    showKeywordTopic: function () {
      this.status.item = 'company',
        this.status.material = this.material;
      this.status.startDate = this.startDate;
      this.status.endDate = this.endDate;
    },

    // 주기 선택 시
    frequencyDate: function () {
      this.endDate = this.getToday();
      if (this.frequency == 'f1') {
        this.startDate = this.getF1day();
      } else if (this.frequency == 'f2') {
        this.startDate = this.getF2day();
      } else if (this.frequency == 'f3') {
        this.startDate = this.getF3day();
      }
    }
  },
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

#title2 {
  font-size: 17px;
  font-weight: 500;
}
</style>
