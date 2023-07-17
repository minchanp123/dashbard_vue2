<template>
    <b-table-simple small="true" style="table-layout: auto; border: 1px solid #e9ecef; height: 100%;">
      <b-thead>
        <b-tr class="text-center" style="background-color: #f6f9fc;">
        <b-th id="th_header"><img id="tooltip-target-3" style="max-width: 2vh" :src="info_circle"></b-th>
        <b-th v-for="item in header" id="th_header" :key="item">{{ item }}</b-th>
        </b-tr>
      </b-thead>

      <b-tbody>
        <b-tr class="text-center" v-for="(data, index) in tableData" :key="index">
          <b-td id="th_header">
            <span v-if="index == 0">와이즈넛</span>
            <span v-else-if="index == 1">앙상블</span>
            <span v-else-if="index == 2">현대모비스</span>
          </b-td>
          <b-td id="td_header">{{data.current}}</b-td>
          <b-td id="td_header">
            <span v-if="data.month1 != '' && data.month1 != '-'">{{data.month1.slice(0, -1)}}(
              <span v-bind:class="{'up': data.month1.slice(-1) == '▲', 'equal': data.month1.slice(-1) == '-', 'down': data.month1.slice(-1) == '▼'}">
                {{data.month1.slice(-1)}}
                {{data.month1_prepare}}%
              </span>)
            </span>
            <span v-else>
              {{data.month1}}
            </span>
          </b-td>
          <b-td id="td_header">
            <span v-if="data.month3 != '' && data.month3 != '-'">{{data.month3.slice(0, -1)}}(
              <span v-bind:class="{'up': data.month3.slice(-1) == '▲', 'equal': data.month3.slice(-1) == '-', 'down': data.month3.slice(-1) == '▼'}">
                {{data.month3.slice(-1)}}
                {{data.month3_prepare}}%
              </span>)
            </span>
            <span v-else>
              {{data.month3}}
            </span>
          </b-td>
          <b-td id="td_header">
            <span v-if="data.month6 != '' && data.month6 != '-'">{{data.month6.slice(0, -1)}}(
              <span v-bind:class="{'up': data.month6.slice(-1) == '▲', 'equal': data.month6.slice(-1) == '-', 'down': data.month6.slice(-1) == '▼'}">
                {{data.month6.slice(-1)}}
                {{data.month6_prepare}}%
              </span>)
            </span>
            <span v-else>
              {{data.month6}}
            </span>
          </b-td>
        </b-tr>
      </b-tbody>
      <b-tooltip target="tooltip-target-3" style="width: fit-content;">
        <!-- I am tooltip <b>component</b> content! -->
        <div style="text-align: left">
          * 시계열 데이터는 과거의 값들이 현재와 미래의 값에 영향을 미치는 데이터이기에, 시간의 흐름과 관련된 여러 가지 요소를 고려하여 분석하는 것이 중요합니다.<br>
          따라서 시계열 데이터 분석은 시간에 따른 패턴과 추세, 주기, 계절성 등을 파악하여 미래의 추세나 변화를 예측하는 데 매우 유용한 분석 방법입니다.<br><br>

          와이즈넛이 사용한 모델은 SARIMAX 모델, LSTM 모델, 그리고 두 개 모델의 앙상블 모델을 사용했습니다.<br>
          현대모비스에서 사용한 모델은 Attention LSTM 모델 입니다.<br>
          앙상블 모델은 SARIMAX 모델, LSTM 모델,Attention LSTM 모델 3 모델을 합친 앙상블 모형입니다.<br><br>

          모델 설명<br>
          1. SARIMAX 모델<br>
          데이터의 계절적 요인과 외부 변수와 원자재의 관계를 고려한 통계 모델입니다.<br>
          <img width="400px" src="img/model_img1.png"><br>
          출처: <a href="https://timeseriesreasoning.com/contents/regression-with-arima-errors-model">
          https://timeseriesreasoning.com/contents/regression-with-arima-errors-model
          </a><br><br>

          2. LSTM 모델<br>
          이전 시점의 입력을 현재 시점에 반영하여 모델링하는 RNN 모델이 가진 문제점인 장기적인 의존성(현재와 예측 시점 사이의 시간적 거리가 멀어질수록 예측을 하기 위해 필요한 과거 데이터의 수가
          증가하는 현상)을 학습하는 데 우수한 성능을 가진 딥러닝 모델입니다.<br>
          <img width="500px" src="img/model_img2.png"><br>
          출처: <a href="https://dgkim5360.tistory.com/entry/understanding-long-short-term-memory-lstm-kr">
          https://dgkim5360.tistory.com/entry/understanding-long-short-term-memory-lstm-kr
          </a><br><br>

          3. Attention LSTM<br>
            LSTM 모델과 Attention 매커니즘을 결합한 모델입니다. Attention 메커니즘은 데이터들중에서 특정 부분에 집중하도록 모델을 학습시키는 방법입니다. 시계열 데이터에서 특정 구간에 주목하여
          예측을 수행하는 딥러닝 모델입니다.<br>
          <img width="500px" src="img/model_img3.png"><br>
          출처: <a href="https://hcnoh.github.io/2018-12-11-bahdanau-attention">
          https://hcnoh.github.io/2018-12-11-bahdanau-attention
          </a><br><br>

          4.앙상블 모형<br>
          위의 모델들을 이용하여 구한 3개 모델의 예측값에서 검증데이터로 산정한 가중치를 결합한 모델로, 높은 정확도와 안정성을 가진 모델입니다.<br>
          <img width="500px" src="img/model_img4.png"><br>
          출처: <a href="http://bigdata.dongguk.ac.kr/lectures/datascience/_book/%EC%95%99%EC%83%81%EB%B8%94-%EB%B0%A9%EB%B2%95.html">
          http://bigdata.dongguk.ac.kr/lectures/datascience/_book/%EC%95%99%EC%83%81%EB%B8%94-%EB%B0%A9%EB%B2%95.html
          </a><br><br>

        </div>
      </b-tooltip>
    </b-table-simple>
