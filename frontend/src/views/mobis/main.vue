<template>
  <div>
    <b-container id="content" style="padding: 30px">
      <b-row>
        <b-col v-for="(item, index) in risk_list" :key="index" xl="2" id="riskCard"
          v-on:click="gotoMaterial1($event, item)">
          <card body-class="p-0" style="height: 100%;">
            <b-row align-v="center" slot="header">
              <b-col>
                <h6 class="text-uppercase text-muted ls-1 mb-1"></h6>
                <span style="font-size:17px; font-weight: 500;">{{ item.material }}</span>
                <span style="font-size: 14px;">{{ item.info }}</span>
              </b-col>
            </b-row>
            <b-row>
              <b-col class="text-center">
                <img v-if="item.rank == '위험'" style="max-width: 9vh" :src="imgRank_a">
                <img v-else-if="item.rank == '경고'" style="max-width: 9vh" :src="imgRank_b">
                <img v-else-if="item.rank == '주의'" style="max-width: 9vh" :src="imgRank_c">
                <img v-else-if="item.rank == '보통'" style="max-width: 9vh" :src="imgRank_d">
                <img v-else-if="item.rank == '양호'" style="max-width: 9vh" :src="imgRank_e">
              </b-col>
            </b-row>
            <b-row>
              <b-col class="text-center" style="padding-top: 15px; padding-left:0px; padding-right:0px">
                <span
                  style="font-size:1.7vh; font-weight: 500; text-decoration: underline; text-underline-offset : 5px; text-decoration-color: #ababab;">{{
                    item.price_info_today }} </span>
                <span
                  style="font-size:0.5vh; font-weight: 500; text-decoration: underline; text-underline-offset : 5px; text-decoration-color: #ababab;">{{
                    item.price_info_unit }}</span>
              </b-col>
            </b-row>
            <b-row style="padding-top: 5px;">
              <b-col class="text-center" style="font-size:1.1vh;">
                <span style="font-weight: 500;"
                  v-bind:class="{ 'up': item.price_info_symbol == '▲', 'equal': item.price_info_symbol == '-', 'down': item.price_info_symbol == '▼' }">{{
                    item.price_info_symbol }} </span>
                <span> {{ item.price_info_ago }} </span>
                (<span
                  v-bind:class="{ 'up': item.price_info_symbol == '▲', 'equal': item.price_info_symbol == '-', 'down': item.price_info_symbol == '▼' }">
                  {{ item.price_info_per }} </span>)
              </b-col>
            </b-row>
            <b-row style="padding-bottom:10px; padding-top: 5px;">
              <b-col class="text-center" style="font-size:1.1vh;">
                <span> {{ item.pre_rank }} ▶ {{ item.rank }} </span>
              </b-col>
            </b-row>
            <b-row style="margin-top: 0.5vh;">
              <b-col class="text-title" md="auto" style="padding:0px;">
                <span style="font-size:1.2vh;">가격변동</span>
              </b-col>
              <b-col style="padding:5px;">
                <b-progress height="2vh" :max="max" style="margin: 0 auto;">
                  <b-progress-bar v-if="(item.real <= 10)" :value="item.real" :label="item.real + '%'"
                    style="background-color: #EFF6FC; color: #525f7f; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.real <= 20)" :value="item.real" :label="item.real + '%'"
                    style="background-color: #DAE8F5; color: #525f7f; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.real <= 30)" :value="item.real" :label="item.real + '%'"
                    style="background-color: #C7DBEF; color: #525f7f; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.real <= 40)" :value="item.real" :label="item.real + '%'"
                    style="background-color: #A0CAE1; color: #525f7f; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.real <= 50)" :value="item.real" :label="item.real + '%'"
                    style="background-color: #75B3D8; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.real <= 60)" :value="item.real" :label="item.real + '%'"
                    style="background-color: #3D8DC3; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.real <= 70)" :value="item.real" :label="item.real + '%'"
                    style="background-color: #1B6AAF; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.real <= 80)" :value="item.real" :label="item.real + '%'"
                    style="background-color: #0C56A0; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.real <= 90)" :value="item.real" :label="item.real + '%'"
                    style="background-color: #084083; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.real <= 100)" :value="item.real" :label="item.real + '%'"
                    style="background-color: #08316B; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.real > 100)" :value="item.real" :label="'100%'"
                    style="background-color: #08316B; color: #ffffff; "></b-progress-bar>
                </b-progress>
              </b-col>
            </b-row>
            <b-row style="margin-top: 0.5vh;">
              <b-col class="text-title" md="auto" style="padding:0px;">
                <span style="font-size:1.2vh;">예측변동</span>
              </b-col>

              <b-col style="padding:5px;">
                <b-progress height="2vh" :max="max" style="margin: 0 auto;">
                  <b-progress-bar v-if="(item.predict <= 10)" :value="item.predict" :label="item.predict + '%'"
                    style="background-color: #EFF6FC; color: #525f7f; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.predict <= 20)" :value="item.predict" :label="item.predict + '%'"
                    style="background-color: #DAE8F5; color: #525f7f; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.predict <= 30)" :value="item.predict" :label="item.predict + '%'"
                    style="background-color: #C7DBEF; color: #525f7f; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.predict <= 40)" :value="item.predict" :label="item.predict + '%'"
                    style="background-color: #A0CAE1; color: #525f7f; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.predict <= 50)" :value="item.predict" :label="item.predict + '%'"
                    style="background-color: #75B3D8; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.predict <= 60)" :value="item.predict" :label="item.predict + '%'"
                    style="background-color: #3D8DC3; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.predict <= 70)" :value="item.predict" :label="item.predict + '%'"
                    style="background-color: #1B6AAF; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.predict <= 80)" :value="item.predict" :label="item.predict + '%'"
                    style="background-color: #0C56A0; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.predict <= 90)" :value="item.predict" :label="item.predict + '%'"
                    style="background-color: #084083; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.predict <= 100)" :value="item.predict" :label="item.predict + '%'"
                    style="background-color: #08316B; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.predict > 100)" :value="item.predict" :label="'100%'"
                    style="background-color: #08316B; color: #ffffff; "></b-progress-bar>
                </b-progress>
              </b-col>
            </b-row>
            <b-row style="margin-top: 0.5vh;">
              <b-col class="text-title" md="auto" style="padding:0px;">
                <span style="font-size:1.2vh;">이슈발생</span>
              </b-col>

              <b-col style="padding:5px;">
                <b-progress height="2vh" :max="max" style="margin: 0 auto;">
                  <b-progress-bar v-if="(item.news <= 10)" :value="item.news" :label="item.news + '%'"
                    style="background-color: #EFF6FC; color: #525f7f; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.news <= 20)" :value="item.news" :label="item.news + '%'"
                    style="background-color: #DAE8F5; color: #525f7f; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.news <= 30)" :value="item.news" :label="item.news + '%'"
                    style="background-color: #C7DBEF; color: #525f7f; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.news <= 40)" :value="item.news" :label="item.news + '%'"
                    style="background-color: #A0CAE1; color: #525f7f; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.news <= 50)" :value="item.news" :label="item.news + '%'"
                    style="background-color: #75B3D8; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.news <= 60)" :value="item.news" :label="item.news + '%'"
                    style="background-color: #3D8DC3; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.news <= 70)" :value="item.news" :label="item.news + '%'"
                    style="background-color: #1B6AAF; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.news <= 80)" :value="item.news" :label="item.news + '%'"
                    style="background-color: #0C56A0; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.news <= 90)" :value="item.news" :label="item.news + '%'"
                    style="background-color: #084083; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.news <= 100)" :value="item.news" :label="item.news + '%'"
                    style="background-color: #08316B; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.news > 100)" :value="item.news" :label="'100%'"
                    style="background-color: #08316B; color: #ffffff; "></b-progress-bar>
                </b-progress>
              </b-col>
            </b-row>
            <b-row style="margin-top: 0.5vh;">
              <b-col class="text-title" md="auto" style="padding:0px;">
                <span style="font-size:1.2vh;">시나리오</span>
              </b-col>

              <b-col style="padding:5px;">
                <b-progress height="2vh" :max="max" style="margin: 0 auto;">
                  <b-progress-bar v-if="(item.report <= 10)" :value="item.report" :label="item.report + '%'"
                    style="background-color: #EFF6FC; color: #525f7f; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.report <= 20)" :value="item.report" :label="item.report + '%'"
                    style="background-color: #DAE8F5; color: #525f7f; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.report <= 30)" :value="item.report" :label="item.report + '%'"
                    style="background-color: #C7DBEF; color: #525f7f; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.report <= 40)" :value="item.report" :label="item.report + '%'"
                    style="background-color: #A0CAE1; color: #525f7f; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.report <= 50)" :value="item.report" :label="item.report + '%'"
                    style="background-color: #75B3D8; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.report <= 60)" :value="item.report" :label="item.report + '%'"
                    style="background-color: #3D8DC3; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.report <= 70)" :value="item.report" :label="item.report + '%'"
                    style="background-color: #1B6AAF; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.report <= 80)" :value="item.report" :label="item.report + '%'"
                    style="background-color: #0C56A0; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.report <= 90)" :value="item.report" :label="item.report + '%'"
                    style="background-color: #084083; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.report <= 100)" :value="item.report" :label="item.report + '%'"
                    style="background-color: #08316B; color: #ffffff; "></b-progress-bar>
                  <b-progress-bar v-else-if="(item.report > 100)" :value="item.report" :label="'100%'"
                    style="background-color: #08316B; color: #ffffff; "></b-progress-bar>
                </b-progress>
              </b-col>
            </b-row>

          </card>
        </b-col>
      </b-row>

      <b-row style="padding-top: 40px">
        <b-col xl="6">
          <b-card body-class="p-0" style="height: 100%; border-top: 0px;">
            <b-table-simple class="table1" style="table-layout: fixed; border-top: none; border-bottom: none;">
              <b-thead>
                <b-tr style="background-color: #FFFAF0;">
                  <b-th colspan="7" style="font-size:17px; font-weight:500;">종합 가격 현황</b-th>
                </b-tr>
                <b-tr class="text-center" style="background-color: #f6f9fc;">
                  <b-td id="th_header">구분</b-td>
                  <b-td id="th_header">Cu<span></span></b-td>
                  <b-td id="th_header">Al</b-td>
                  <b-td id="th_header">Ni</b-td>
                  <b-td id="th_header">PP</b-td>
                  <b-td id="th_header">PC</b-td>
                  <b-td id="th_header">HR</b-td>
                </b-tr>
              </b-thead>
              <b-tbody>
                <b-tr class="text-center">
                  <b-td style="vertical-align: middle; font-size:14px;">현재가</b-td>
                  <b-td v-for="(item, index) in multi_price" :key="index">{{ item.price }}<br>(USD/ton)</b-td>
                </b-tr>
                <b-tr class="text-center">
                  <b-td style="vertical-align: middle; font-size: 14px;">변동</b-td>
                  <b-td v-for="(item, index) in multi_price" :key="index"
                    style="padding-left: 0px; padding-right: 0px; vertical-align: middle;">
                    <span
                      v-bind:class="{ 'up': item.variation_status == '▲', 'equal': item.variation_status == '-', 'down': item.variation_status == '▼' }">
                      {{ item.variation_status }}
                    </span>
                    {{ item.variation }}<br>
                    <span v-if="item.variation != ''">
                      (
                      <span
                        v-bind:class="{ 'up': item.variation_status == '▲', 'equal': item.variation_status == '-', 'down': item.variation_status == '▼' }">
                        {{ item.variation_price }}
                      </span>
                      )
                    </span>
                    <span v-else>
                      (
                      <span
                        v-bind:class="{ 'up': item.variation_status == '▲', 'equal': item.variation_status == '-', 'down': item.variation_status == '▼' }">
                        -
                      </span>
                      )
                    </span>
                  </b-td>
                </b-tr>
                <b-tr class="text-center">
                  <b-td style="vertical-align: middle; font-size:14px;">기준일</b-td>
                  <b-td style="padding-left:2vh;" v-for="(item, index) in multi_price" :key="index">{{ item.datetime }}
                    <br>{{ item.frequency }}</b-td>
                </b-tr>
                <b-tr class="text-center">
                  <b-td style="vertical-align: middle; font-size:14px;">기준</b-td>
                  <b-td v-for="(item, index) in multi_price" :key="index">
                    <a v-if="item.url != ''" v-bind:href="item.url" target="_blank">{{ item.unit }}</a>
                    <a v-else>{{ item.unit }}</a></b-td>
                </b-tr>
                <b-tr class="text-center">
                  <b-td style="font-size:14px; vertical-align: middle;">최종수정일</b-td>
                  <b-td colspan="6" style="text-align: right; ">{{ update_time }}</b-td>
                </b-tr>
              </b-tbody>
            </b-table-simple>

          </b-card>
        </b-col>
        <b-col xl="6">
          <b-card body-class="p-0" style="height: 100%; border-top: 0px;">
            <b-table-simple class="table1" style="table-layout: fixed; border-top: none; border-bottom: none;">
              <b-thead>
                <b-tr style="background-color: #FFFAF0;">
                  <b-th colspan="7" style="font-size:17px; font-weight:500;">주요 지표 현황</b-th>
                </b-tr>
                <b-tr class="text-center" style="background-color: #f6f9fc;">
                  <b-th id="th_header">구분</b-th>
                  <b-th id="th_header">두바이유</b-th>
                  <b-th id="th_header">나프타</b-th>
                  <b-th id="th_header">usd</b-th>
                  <b-th id="th_header">eur</b-th>
                  <b-th id="th_header">cny</b-th>
                  <b-th id="th_header">scfi</b-th>
                </b-tr>
              </b-thead>
              <b-tbody>
                <b-tr class="text-center">
                  <b-td style="font-size:14px; vertical-align: middle;">현재가</b-td>
                  <b-td v-for="(data, index) in tableData" :key="index">{{ data.price }}<br>{{ data.unit }}</b-td>
                </b-tr>
                <b-tr class="text-center ">
                  <b-td style="font-size:14px; vertical-align: middle;">변동</b-td>
                  <b-td v-for="(data, index) in tableData" :key="index"
                    style="padding-left: 0px; padding-right: 0px; vertical-align: middle;">
                    <span
                      v-bind:class="{ 'up': data.varianceStatus == '▲', 'equal': data.varianceStatus == '-', 'down': data.varianceStatus == '▼' }">
                      {{ data.varianceStatus }} </span>
                    {{ data.variance }}<br>
                    <span v-if="data.variance !== ''">
                      (
                      <span
                        v-bind:class="{ 'up': data.varianceStatus == '▲', 'equal': data.varianceStatus == '-', 'down': data.varianceStatus == '▼' }">
                        {{ data.varianceRate }}
                      </span>
                      )
                    </span>
                    <span v-else>
                      (
                      <span
                        v-bind:class="{ 'up': data.varianceStatus == '▲', 'equal': data.varianceStatus == '-', 'down': data.varianceStatus == '▼' }">
                        -
                      </span>
                      )
                    </span>
                  </b-td>
                </b-tr>
                <b-tr class="text-center">
                  <b-td style="font-size:14px; vertical-align: middle;">기준일</b-td>
                  <b-td style="padding-left:2vh;" v-for="(data, index) in tableData"
                    :key="index">{{ data.datetime }}<br>{{ data.frequency }}</b-td>
                </b-tr>
                <b-tr class="text-center">
                  <b-td style="font-size:14px; vertical-align: middle;">기준</b-td>
                  <b-td v-for="(data, index) in tableData" :key="index"><a v-bind:href="data.url"
                      target="_blank">{{ data.source }}</a></b-td>
                </b-tr>
                <b-tr class="text-center">
                  <b-td style="font-size:14px; vertical-align: middle;">최종수정일</b-td>
                  <b-td colspan="6" style="text-align: right; ">{{ update_time }}</b-td>
                </b-tr>
              </b-tbody>
            </b-table-simple>

          </b-card>
        </b-col>
      </b-row>

      <b-row style="padding-top: 40px">
        <b-col xl="12">
          <card body-class="p-0" style="height: 100%;">
            <b-row align-v="center" slot="header">
              <b-col>
                <h6 class="text-uppercase text-muted ls-1 mb-1"></h6>
                <span style="font-size:17px; font-weight:500;">가격동향</span>
              </b-col>
              <b-col class="text-right" xl="2">
                <b-button v-if="frequency == 'f1'" id="btn2" variant="primary">1M</b-button>
                <b-button v-else id="btn2" style="background-color: white; color: mediumslateblue;" data-id="f1"
                  v-on:click="btnFrequency">1M</b-button>
                <b-button v-if="frequency == 'f2'" id="btn2" variant="primary">3M</b-button>
                <b-button v-else id="btn2" style="background-color: white; color: mediumslateblue;" data-id="f2"
                  v-on:click="btnFrequency">3M</b-button>
                <b-button v-if="frequency == 'f3'" id="btn2" variant="primary">6M</b-button>
                <b-button v-else id="btn2" style="background-color: white; color: mediumslateblue;" data-id="f3"
                  v-on:click="btnFrequency">6M</b-button>
              </b-col>
            </b-row>
            <b-row>
              <b-col xl="1" class="text-right" style="padding-top: 15px;">
                <b-row v-if="material == 'CU'" class="mb-2 text-right">
                  <b-button id="btn" variant="primary">Cu</b-button>
                </b-row>
                <b-row v-else class="mb-2 text-right">
                  <b-button id="btn" style="background-color: gray; color: white;" data-id="CU"
                    v-on:click="btnMaterial">Cu</b-button>
                </b-row>
                <b-row v-if="material == 'AL'" class="mb-2">
                  <b-button id="btn" variant="primary">Al</b-button>
                </b-row>
                <b-row v-else class="mb-2">
                  <b-button id="btn" style="background-color: gray; color: white;" data-id="AL"
                    v-on:click="btnMaterial">Al</b-button>
                </b-row>
                <b-row v-if="material == 'NI'" class="mb-2">
                  <b-button id="btn" variant="primary">Ni</b-button>
                </b-row>
                <b-row v-else class="mb-2">
                  <b-button id="btn" style="background-color: gray; color: white;" data-id="NI"
                    v-on:click="btnMaterial">Ni</b-button>
                </b-row>
                <b-row v-if="material == 'PP'" class="mb-2">
                  <b-button id="btn" variant="primary">PP</b-button>
                </b-row>
                <b-row v-else class="mb-2">
                  <b-button id="btn" style="background-color: gray; color: white;" data-id="PP"
                    v-on:click="btnMaterial">PP</b-button>
                </b-row>
                <b-row v-if="material == 'PC'" class="mb-2">
                  <b-button id="btn" variant="primary">PC</b-button>
                </b-row>
                <b-row v-else class="mb-2">
                  <b-button id="btn" style="background-color: gray; color: white;" data-id="PC"
                    v-on:click="btnMaterial">PC</b-button>
                </b-row>
                <b-row v-if="material == 'HR'" class="mb-2">
                  <b-button id="btn" variant="primary">HR</b-button>
                </b-row>
                <b-row v-else class="mb-2">
                  <b-button id="btn" style="background-color: gray; color: white;" data-id="HR"
                    v-on:click="btnMaterial">HR</b-button>
                </b-row>

              </b-col>
              <b-col xl="11">
                <MainPriceTrendChart v-bind:status="status"></MainPriceTrendChart>
              </b-col>
            </b-row>

          </card>
        </b-col>
      </b-row>

      <b-row style="padding-top: 40px">
        <b-col xl="6">
          <keyword-news-table v-bind:status="status"></keyword-news-table>
        </b-col>
        <b-col xl="6" style="height: 100%;">
          <effect-keyword-table></effect-keyword-table>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import axios from 'axios';

