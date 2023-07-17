<template>
  <div>
    <b-row>
      <b-col style="padding-top: 30px" v-for="(data, index) in material_list" :key="index" xl="3">
        <card header-classes="bg-transparent">
          <b-row align-v="center" slot="header">
            <b-col>
              <h6 class="text-uppercase text-muted ls-1 mb-1"></h6>
              <span id="title2">{{ data.text }} ({{ data.unit }})</span>
            </b-col>
          </b-row>
          <b-row>
            <b-col xl="12" v-if="(index == 0)">
              <line-chart :data="chart0" :min="min0" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 1)">
              <line-chart :data="chart1" :min="min1" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 2)">
              <line-chart :data="chart2" :min="min2" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 3)">
              <line-chart :data="chart3" :min="min3" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 4)">
              <line-chart :data="chart4" :min="min4" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 5)">
              <line-chart :data="chart5" :min="min5" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 6)">
              <line-chart :data="chart6" :min="min6" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 7)">
              <line-chart :data="chart7" :min="min7" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 8)">
              <line-chart :data="chart8" :min="min8" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 9)">
              <line-chart :data="chart9" :min="min9" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 10)">
              <line-chart :data="chart10" :min="min10" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 11)">
              <line-chart :data="chart11" :min="min11" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 12)">
              <line-chart :data="chart12" :min="min12" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 13)">
              <line-chart :data="chart13" :min="min13" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 14)">
              <line-chart :data="chart14" :min="min14" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 15)">
              <line-chart :data="chart15" :min="min15" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 16)">
              <line-chart :data="chart16" :min="min16" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 17)">
              <line-chart :data="chart17" :min="min17" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 18)">
              <line-chart :data="chart18" :min="min18" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 19)">
              <line-chart :data="chart19" :min="min19" :points="false" thousands=","></line-chart>
            </b-col>
            <b-col xl="12" v-else-if="(index == 20)">
              <line-chart :data="chart20" :min="min20" :points="false" thousands=","></line-chart>
            </b-col>
          </b-row>
          <h4 class="text-right" id="source" v-if="(data.source != null)"><a style="color: #525f7f;" :href="data.url">출처 :
              {{ data.source }}</a></h4>
          <h4 v-else>&nbsp;</h4>
        </card>
      </b-col>
    </b-row>
  </div>
</template>


<script>

import axios from 'axios';


