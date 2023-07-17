<template>
  <div>
    <b-container id="content" style="padding: 30px">
      <b-row style="font-size:19px;">
        <b-col>
          <h2>원자재 시황 예측</h2>
        </b-col>
      </b-row>

      <b-row style="padding-top: 30px;">
        <b-col xl="2">
          <b-form-select v-model="predict_material" :options="material_list"></b-form-select>
        </b-col>
        <b-col xl="2">
          <b-form-select v-model="predict_frequency" :options="frequency_list"></b-form-select>
        </b-col>
        <b-col xl="1">
          <b-button class="btn1" variant="primary" v-on:click="fetchData(), showRisk()">확인</b-button>
        </b-col>
      </b-row>

      <b-row style="padding-top: 30px">
        <b-col xl="8" style="height:100%;">
          <b-row>
            <b-col xl="12">
              <card style="height: 100%; padding-top: 3vh;">
                <apexchart ref="prediction_chart" type="line" height="400" :options="chartOptions" :series="series"></apexchart>
              </card>
            </b-col>
          </b-row>

          <b-row style="padding-top: 30px">
            <b-col xl="9" class="mb-5 mb-xl-0">
              <rate-per-date-table v-bind:status="status"></rate-per-date-table>
            </b-col>

            <b-col xl="3">

              <b-table-simple class="table1" borderless="false" small="true" style="table-layout: auto; height: 100%;">
                <b-tbody>
                  <b-th class="text-center" colspan="2" style="background-color: #f6f9fc; font-size:14px; font-weight:500; padding: 0.7rem; border: 1px solid #e9ecef;
                    vertical-align: middle;">시나리오 유사도 &nbsp;&nbsp;
                    <img id="target-1" style="max-width: 2vh" :src="info_circle">
                  </b-th>
                  <b-tr style="border-left: 1px solid #e9ecef; border-right: 1px solid #e9ecef;">
                    <b-td class="text-right" style="background-color: #ffffff; font-size:14px; width:10%; vertical-align: middle;">재난</b-td>
                    <b-td class="text-center" style="background-color: #ffffff; vertical-align: middle;">
                      <b-progress height="2vh" :max="max" style="width:90%;">
                        <b-progress-bar v-if="(this.scenario <= 10)" :value="this.scenario.climate"
                          :label="this.scenario.climate + '%'"
                          style="background-color: #EFF6FC; color: #525f7f; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.climate <= 20)" :value="this.scenario.climate"
                          :label="this.scenario.climate + '%'"
                          style="background-color: #DAE8F5; color: #525f7f; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.climate <= 30)" :value="this.scenario.climate"
                          :label="this.scenario.climate + '%'"
                          style="background-color: #C7DBEF; color: #525f7f; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.climate <= 40)" :value="this.scenario.climate"
                          :label="this.scenario.climate + '%'"
                          style="background-color: #A0CAE1; color: #525f7f; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.climate <= 50)" :value="this.scenario.climate"
                          :label="this.scenario.climate + '%'"
                          style="background-color: #75B3D8; color: #ffffff; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.climate <= 60)" :value="this.scenario.climate"
                          :label="this.scenario.climate + '%'"
                          style="background-color: #3D8DC3; color: #ffffff; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.climate <= 70)" :value="this.scenario.climate"
                          :label="this.scenario.climate + '%'"
                          style="background-color: #1B6AAF; color: #ffffff; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.climate <= 80)" :value="this.scenario.climate"
                          :label="this.scenario.climate + '%'"
                          style="background-color: #0C56A0; color: #ffffff; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.climate <= 90)" :value="this.scenario.climate"
                          :label="this.scenario.climate + '%'"
                          style="background-color: #084083; color: #ffffff; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.climate <= 100)" :value="this.scenario.climate"
                          :label="this.scenario.climate + '%'"
                          style="background-color: #08316B; color: #ffffff; "></b-progress-bar>
                      </b-progress>
                    </b-td>
                  </b-tr>
                  <b-tr style=" border-left: 1px solid #e9ecef; border-right: 1px solid #e9ecef;">
                    <b-td class="text-right" style="background-color: #ffffff; font-size:14px; vertical-align: middle;">질병</b-td>
                    <b-td class="text-center" style="background-color: #ffffff; vertical-align: middle;">
                      <b-progress height="2vh" :max="max" style="width:90%;">
                        <b-progress-bar v-if="(this.scenario <= 10)" :value="this.scenario.disease"
                          :label="this.scenario.disease + '%'"
                          style="background-color: #EFF6FC; color: #525f7f; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.disease <= 20)" :value="this.scenario.disease"
                          :label="this.scenario.disease + '%'"
                          style="background-color: #DAE8F5; color: #525f7f; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.disease <= 30)" :value="this.scenario.disease"
                          :label="this.scenario.disease + '%'"
                          style="background-color: #C7DBEF; color: #525f7f; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.disease <= 40)" :value="this.scenario.disease"
                          :label="this.scenario.disease + '%'"
                          style="background-color: #A0CAE1; color: #525f7f; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.disease <= 50)" :value="this.scenario.disease"
                          :label="this.scenario.disease + '%'"
                          style="background-color: #75B3D8; color: #ffffff; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.disease <= 60)" :value="this.scenario.disease"
                          :label="this.scenario.disease + '%'"
                          style="background-color: #3D8DC3; color: #ffffff; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.disease <= 70)" :value="this.scenario.disease"
                          :label="this.scenario.disease + '%'"
                          style="background-color: #1B6AAF; color: #ffffff; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.disease <= 80)" :value="this.scenario.disease"
                          :label="this.scenario.disease + '%'"
                          style="background-color: #0C56A0; color: #ffffff; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.disease <= 90)" :value="this.scenario.disease"
                          :label="this.scenario.disease + '%'"
                          style="background-color: #084083; color: #ffffff; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.disease <= 100)" :value="this.scenario.disease"
                          :label="this.scenario.disease + '%'"
                          style="background-color: #08316B; color: #ffffff; "></b-progress-bar>
                      </b-progress>
                    </b-td>
                  </b-tr>
                  <b-tr style=" border-left: 1px solid #e9ecef; border-right: 1px solid #e9ecef; border-bottom: 1px solid #e9ecef;">
                    <b-td class="text-right" style="background-color: #ffffff; font-size:14px; vertical-align: middle;">전쟁</b-td>
                    <b-td class="text-center" style="background-color: #ffffff; vertical-align: middle;">
                      <b-progress height="2vh" :max="max" style="width:90%;">
                        <b-progress-bar v-if="(this.scenario <= 10)" :value="this.scenario.war"
                          :label="this.scenario.war + '%'"
                          style="background-color: #EFF6FC; color: #525f7f; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.war <= 20)" :value="this.scenario.war"
                          :label="this.scenario.war + '%'"
                          style="background-color: #DAE8F5; color: #525f7f; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.war <= 30)" :value="this.scenario.war"
                          :label="this.scenario.war + '%'"
                          style="background-color: #C7DBEF; color: #525f7f; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.war <= 40)" :value="this.scenario.war"
                          :label="this.scenario.war + '%'"
                          style="background-color: #A0CAE1; color: #525f7f; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.war <= 50)" :value="this.scenario.war"
                          :label="this.scenario.war + '%'"
                          style="background-color: #75B3D8; color: #ffffff; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.war <= 60)" :value="this.scenario.war"
                          :label="this.scenario.war + '%'"
                          style="background-color: #3D8DC3; color: #ffffff; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.war <= 70)" :value="this.scenario.war"
                          :label="this.scenario.war + '%'"
                          style="background-color: #1B6AAF; color: #ffffff; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.war <= 80)" :value="this.scenario.war"
                          :label="this.scenario.war + '%'"
                          style="background-color: #0C56A0; color: #ffffff; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.war <= 90)" :value="this.scenario.war"
                          :label="this.scenario.war + '%'"
                          style="background-color: #084083; color: #ffffff; "></b-progress-bar>
                        <b-progress-bar v-else-if="(this.scenario.war <= 100)" :value="this.scenario.war"
                          :label="this.scenario.war + '%'"
                          style="background-color: #08316B; color: #ffffff; "></b-progress-bar>
                      </b-progress>
                    </b-td>
                  </b-tr>
                </b-tbody>
              </b-table-simple>
            </b-col>
          </b-row>
        </b-col>

        <b-col xl="4">
          <b-card v-if="risk_json" :data="risk_json" body-class="p-0" style="height: 100%;">
            <b-row>
              <b-col>
                <b-table-simple style="table-layout: fixed;">
                  <tbody>
                    <b-th style="font-size:17px; font-weight: 500;">원부자재 종합 RISK</b-th>
                  </tbody>
                </b-table-simple>
              </b-col>
            </b-row>

            <b-row style="padding-top: 30px;">
              <b-col class="text-center">
                <img v-if="this.risk_json.rank == 'A'" style="max-width: 18vh" :src="imgRank_a">
                <img v-else-if="this.risk_json.rank == 'B'" style="max-width: 18vh" :src="imgRank_b">
                <img v-else-if="this.risk_json.rank == 'C'" style="max-width: 18vh" :src="imgRank_c">
                <img v-else-if="this.risk_json.rank == 'D'" style="max-width: 18vh" :src="imgRank_d">
                <img v-else-if="this.risk_json.rank == 'E'" style="max-width: 18vh" :src="imgRank_e">
              </b-col>
            </b-row>

            <b-row>
              <b-col class="text-right" style="padding-top: 30px;">
                <span style="font-size:13px; font-weight: 500;">{{ this.risk_json.price_info_sd }}</span><br>
                <span style="font-size:20px; font-weight: 500;">{{ this.risk_json.price_info_ago }}</span>
              </b-col>
              <b-col xl="0" class="text-center" style="padding-top: 40px;">
                <img style="max-width: 4vh" :src="arrow">
              </b-col>
              <b-col class="text-left" style="padding-top: 30px;">
                <span style="font-size:13px; font-weight: 500;">{{ this.risk_json.price_info_ed }}</span>
                <br>
                <span style="font-size:20px; font-weight: 500;">{{ this.risk_json.price_info_now }} </span>
                <span style="font-size:13px; font-weight: 500;">(</span><span style="font-size:13px; font-weight: 500;"
                  v-bind:class="{ 'up': this.risk_json.price_info_symbol == '▲', 'equal': this.risk_json.price_info_symbol == '-',
                    'down': this.risk_json.price_info_symbol == '▼' }">{{ this.risk_json.price_info_symbol }} </span>
                <span style="font-size:13px; font-weight: 500;">{{ this.risk_json.price_info_per }})</span>
              </b-col>
            </b-row>

            <b-row style="padding-top: 10px;">
              <b-col class="text-right" style="padding-right: 50px; font-weight: 500; font-size:13px;">단위: USD/ton</b-col>
            </b-row>
            <b-row style="padding-top: 30px;">
              <b-col style="padding-left: 30px; font-weight: 500; font-size:1.7vh;">※ 리스크 등급 상세 &nbsp;
                <img id="tooltip-target-2" style="max-width: 2vh" :src="info_circle">
              </b-col>
            </b-row>
            <b-row style="padding-top: 5px;">
              <b-col>
                <b-table-simple>
                  <b-tr class="text-center" style="background-color: #f6f9fc;">
                    <b-th id="risk_id">기준</b-th>
                    <b-th id="risk_id">기준 가격/건수</b-th>
                    <b-th id="risk_id">비교 가격/건수</b-th>
                    <b-th id="risk_id">변동</b-th>
                    <b-th id="risk_id">리스크 등급</b-th>
                  </b-tr>
                  <b-tr class="text-center">
                    <b-td id="risk_id">가격변동</b-td>
                    <b-td id="risk_id">{{ this.risk_json.real_price_ago }}</b-td>
                    <b-td id="risk_id">{{ this.risk_json.real_price_now }}</b-td>
                    <b-td id="risk_id">{{ this.risk_json.real_price_per }}</b-td>
                    <b-td id="risk_id" v-if="this.risk_json.real_price_rank == 'A'" class="risk_a">위험</b-td>
                    <b-td id="risk_id" v-else-if="this.risk_json.real_price_rank == 'B'" class="risk_b">경고</b-td>
                    <b-td id="risk_id" v-else-if="this.risk_json.real_price_rank == 'C'" class="risk_c">주의</b-td>
                    <b-td id="risk_id" v-else-if="this.risk_json.real_price_rank == 'D'" class="risk_d">보통</b-td>
                    <b-td id="risk_id" v-else-if="this.risk_json.real_price_rank == 'E'" class="risk_e">양호</b-td>
                    <b-td id="risk_id" v-else></b-td>
                  </b-tr>
                  <b-tr class="text-center">
                    <b-td id="risk_id">예측변동</b-td>
                    <b-td id="risk_id">{{ this.risk_json.price_prediction_ago }}</b-td>
                    <b-td id="risk_id">{{ this.risk_json.price_prediction_now }}</b-td>
                    <b-td id="risk_id">{{ this.risk_json.price_prediction_per }}</b-td>
                    <b-td id="risk_id" v-if="this.risk_json.price_prediction_rank == 'A'" class="risk_a">위험</b-td>
                    <b-td id="risk_id" v-else-if="this.risk_json.price_prediction_rank == 'B'" class="risk_b">경고</b-td>
                    <b-td id="risk_id" v-else-if="this.risk_json.price_prediction_rank == 'C'" class="risk_c">주의</b-td>
                    <b-td id="risk_id" v-else-if="this.risk_json.price_prediction_rank == 'D'" class="risk_d">보통</b-td>
                    <b-td id="risk_id" v-else-if="this.risk_json.price_prediction_rank == 'E'" class="risk_e">양호</b-td>
                    <b-td id="risk_id" v-else></b-td>
                  </b-tr>
                  <b-tr class="text-center">
                    <b-td id="risk_id">이슈발생</b-td>
                    <b-td id="risk_id">{{ this.risk_json.news_ago }}</b-td>
                    <b-td id="risk_id">{{ this.risk_json.news_now }}</b-td>
                    <b-td id="risk_id">{{ this.risk_json.news_per }}</b-td>
                    <b-td id="risk_id" v-if="this.risk_json.news_rank == 'A'" class="risk_a">위험</b-td>
                    <b-td id="risk_id" v-else-if="this.risk_json.news_rank == 'B'" class="risk_b">경고</b-td>
                    <b-td id="risk_id" v-else-if="this.risk_json.news_rank == 'C'" class="risk_c">주의</b-td>
                    <b-td id="risk_id" v-else-if="this.risk_json.news_rank == 'D'" class="risk_d">보통</b-td>
                    <b-td id="risk_id" v-else-if="this.risk_json.news_rank == 'E'" class="risk_e">양호</b-td>
                    <b-td id="risk_id" v-else></b-td>
                  </b-tr>
                  <b-tr class="text-center" style="border-bottom: 1px solid #e9ecef;">
                    <b-td id="risk_id">시나리오</b-td>
                    <b-td id="risk_id"></b-td>
                    <b-td id="risk_id">{{ this.risk_json.report_now }}</b-td>
                    <b-td id="risk_id"></b-td>
                    <b-td id="risk_id" v-if="this.risk_json.report_rank == 'A'" class="risk_a">위험</b-td>
                    <b-td id="risk_id" v-else-if="this.risk_json.report_rank == 'B'" class="risk_b">경고</b-td>
                    <b-td id="risk_id" v-else-if="this.risk_json.report_rank == 'C'" class="risk_c">주의</b-td>
                    <b-td id="risk_id" v-else-if="this.risk_json.report_rank == 'D'" class="risk_d">보통</b-td>
                    <b-td id="risk_id" v-else-if="this.risk_json.report_rank == 'E'" class="risk_e">양호</b-td>
                    <b-td id="risk_id" v-else></b-td>
                  </b-tr>
                </b-table-simple>
              </b-col>
            </b-row>
          </b-card>
        </b-col>
      </b-row>

      <b-row style="padding-top: 30px; font-size:19px;">
        <b-col>
          <h2>사용변수 시황</h2>
        </b-col>
      </b-row>

      <b-row style="padding-top: 30px;">
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
          <b-button class="btn1" variant="primary" v-on:click="showChart">확인</b-button>
        </b-col>
      </b-row>
      <price-trend-chart v-bind:status2="status2"></price-trend-chart>

      <b-tooltip target="target-1" style="width: fit-content;">
        <div style="text-align: left">
          [유사도 계산 방식]<br>
          - 재해 : 2021년 2월 15일 발생한 텍사스 한파 시기로 지정. <br>
          - 질병 : 2020년 1월 31일 WHO에서 국제적 공중보건 비상사태를 선포하였기에 질병 시기로 지정.<br>
          - 전쟁 : 2022년 2월 24일 발발한 우크라이나-러시아 전쟁 시기로 지정.<br><br>

          1. 정형(예측 가격) : 3개월 중기 예측 가격과 실제 가격과의 비교를 위한 시나리오 구간 3개월 가격을 다음과 같이 지정합니다.<br><br>

          - 재해 : 2021.02.15 - 2021.05.12 (재해는 이전 탐지가 어려운 특징이 있어 발생 시점으로부터 3개월을 비교구간으로 지정)<br>
          - 질병 : 2020.01.01 - 2020.03.25 (코로나는 선포 이전부터 여러 이벤트가 있었기에 이전/이후를 포함하여 3개월을 비교구간으로 지정)<br>
          - 전쟁 : 2022.01.01 - 2022.03.28 (전쟁 발발 이전부터 전쟁이 시작될 것이라는 언론의 언급이 있었기에 이전/이후를 포함하여 3개월을 비교구간으로 지정)<br><br>

          : 3개월 예측 가격과 시나리오 구간 내 가격과의 가격 패턴 유사도를 피어슨 상관분석을 이용하여 계산 후, 보정된 값을 사용합니다.<br><br>

          2. 비정형(뉴스/미디어) : 최근 3개월 카테고리 빈도 발생과 시나리오 탐지를 위하여 시나리오 발생 시점 이후 총 3개월의 빈도 데이터를 다음과 같이 지정합니다.<br><br>

          - 재해 : 2021.02.15 - 2021.05.12<br>
          - 질병 : 2020.01.01 - 2020.03.25<br>
          - 전쟁 : 2022.01.01 - 2022.03.28<br><br>

          : 최근 발생 빈도와 시나리오 이전/이후의 빈도 발생에 대한 패턴 유사도를 피어슨 상관분석을 이용하여 계산 후, 보정된 값을 사용합니다.<br><br>

          ∴ 최종 유사도는 정형 유사도와 비정형 유사도의 평균으로 계산합니다.
        </div>
      </b-tooltip>

      <b-tooltip target="tooltip-target-2" style="width: fit-content;">
        <div style="text-align: left">
          [리스크 산정 기준]<br>
          1. 가격변동 : 전체 기간 실제 가격의 3개월 단위 변동량을 이용하여 최근 3개월(중기)의 변동 비율 산출<br>
          2. 예측변동 : 전체 기간 실제 가격의 1개월 단위 변동량을 이용하여 최근 1개월(단기) 예측 가격의 변동 비율 산출<br>
          3. 이슈발생 : 최근 한 달 간 발생량 대비 최근 일주일 간 발생량의 변동 비율을 산출한 것으로, 영향키워드의 감소는 이상징후가 아닌 것으로 보며, 증가는 관련 이슈 화제성의 증가로 간주<br>
          4. 시나리오 : 유사도 계산 후 보정된 3개의 기후이상 유사도, 질병 유사도, 전쟁 유사도 중 최대 값을 채택<br>

          각 항목의 리스크를 계산하고 가중치를 더하여 최종 리스크를 산정합니다.<br><br>

          [리스크 등급 기준]<br>
          양호 : 0~20%<br>
          보통 : 21~40%<br>
          주의 : 41~60%<br>
          경고 : 61~80%<br>
          위험 : 81~100%<br><br>

          [영향 단어 리스크 등급 기준]<br>
          양호 : 0~25%<br>
          보통 : 26~35%<br>
          주의 : 36~45%<br>
          경고 : 46~60%<br>
          위험 : 61~100%
        </div>
      </b-tooltip>
    </b-container>
  </div>