// Components
import KeywordNewsTable from '../Tables/KeywordNewsTable.vue';
import EffectKeywordTable from '../Tables/EffectKeywordTable.vue';
import MainPriceTrendChart from '../Charts/MainPriceTrendChart.vue';

export default {
  components: {
    KeywordNewsTable,
    EffectKeywordTable,
    MainPriceTrendChart
  },
  data() {
    return {
      imgRank_a: require('@/assets/a.png'),
      imgRank_b: require('@/assets/b.png'),
      imgRank_c: require('@/assets/c.png'),
      imgRank_d: require('@/assets/d.png'),
      imgRank_e: require('@/assets/e.png'),
      risk_list: {},
      risk_scenario: [],
      multi_price: null,
      material: "NI",
      frequency: "f1",
      chart1: null,
      series: [],
      chartOptions: {},
      tableData: [],
      status: {
        material: '',
        frequency: 'f1'
      },
      max: 100,
      update_time: '',
    }
  },
  mounted() {
    this.mainRisk();
    this.mainMultiPrice();
    this.mainPriceTrend();
    this.mainKeyIndexStatus();
  },
  methods: {
    btnMaterial: async function (event) {
      this.material = event.target.getAttribute('data-id');
      this.mainPriceTrend();
    },
    btnFrequency: async function (event) {
      this.frequency = event.target.getAttribute('data-id');
      this.mainPriceTrend();
    },
    mainRisk: async function () {
      axios.get('/main/risk/main_risk')
        .then((res) => {
          let result = res['data'];
          return result;
        })
        .then((data) => {
          this.risk_list = data
          for (let json of this.risk_list) {

            switch (json.rank) {
              case ('A'):
                json.rank = '위험';
                break;
              case ('B'):
                json.rank = '경고';
                break;
              case ('C'):
                json.rank = '주의';
                break;
              case ('D'):
                json.rank = '보통';
                break;
              case ('E'):
                json.rank = '양호';
                break;
            }

            switch (json.pre_rank) {
              case ('A'):
                json.pre_rank = '위험';
                break;
              case ('B'):
                json.pre_rank = '경고';
                break;
              case ('C'):
                json.pre_rank = '주의';
                break;
              case ('D'):
                json.pre_rank = '보통';
                break;
              case ('E'):
                json.pre_rank = '양호';
                break;
            }

            json.price_status = json.price_info.substring(json.price_info.length - 2, json.price_info.length - 1);
            json.price_info = json.price_info.slice(0, -2);

            if (json.price_info_per.substring(0, 1) != '-') {
              json.price_info_per = "+" + json.price_info_per;
            }
          }

          // 원자재별 시황 사용예측 리스크 (프로그레스바)
          axios.get('/main/risk/materialMarket_risk')
            .then((res) => {
              let result = res['data'];
              return result;
            })
            .then((data) => {
              for (const [i, risk] of this.risk_list.entries()) {
                risk.real = data[i].real_price_per;
                risk.predict = data[i].price_prediction_per;
                risk.news = data[i].news_per;
                risk.report = data[i].report_per;
              }
            });
        })
    },
    mainMultiPrice: async function () {
      // 종합가격 현황 테이블
      axios.get('/main/scenario/multi_price')
        .then((res) => {
          let result = res['data'];
          return result;
        })
        .then((data) => {
          for (let d of data) {
            d.price = d.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            d.variation = d.variation.toString();

            if (d.variation.substring(0, 1) != '-') {
              d.variation_price = "+" + d.variation_price;
            }
            if (d.variation.substring(0, 1) == '-') {
              d.variation = d.variation.substring(1, d.variation.length);
            }

          }
          this.multi_price = data;
          this.update_time = this.multi_price[0].update_time;
        })
    },
    mainPriceTrend: function () {
      this.status.material = this.material;
      if (this.frequency == 'f1') {
        this.status.frequency = 'f1'
      } else if (this.frequency == 'f2') {
        this.status.frequency = 'f2'
      } else if (this.frequency == 'f3') {
        this.status.frequency = 'f3'
      }
    },
    mainKeyIndexStatus: async function () {
      // 주요 지표 현황 테이블
      axios.get('/main/real_price_trend/key_index_status')
        .then((res) => {
          return res['data'];
        })
        .then((data) => {
          for (let d of data) {
            if (d.price != "") {
              d.price = d.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

              if (d.varianceRate.substring(0, 1) != '-') {
                d.varianceRate = "+" + d.varianceRate;
              }

              d.variance = d.variance.toString();
              if (d.variance.substring(0, 1) == '-') {
                d.variance = d.variance.substring(1, d.variance.length);
              }
            }

          }
          this.tableData = data;
        })
    },

    gotoMaterial1: async function ($event, item) {
      await this.$router.push({ name: '/' })
      await this.$router.push({ name: 'materialMarket1', params: item })
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
  background-color: #242445;
}

.header1 {
  color: red;
}

.header2 {
  color: white;
}

.text-title {
  width: 4.5em;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5em;
}

#riskTitle {
  font-size: 20px;
}

#btn {
  padding: 5px;
  margin-left: 20px;
  width: 50%;
  font-size: 13px;
  font-weight: 50;
}

#btn2 {
  padding: 5px 15px;
  font-size: 13px;
  font-weight: 50;
}

#numberCircle_main {
  color: #666;
  border: 0.5px solid #00a028;
  border-radius: 50% !important;
  font-size: 1rem;
  width: 2em;
}

#riskCircle_middle {
  border-radius: 50%;
  width: 45px;
  height: 45px;
  padding: 65px;
  background: #fff;
  border: 0.5px solid #00a028;
  color: #666;
  text-align: center;
  font-weight: bold;
  font: 45px Arial, sans-serif;
}

#riskCard:hover {
  cursor: pointer;
}

.card-header {
  background-color: #FFFAF0;
}

.tooltip {
  opacity: 1 !important;
}

.tooltip .tooltip-inner {
  max-width: 1050px !important;
  width: 1050px !important;
}
</style>