</template>



<script>
  import axios from 'axios';

  export default {
    name: 'rate-per-date-table',
    props:["status"],
    data() {
      return {
        info_circle: require('@/assets/info_circle.png'),
        tableData: [],
        header: ['현재', '1개월 후', '3개월 후', '6개월 후'],
      }
    },
    watch:{
      status: {
        handler() {
          this.takeTableData();
        },
        deep: true,
      }
    },

    mounted() {
      //this.takeTableData();
    },
    methods: {
      async takeTableData() {
        this.predict_material = this.status.predict_material;

        this.tableData=[];

        const field = ['current', 'month1', 'month3', 'month6'];
        const prepare = ['month1_prepare', 'month3_prepare', 'month6_prepare'];

         // 비정형 제외, 비정형 포함
         axios.get("/material1/price_prediction/select_price_prediction", {params: {predict_material: this.predict_material}})
            .then((res) => {
              let result = res['data'];
              return result;
            })
            .then((data) => {
              for (var i of data) {
                for (var j=1; j<4; j++) {
                  if (i[field[0]] !== '' && i[field[j]] != '') {
                    if (parseFloat(i[field[0]]) > parseFloat(i[field[j]])) {
                      i[field[j]] += "▼";
                    } else if (parseFloat(i[field[0]]) < parseFloat(i[field[j]])) {
                        i[field[j]] += "▲";
                    } else {
                        i[field[j]] += "-";
                    }
                  } else {
                      i[field[j]] = "-";
                  }
                }
              }

              for (var i of data) {
                for (var j of field) {
                  if (i[j] != '' && i[j] != '-') {
                    i[j] = i[j].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  }
                }

                for(var k of prepare){
                  if(i[k].substring(0,1) == '-'){
                    i[k] = i[k].substring(1,i[k].length);
                  }
                }
              }

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
  #th_header{
      font-size:14px;
      font-weight: 500;
      vertical-align: middle;
  }
  #td_header{
      font-size:14px;
      background-color: #ffffff;
      vertical-align: middle;
  }
  .tooltip{
    opacity: 1 !important;
  }
  .tooltip .tooltip-inner{
    max-width: 1050px !important;
    width: 1050px !important;
  }
  .img_graph {
    width: 400px
}
</style>