export default {
  name: 'price-trend-chart',
  props: ["status2"],

  data() {
    return {
      chart0: null, chart1: null, chart2: null, chart3: null, chart4: null, chart5: null, chart6: null,
      chart7: null, chart8: null, chart9: null, chart10: null, chart11: null, chart12: null, chart13: null,
      chart14: null, chart15: null, chart16: null, chart17: null, chart18: null, chart19: null, chart20: null,

      min0: 0, min1: 0, min2: 0, min3: 0, min4: 0, min5: 0, min6: 0,
      min7: 0, min8: 0, min9: 0, min10: 0, min11: 0, min12: 0, min13: 0,
      min14: 0, min15: 0, min16: 0, min17: 0, min18: 0, min19: 0, min20: 0,

      material_list: [],

      category_list: [
        { text: '키워드 카테고리 : 전쟁', value: 'war', unit: 'count', source: '네이버뉴스' },
        { text: '키워드 카테고리 : 질병', value: 'disease', unit: 'count', source: '네이버뉴스' },
        { text: '키워드 카테고리 : 재해', value: 'disaster', unit: 'count', source: '네이버뉴스' },
        { text: '키워드 카테고리 : 국가', value: 'country', unit: 'count', source: '네이버뉴스' },
        { text: '키워드 카테고리 : 환경', value: 'environment', unit: 'count', source: '네이버뉴스' },
        { text: '키워드 카테고리 : 급등', value: 'up', unit: 'count', source: '네이버뉴스' },
        { text: '키워드 카테고리 : 급락', value: 'down', unit: 'count', source: '네이버뉴스' },
      ],

      cu_list: [
        { text: '구리선물', value: 'hg_close', unit: 'USD/pound', source: '인베스팅', url: 'https://kr.investing.com/commodities/copper-historical-data' },
        { text: '중국컨테이너운임지수', value: 'ccfi', unit: 'index', source: '한국관세물류협회', url: 'https://www.kcla.kr/web/inc/html/4-1_2.asp' },
        { text: '미국채1년', value: 'ir_1y', unit: 'index', source: '인베스팅', url: 'https://kr.investing.com/rates-bonds/u.s.-1-year-bond-yield-historical-data' },
        { text: '미국채10년', value: 'ir_10y', unit: 'index', source: '인베스팅', url: 'https://kr.investing.com/rates-bonds/u.s.-10-year-bond-yield-historical-data' },
        { text: '니켈', value: '', unit: 'USD/ton', source: 'LME', url: 'http://www.nonferrous.or.kr/stats/?act=sub3' },
        { text: '칠레페소달러', value: 'clp', unit: 'USD/clp', source: '인베스팅', url: 'https://www.investing.com/currencies/usd-clp-historical-data' },
        { text: '은', value: 'silver', unit: 'USD/troz', source: 'LSMF Ltd', url: 'https://www.komis.or.kr/komis/price/mineralprice/preciousmetals/pricetrend/precious.do' },
        { text: '휘발유95', value: 'gasoline95', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopopdSelect.do' },
        { text: '등유', value: 'kerosene', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopopdSelect.do' },
        { text: '두바이유', value: 'dubai', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopcoilSelect.do' },
        { text: '브렌트유', value: 'brent', unit: 'USD/bbl', source: '미국 Nymex 선물시장', url: 'https://www.opinet.co.kr/glopcoilSelect.do' },
        { text: 'WTI유', value: 'wti', unit: 'USD/bbl', source: '영국 ICE 선물시장', url: 'https://www.opinet.co.kr/glopcoilSelect.do' }
      ],

      al_list: [
        { text: '알루미늄 재고량', value: 'stock_al', unit: 'ton', source: 'LME', url: 'https://www.kores.net/komis/price/mineralprice/basemetals/pricetrend/baseMetals.do' },
        { text: '국제알루미늄(NALU) 주가', value: 'nalu', unit: 'inr', source: '인도 거래소', url: 'https://kr.investing.com/equities/national-aluminium-historical-data' },
        { text: '중국알루미늄공사 주가', value: 'aluminum_china', unit: 'hkd', source: '홍콩 거래소', url: 'https://www.investing.com/equities/aluminium-corp-of-china-historical-data' },
        { text: '다우존스알루미늄 지수', value: 'DJ_al', unit: 'USD', source: '뉴욕 거래소', url: 'https://www.investing.com/indices/dj-aluminum-historical-data' },
        { text: 'Vedanta 주가', value: 'vdan', unit: 'inr', source: '인도 거래소', url: 'https://kr.investing.com/equities/sesa-goa-historical-data' },
        { text: '중국 Hongqiao 그룹 주가', value: 'hongqiao', unit: 'hkd', source: '홍콩 거래소', url: 'https://kr.investing.com/equities/chinahongqiao-historical-data' },
        { text: '알코아 주가', value: 'alcoa', unit: 'USD', source: '뉴욕 거래소', url: 'https://kr.investing.com/equities/alcoa-historical-data' },
        { text: '미국채1년', value: 'ir_1y', unit: 'index', source: '인베스팅', url: 'https://kr.investing.com/rates-bonds/u.s.-1-year-bond-yield-historical-data' },
        { text: '미국채10년', value: 'ir_10y', unit: 'index', source: '인베스팅', url: 'https://kr.investing.com/rates-bonds/u.s.-10-year-bond-yield-historical-data' },
        { text: '중국컨테이너운임지수', value: 'ccfi', unit: 'index', source: '한국관세물류협회', url: 'https://www.kcla.kr/web/inc/html/4-1_2.asp' },
        { text: '두바이유', value: 'dubai', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopcoilSelect.do' },
        { text: '브렌트유', value: 'brent', unit: 'USD/bbl', source: '미국 Nymex 선물시장', url: 'https://www.opinet.co.kr/glopcoilSelect.do' },
        { text: 'WTI유', value: 'wti', unit: 'USD/bbl', source: '영국 ICE 선물시장', url: 'https://www.opinet.co.kr/glopcoilSelect.do' }
      ],

      ni_list: [
        { text: '니켈 재고량', value: 'stock_ni', unit: 'ton', source: 'LME', url: 'https://www.kores.net/komis/price/mineralprice/basemetals/pricetrend/baseMetals.do' },
        { text: '리오 틴토 ADR 주가', value: 'RIO', unit: 'USD', source: 'RIO 뉴욕 거래소', url: 'https://kr.investing.com/equities/rio-tinto-plc-exch-historical-data' },
        { text: 'BHP 빌리턴 ADR 주가', value: 'bhp', unit: 'USD', source: 'BBL 뉴욕 거래소', url: 'https://www.investing.com/equities/bhp-billiton-ltd-nyse-exch-historical-data' },
        { text: '달러/위안', value: 'usd_cny', unit: 'USD/cny', source: '인베스팅', url: 'https://kr.investing.com/currencies/usd-cny-historical-data' },
        { text: '달러/루피', value: 'usd_idr', unit: 'USD/idr', source: '인베스팅', url: 'https://www.investing.com/currencies/usd-idr-historical-data' },
        { text: 'VALE SA ADR 주가', value: 'vale', unit: 'USD', source: 'VALE 뉴욕 거래소', url: 'https://www.investing.com/equities/vale-s.a.--americ-historical-data' },
        { text: '블룸버그 니켈', value: 'Bloomberg_Nickel', unit: 'USD', source: '글로벌 지수', url: 'https://www.investing.com/indices/bloomberg-nickel-historical-data' },
        { text: '미국채1년', value: 'ir_1y', unit: 'index', source: '인베스팅', url: 'https://kr.investing.com/rates-bonds/u.s.-1-year-bond-yield-historical-data' },
        { text: '미국채10년', value: 'ir_10y', unit: 'index', source: '인베스팅', url: 'https://kr.investing.com/rates-bonds/u.s.-10-year-bond-yield-historical-data' },
        { text: '중국컨테이너운임지수', value: 'ccfi', unit: 'index', source: '한국관세물류협회', url: 'https://www.kcla.kr/web/inc/html/4-1_2.asp' },
        { text: '두바이유', value: 'dubai', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopcoilSelect.do' },
        { text: '브렌트유', value: 'brent', unit: 'USD/bbl', source: '미국 Nymex 선물시장', url: 'https://www.opinet.co.kr/glopcoilSelect.do' },
        { text: 'WTI유', value: 'wti', unit: 'USD/bbl', source: '영국 ICE 선물시장', url: 'https://www.opinet.co.kr/glopcoilSelect.do' }
      ],

      pp_list: [
        { text: '두바이유', value: 'dubai', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopcoilSelect.do' },
        { text: '브렌트유', value: 'brent', unit: 'USD/bbl', source: '영국 ICE 선물시장', url: 'https://www.opinet.co.kr/glopcoilSelect.do' },
        { text: 'WTI유', value: 'wti', unit: 'USD/bbl', source: '미국 Nymex 선물시장', url: 'https://www.opinet.co.kr/glopcoilSelect.do' },
        { text: '나프타', value: 'naphtha', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopopdSelect.do' },
        { text: '휘발유95', value: 'gasoline95', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopopdSelect.do' },
        { text: '경유(0.05%)', value: 'diesel', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopopdSelect.do' },
        { text: 'PP 선물', value: 'dccpc1', unit: 'cny/ton', source: '다롄 거래소', url: 'https://kr.investing.com/commodities/pp-futures-historical-data' },
        { text: '달러/위안', value: 'usd_cny', unit: 'USD/cny', source: '실시간 FX', url: 'https://kr.investing.com/currencies/usd-cny-historical-data' },
        { text: '위안/원', value: 'cny_krw', unit: 'cny/krw', source: '하나은행', url: 'https://kr.investing.com/currencies/cny-krw-historical-data' },
        { text: '위안/리얄', value: 'cny_sar', unit: 'cny/sar', source: '실시간 FX', url: 'https://kr.investing.com/currencies/cny-sar-historical-data' },
        { text: '미국채1년', value: 'ir_1y', unit: 'index', source: '인베스팅', url: 'https://kr.investing.com/rates-bonds/u.s.-1-year-bond-yield-historical-data' },
        { text: '미국채10년', value: 'ir_10y', unit: 'index', source: '인베스팅', url: 'https://kr.investing.com/rates-bonds/u.s.-10-year-bond-yield-historical-data' },
        { text: 'PE 선물', value: 'pe', unit: 'cny/ton', source: '다롄 거래소', url: 'https://kr.investing.com/commodities/lldpe-futures-historical-data' },
        { text: '중국컨테이너운임지수', value: 'ccfi', unit: 'index', source: '한국관세물류협회', url: 'https://www.kcla.kr/web/inc/html/4-1_2.asp' }
      ],

      pc_list: [
        { text: '비스페놀A', value: 'bpa', unit: 'USD/ton', source: 'CIF China', url: '#' },
        { text: '휘발유95', value: 'gasoline95', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopopdSelect.do' },
        { text: '휘발유92', value: 'gasoline92', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopopdSelect.do' },
        { text: '등유', value: 'kerosene', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopopdSelect.do' },
        { text: '경유(0.05%)', value: 'diesel', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopopdSelect.do' },
        { text: '고유황중유', value: 'highsulfurB-C', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopopdSelect.do' },
        { text: '나프타', value: 'naphtha', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopopdSelect.do' },
        { text: '두바이유', value: 'dubai', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopcoilSelect.do' },
        { text: '브렌트유', value: 'brent', unit: 'USD/bbl', source: '미국 Nymex 선물시장', url: 'https://www.opinet.co.kr/glopcoilSelect.do' },
        { text: 'WTI유', value: 'wti', unit: 'USD/bbl', source: '영국 ICE 선물시장', url: 'https://www.opinet.co.kr/glopcoilSelect.do' },
        { text: '미국채1년', value: 'ir_1y', unit: 'index', source: '인베스팅', url: 'https://kr.investing.com/rates-bonds/u.s.-1-year-bond-yield-historical-data' },
        { text: '미국채10년', value: 'ir_10y', unit: 'index', source: '인베스팅', url: 'https://kr.investing.com/rates-bonds/u.s.-10-year-bond-yield-historical-data' },
        { text: '중국컨테이너운임지수', value: 'ccfi', unit: 'index', source: '한국관세물류협회', url: 'https://www.kcla.kr/web/inc/html/4-1_2.asp' }
      ],

      hr_list: [
        { text: '두바이유', value: 'dubai', unit: 'USD/bbl', source: '싱가포르', url: 'https://www.opinet.co.kr/glopcoilSelect.do' },
        { text: '브렌트유', value: 'brent', unit: 'USD/bbl', source: '미국 Nymex 선물시장', url: 'https://www.opinet.co.kr/glopcoilSelect.do' },
        { text: 'WTI유', value: 'wti', unit: 'USD/bbl', source: '영국 ICE 선물시장', url: 'https://www.opinet.co.kr/glopcoilSelect.do' },
        { text: '미국채1년', value: 'ir_1y', unit: 'index', source: '인베스팅', url: 'https://kr.investing.com/rates-bonds/u.s.-1-year-bond-yield-historical-data' },
        { text: '미국채10년', value: 'ir_10y', unit: 'index', source: '인베스팅', url: 'https://kr.investing.com/rates-bonds/u.s.-10-year-bond-yield-historical-data' },
        { text: '철광석 선물', value: 'TIO', unit: 'USD/ton', source: '시카고선물거래소', url: 'https://kr.investing.com/commodities/iron-ore-62-cfr-futures-historical-data' },
        { text: '미국철강코일', value: 'HRCc1', unit: 'USD/ton', source: '시카고선물거래소', url: 'https://kr.investing.com/commodities/us-steel-coil-futures-historical-data' },
        { text: '중국야금코크스', value: 'DCJc1', unit: 'cny/ton', source: '다롄거래소', url: 'https://kr.investing.com/commodities/metallurgical-coke-futures-historical-data' },
        { text: '철광석중국', value: 'iron_ore china', unit: 'USD/ton', source: 'CFR China port', url: 'https://www.komis.or.kr/komis/price/mineralprice/ironoreenergy/pricetrend/ironOreEnergy.do' },
        { text: '유연탄 현물', value: 'bituminous_coal', unit: 'USD/ton', source: 'FOB Australia', url: 'https://www.komis.or.kr/komis/price/mineralprice/ironoreenergy/pricetrend/ironOreEnergy.do' },
        { text: 'BDI', value: 'BDI', unit: 'index', source: '한국관세물류협회', url: 'https://kr.investing.com/indices/baltic-dry-historical-data' }
      ],
    }
  },
  watch: {
    status2: {
      handler() {
        this.takeChartData();
        this.fetchData()
      },
      deep: true,
    }
  },

  mounted() {
    this.fetchData();
  },
  methods: {

    takeChartData: function () {

      if (this.status2.material == 'CU') {
        this.material_list = this.cu_list;
      } else if (this.status2.material == 'AL') {
        this.material_list = this.al_list;
      } else if (this.status2.material == 'NI') {
        this.material_list = this.ni_list;
      } else if (this.status2.material == 'PP') {
        this.material_list = this.pp_list;
      } else if (this.status2.material == 'PC') {
        this.material_list = this.pc_list;
      } else if (this.status2.material == 'HR') {
        this.material_list = this.hr_list;
      }
    },

    chartData: function (data, item) {
      let result = [];
      let min;
      if (data.length != 0 && data[0][item] !== 0) {
        min = data[0][item];
      } else if (data.length == 0) {
        min = 0;
      }
      data.forEach(element => {

        if (element[item] != 0 && element[item] != null) {
          if (min > element[item]) {
            min = element[item]
          }
          result.push([element.datetime, element[item]]);
        }
      });
      if (min != 0) {
        min = Math.round(min - 0.5);
      }
      return [result, min];
    },

    fetchData: async function () {
      let index = 0;
      let list = [...this.material_list, ...this.category_list]
      for (let i in list) {
        // 원자재 그래프를 다 보여준 후, 카테고리 그래프 보여주기
        if (parseInt(i) >= this.material_list.length) {
          axios.get("/material1/real_price_trend_category/category_chart",
            {
              params:
              {
                material: this.status2.material,
                category: this.category_list[index].value,
                startDate: this.status2.startDate,
                endDate: this.status2.endDate
              }
            })
            .then((res) => {
              let result = res['data'];
              return result;
            }).then((data) => {
              let result = [];
              data.forEach(element => {
                result.push([element.datetime, element.tf]);
              });
              if (i == 11) {
                this.min11 = 0
                this.chart11 = result;
              } else if (i == 12) {
                this.min12 = 0
                this.chart12 = result;
              } else if (i == 13) {
                this.min13 = 0
                this.chart13 = result;
              } else if (i == 14) {
                this.min14 = 0
                this.chart14 = result;
              } else if (i == 15) {
                this.min15 = 0
                this.chart15 = result;
              } else if (i == 16) {
                this.min16 = 0
                this.chart16 = result;
              } else if (i == 17) {
                this.min17 = 0
                this.chart17 = result;
              } else if (i == 18) {
                this.min18 = 0
                this.chart18 = result;
              } else if (i == 19) {
                this.min19 = 0
                this.chart19 = result;
              } else if (i == 20) {
                this.min20 = 0
                this.chart20 = result;
              }
            });
          index++;

        }
        // 가격이 아닌, 재고량 데이터 보여주기
        else if (this.material_list[i].value == 'stock_al' || this.material_list[i].value == 'stock_ni') {
          axios.get("/material1/real_price_trend/stock_chart",
            {
              params:
              {
                material: this.status2.material,
                material_other: '',
                startDate: this.status2.startDate,
                endDate: this.status2.endDate
              }
            })
            .then((res) => {
              let result = res['data'];
              return result;
            }).then((data) => {
              let [result, min] = this.chartData(data, 'stock');
              if (i == 0) {
                this.min0 = min;
                this.chart0 = result;
              } else if (i == 4) {
                this.min4 = min;
                this.chart4 = result;
              }
            });
        } else if (this.material_list[i].value == '') {
          axios.get("/material1/real_price_trend/chart",
            {
              params:
              {
                material: 'NI',
                material_other: '',
                startDate: this.status2.startDate,
                endDate: this.status2.endDate
              }
            })
            .then((res) => {
              let result = res['data'];
              return result;
            }).then((data) => {
              let [result, min] = this.chartData(data, 'price');
              this.min4 = min;
              this.chart4 = result;
            });
        } else {
          axios.get("/material1/real_price_trend/chart",
            {
              params:
              {
                material: this.status2.material,
                material_other: this.material_list[i].value,
                startDate: this.status2.startDate,
                endDate: this.status2.endDate
              }
            })
            .then((res) => {
              let result = res['data'];
              return result;
            }).then((data) => {
              let [result, min] = this.chartData(data, 'price');
              if (i == 0) {
                this.min0 = min;
                this.chart0 = result;
              } else if (i == 1) {
                this.min1 = min;
                this.chart1 = result;
              } else if (i == 2) {
                this.min2 = min;
                this.chart2 = result;
              } else if (i == 3) {
                this.min3 = min;
                this.chart3 = result;
              } else if (i == 4) {
                this.min4 = min;
                this.chart4 = result;
              } else if (i == 5) {
                this.min5 = min;
                this.chart5 = result;
              } else if (i == 6) {
                this.min6 = min;
                this.chart6 = result;
              } else if (i == 7) {
                this.min7 = min;
                this.chart7 = result;
              } else if (i == 8) {
                this.min8 = min;
                this.chart8 = result;
              } else if (i == 9) {
                this.min9 = min;
                this.chart9 = result;
              } else if (i == 10) {
                this.min10 = min;
                this.chart10 = result;
              } else if (i == 11) {
                this.min11 = min;
                this.chart11 = result;
              } else if (i == 12) {
                this.min12 = min;
                this.chart12 = result;
              } else if (i == 13) {
                this.min13 = min;
                this.chart13 = result;
              }
            });
        }
      }
      this.material_list = [...this.material_list, ...this.category_list];
    },
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

#card-body-col {
  padding: 0px;
}

#source {
  font-size: 14px;
  font-weight: 400;
}
</style>