</template>

<script>

// Components
import RatePerDateTable from '../Tables/RatePerDateTable.vue';
import PriceTrendChart from '../Charts/PriceTrendChart.vue';
import axios from 'axios';
import dayjs from 'dayjs';

export default {
  components: {
    RatePerDateTable,
    PriceTrendChart
  },
  data() {
    return {
      info_circle: require('@/assets/info_circle.png'),
      imgRank_a: require('@/assets/a.png'),
      imgRank_b: require('@/assets/b.png'),
      imgRank_c: require('@/assets/c.png'),
      imgRank_d: require('@/assets/d.png'),
      imgRank_e: require('@/assets/e.png'),
      arrow: require('@/assets/arrow.png'),
      chart1: null,
      chart2: null,
      chart3: null,
      chart4: null,
      chart5: null,
      chart6: null,
      chart7: null,
      chart8: null,
      chart9: null,
      chart10: null,
      selectText: null,
      init: true,
      min: 0,
      max: 100,
      risk_json: {},
      material: 'NI',
      predict_material: 'NI',
      material_list: [
        { value: 'CU', text: '구리' },
        { value: 'AL', text: '알루미늄' },
        { value: 'NI', text: '니켈' },
        { value: 'PP', text: 'PP' },
        { value: 'PC', text: 'PC' },
        { value: 'HR', text: '열연코일' },
      ],

      startDate: this.getF1day(),
      endDate: this.getToday(),

      date: 'd1',
      date_list: [
        { value: 'd1', text: '일별' },
        { value: 'd2', text: '월별' },
        { value: 'd3', text: '연도별' },
      ],
      frequency: 'f1',
      predict_frequency: 'f1',
      frequency_list: [
        { value: "f1", text: "단기(1M)" },
        { value: "f2", text: "중기(3M)" },
        { value: "f3", text: "장기(6M)" }
      ],

      scenario: {},
      status: {
        predict_material: '',
        predict_frequency: ''
      },

      status2: {
        material: '',
        startDate: '',
        endDate: '',
      },

      table_fields: [
        {
          key: 'last_name',
          sortable: true
        },
        {
          key: 'first_name',
          sortable: false
        },
        {
          key: 'age',
          label: 'Person age',
          sortable: true,
          variant: 'danger'
        }
      ],

      series: [],
      chartOptions: {},
    }
  },
  mounted() {
    this.getMaterial();
    this.status.material = this.material;
    this.status.date = this.date;
    this.status.predict_frequency = this.predict_frequency;
    this.status.predict_material = this.predict_material;

    this.status2.material = this.material;
    this.status2.startDate = this.startDate;
    this.status2.endDate = this.endDate;
    this.fetchData();
    this.showRisk();
  },
  methods: {
    keywordMonitoring: function () {
      this.$router.push({ name: 'chart3' });
    },
    predictionPrice: function () {
      this.status.predict_material = this.predict_material;
      this.status.predict_frequency = this.predict_frequency;
    },
    predictPrice: function () {
      // alert('Predict Button Clicked.');
      this.$router.push({ name: 'chart2' });
    },
    searchDate: function () {
      //console.log(this.date);
      if (this.status.date != this.date) {
        // this.status.material = this.material;
        this.status.date = this.date;
      }
    },
    // 오늘 날짜 가져오는 함수
    getToday: function () {
      var date = new Date();
      var year = date.getFullYear();
      var month = ("0" + (1 + date.getMonth())).slice(-2);
      var day = ("0" + date.getDate()).slice(-2);

      return year + "-" + month + "-" + day;
    },
    // 1개월 전 날짜 가져오는 함수 (f1 : 단기, 오늘 날짜 기준)
    getF1day: function () {
      let date = new dayjs();
      date = date.subtract(1, 'month').format('YYYY-MM-DD');

      return date;
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

    // 다른 모델들은 초기에 보이지 않도록 설정한다
    modelHidden: function () {
      for (let i of this.hidden) {
        this.$refs.prediction_chart.toggleSeries(i);
      }
    },
    fetchData: async function () {
      this.status.predict_material = this.predict_material;
      this.status.predict_frequency = this.predict_frequency;

      let frequency;

      if (this.status.predict_frequency == 'f1') {
        frequency = '단기(1M)';
      } else if (this.status.predict_frequency == 'f2') {
        frequency = '중기(3M)';
      } else {
        frequency = '장기(6M)';
      }

      await axios.get("/material1/price_prediction/chart",
        {
          params:
          {
            material: this.predict_material,
            frequency: frequency
          }
        }).then((res) => {
          return res['data'];
        }).then((data) => {
          this.series = data;
          let dateArray = this.series[1].date;
          this.hidden = data[0].hidden;

          if (data.length == 0) {
            return;
          }
          this.chartOptions = {
            chart: {
              toolbar: {
                show: true,
                tools: {
                  download: true,
                  offsetY: -10,
                },
                export: {
                  csv: {
                    filename: `원자재시황예측_${this.status.predict_material}_${frequency}`,
                    columnDelimiter: ',',
                    headerCategory: '날짜',
                    headerValue: dateArray,
                  },
                  svg: {
                    filename: `원자재시황예측_${this.status.predict_material}_${frequency}`,
                  },
                  png: {
                    filename: `원자재시황예측_${this.status.predict_material}_${frequency}`,
                  }
                },
              },
              height: 400,
              type: 'line',
            },
            labels: data[1].date,
            colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#66DA26'],
            xaxis: {
              labels: {
                rotate: 0
              },
              tickAmount: 8,
            },
            yaxis: {
              labels: {
                formatter: function (val) {
                  if (val != null) {
                    return val.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                }
              }
            },
          }
        });

      this.modelHidden();

    },
    showRisk: function () {
      var req = {
        params: {
          material: this.predict_material
        }
      }
      axios.get('/material1/risk/materialMarket_risk', req)
        .then((res) => {
          let result = res['data'][0];
          return result;
        })
        .then((data) => {
          if (data.price_info_per.substring(0, 1) == '-') {
            data.price_info_per = data.price_info_per.substring(1, data.price_info_per.length);
          }
          this.risk_json = data
        });

      axios.get('/material1/scenario/select_scenario_material', req)
        .then((res) => {
          let result = res['data'];
          return result;
        })
        .then((data) => {
          this.scenario = data;

        });
    },

    showTable: function () {
      if (this.status.date != this.date) {
        this.status.material = this.material;
      }
    },
    showChart: function () {
      this.status2.material = this.material;
      this.status2.startDate = this.startDate;
      this.status2.endDate = this.endDate;
    },
    frequencyDate: function () {
      this.endDate = this.getToday();
      if (this.frequency == 'f1') {
        this.startDate = this.getF1day();
      } else if (this.frequency == 'f2') {
        this.startDate = this.getF2day();
      } else if (this.frequency == 'f3') {
        this.startDate = this.getF3day();
      }
    },
    getMaterial: function () {
      if (this.$route.params.material != undefined) {
        this.$route.params.material = this.$route.params.material.toUpperCase();
        this.material = this.$route.params.material;
        this.predict_material = this.$route.params.material;
      }
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

#numberCircle_market {
  border-radius: 50%;
  width: 60px;
  height: 60px;
  padding: 60px;
  background: #fff;
  border: 0.5px solid #00a028;
  color: #666;
  text-align: center;
  font-weight: bold;
  font: 60px Arial, sans-serif;
}

#risk_id {
  padding-left: 0px;
  padding-right: 0px;
  vertical-align: middle;
}

.risk_a {
  color: red
}

.risk_b {
  color: orange
}

.risk_c {
  color: #f5d507
}

.risk_d {
  color: lightgreen
}

.risk_e {
  color: green
}

.tooltip {
  opacity: 1 !important;
}

.tooltip .tooltip-inner {
  max-width: 1050px !important;
  width: 1050px !important;
}
</style>
