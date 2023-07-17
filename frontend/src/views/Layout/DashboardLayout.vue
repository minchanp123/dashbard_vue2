<template>
  <div class="wrapper">
    <!-- <notifications></notifications> -->
    <header class="chart1_header">
      <b-col xl="6">
        <b-row>
          <h1 class="h1_header1">&nbsp;&nbsp;R</h1>
          <h1 class="h1_header2">aw&nbsp;m</h1>
          <h1 class="h1_header2">aterial&nbsp;</h1>
          <h1 class="h1_header1">M</h1>
          <h1 class="h1_header2">anagement&nbsp;</h1>
          <h1 class="h1_header1">S</h1>
          <h1 class="h1_header2">ystem</h1>
          <h1 class="h1_header2" style="font-size: 18px; font-weight: normal;">&nbsp; (원자재 시황관리 시스템)</h1>
        </b-row>
      </b-col>

      <b-col xl="3"></b-col>
      <b-col class="text-right" xl="1" style="padding-top: 1vh; padding-right: 0.5vh;">
        <img id="target-3" style="max-width: 2vh; background-color: #ffffff; border-radius: 100%;" :src="info_circle">
      </b-col>

      <b-col style="padding: 0.3vh; color:#f6f9fc;" xl="2">
        <b-form-file encType="multipart/form-data" ref="doc" v-model="file" size="sm" @change="onFileChange"
          placeholder="업로드 (csv, pdf) 파일 선택" style="font-size: 1.2vh;"></b-form-file>
      </b-col>

      <b-tooltip target="target-3" id="upload-tooltip">
        <!--
          텍스트 가운데정렬: 아래 div태그 삭제
          개발자모드에서
          .tooltip .tooltip-inner{
            width: fit-content !important;
          }
          위의 스타일 추가하면 툴팁 박스 크기 조절 되지만 현재 파일에 스타일 추가하면 적용 안됨
        -->
        <div style="text-align: left">
          [가격 업로드]<br>
          PP, PC, BPA, HR 항목의 날짜와 가격 정보를 입력하여 CSV파일을 업로드 합니다.<br>

          <p class="download" v-on:click="downloadFile('sample.csv')">업로드샘플 다운로드</p>
          * 참고<br>
          datetime : YYYY-MM-DD, 오름차순으로 기입<br>
          price : 특수문자(,) 없이 숫자만 기입<br>
          material_other : BPA의 경우만 bpa 기입, 그 외 공백<br><br>

          [보고서 업로드]<br>
          비철금속 보고서 명 : _bm_<br>
          철강 보고서 명 : _steel_<br>
          석유화학 보고서 명 : bm, steel 외<br>
          각 보고서 파일명에 위와 같은 단어가 있는지 확인 후 PDF파일을 업로드 합니다.<br><br>

          [보고서 업로드 파일명 Rule]<br>
          petro : 석유화학 / steel : 금속 / bm : 비철금속 / energy : 에너지 / oil : 석유<br><br>

          ex)<br>
          steel_monthly_jan22.pdf => 금속_월간_22년도 01월 보고서<br>
          bm_2q_230306.pdf => 비철금속_2분기_23년도 03월 보고서

          <!-- [가격 업로드]<br>
          PP, PC, BPA, HR 항목의 날짜와 가격 정보를 입력하여 파일을 업로드(csv) 합니다.<br><br>

          [보고서 업로드]<br>
          비철금속 보고서 명 : _bm_ <br>
          철강 보고서 명 : _steel_ <br>
          석유화학 보고서 명 : bm, steel 외<br>
          각 보고서 파일명에 위와 같은 단어가 있는지 확인 후 업로드(pdf) 합니다.<br> -->
        </div>
      </b-tooltip>
    </header>

    <side-bar :class="{ sidebar_default: scrollPosition == 0, sidebar_scroll: scrollPosition > 0 }">

      <!-- 종합상환판 -->
      <b-row v-if="path != 'main'">
        <b-button id="btnId" variant="outline-danger" style="padding: 1rem 1rem; border-width: 0px;" v-on:click="mainDashBoard">
          <i class="ni ni-single-copy-04" style="font-size: 25px;">
            <span style="font-size: 16px;"><br>종합<br>상황판</span>
          </i>
        </b-button>
      </b-row>
      <b-row v-else>
        <b-button variant="dark" style="padding: 1rem 1rem; border-width: 0px; background-color: #5e72e4;" v-on:click="mainDashBoard">
          <i class="ni ni-single-copy-04" style="font-size: 25px;">
            <span style="font-size: 16px;"><br>종합<br>상황판</span>
          </i>
        </b-button>
      </b-row>

      <!-- 원자재별 시황 -->
      <b-row v-if="path == 'materialMarket1' || path == 'materialMarket2'" class="mt-3">
        <b-dropdown id="material_in" size="sm" variant="link" toggle-class="text-decoration-none" no-caret>
          <template #button-content>
            <i class="ni ni-money-coins" style="font-size: 25px;"><span style="font-size: 16px;"><br>원자재별 시황</span></i>
          </template>
          <b-dropdown-item class="drop_item" id="material_item" v-on:click="materialMarket1">시황 예측</b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item class="drop_item" id="material_item" v-on:click="materialMarket2">시황모니터링</b-dropdown-item>
        </b-dropdown>

      </b-row>
      <b-row v-else class="mt-3">
        <b-dropdown id="material_out" size="sm" variant="link" toggle-class="text-decoration-none" no-caret>
          <template #button-content>
            <i class="ni ni-money-coins" style="font-size: 25px;"><span style="font-size: 16px;"><br>원자재별 시황</span></i>
          </template>
          <b-dropdown-item class="drop_item" id="material_item" v-on:click="materialMarket1">시황 예측</b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item class="drop_item" id="material_item" v-on:click="materialMarket2">시황모니터링</b-dropdown-item>
        </b-dropdown>
      </b-row>

      <!-- 키워드 모니터링 -->
      <b-row v-if="path == 'keywordMonitoring1' || path == 'keywordMonitoring2'" class="mt-3">

        <b-dropdown id="material_in" size="sm" variant="link" toggle-class="text-decoration-none" style="width: 100%;"
          no-caret>
          <template #button-content>
            <i class="ni ni-laptop" style="font-size: 25px;"><span style="font-size: 16px;"><br>키워드<br>모니터링</span></i>
          </template>
          <b-dropdown-item class="drop_item" v-on:click="keywordMonitoring1">원자재</b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item class="drop_item" v-on:click="keywordMonitoring2">협력사</b-dropdown-item>
        </b-dropdown>
      </b-row>

      <b-row v-else class="mt-3">
        <b-dropdown id="material_out" size="sm" variant="link" toggle-class="text-decoration-none" style="width: 100%;"
          no-caret>
          <template #button-content>
            <i class="ni ni-laptop" style="font-size: 25px;"><span style="font-size: 16px;"><br>키워드<br>모니터링</span></i>
          </template>
          <b-dropdown-item class="drop_item" v-on:click="keywordMonitoring1">원자재</b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item class="drop_item" v-on:click="keywordMonitoring2">협력사</b-dropdown-item>
        </b-dropdown>
      </b-row>

    </side-bar>
    <div class="main-content">

      <div @click="$sidebar.displaySidebar(false)">
        <fade-transition :duration="200" origin="center top" mode="out-in">
          <!-- your content here -->
          <router-view></router-view>
        </fade-transition>
      </div>
      <content-footer v-if="!$route.meta.hideFooter"></content-footer>
    </div>
  </div>
</template>
<script>
/* eslint-disable no-new */
import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';

function hasElement(className) {
  return document.getElementsByClassName(className).length > 0;
}

function initScrollbar(className) {
  if (hasElement(className)) {
    new PerfectScrollbar(`.${className}`);
  } else {
    // try to init it later in case this component is loaded async
    setTimeout(() => {
      initScrollbar(className);
    }, 100);
  }
}
import axios from 'axios';
import { FadeTransition } from 'vue2-transitions';
import SideBar from '../../components/SidebarPlugin/SideBar.vue';

export default {
  components: {
    FadeTransition,
    SideBar
  },
  data() {
    return {
      info_circle: require('@/assets/info_circle.png'),
      path: null,
      pathHeight: null,
      //path: "main",
      //pageHeight: 150,
      m_show: false,
      k_show: false,
      m_page_status: null,
      k_page_status: null,
      m_list_fix: false,
      k_list_fix: false,
      scrollPosition: 0,
      file: null,

    }
  },
  methods: {
    initScrollbar() {
      let isWindows = navigator.platform.startsWith('Win');
      if (isWindows) {
        initScrollbar('sidenav');
      }
    },
    updateScroll() {
      this.scrollPosition = window.scrollY;
    },
    mainDashBoard: function () {
      this.$router.push({ name: 'main' }); //종합상황판
      this.path = "main";
      this.pageHeight = 150;
      this.m_list_fix = false;
      this.k_list_fix = false;
    },
    materialMarket1: function () {
      this.$router.push({ name: 'materialMarket1' }); //원자재별 시황 - 시황예측
      this.path = "materialMarket1";
      this.pageHeight = 150;
      this.m_list_fix = true;
      this.k_list_fix = false;
    },
    materialMarket2: function () {
      this.$router.push({ name: 'materialMarket2' }); //원자재별 시황 - 시황모니터링
      this.path = "materialMarket2";
      this.pageHeight = 150;
      this.m_list_fix = true;
      this.k_list_fix = false;
    },
    keywordMonitoring1: function () {
      this.$router.push({ name: 'keywordMonitoring1' }); //키워드 모니터링 - 원자재
      this.path = "keywordMonitoring1";
      this.pageHeight = 150;
      this.m_list_fix = false;
      this.k_list_fix = true;
    },
    keywordMonitoring2: function () {
      this.$router.push({ name: 'keywordMonitoring2' }); //키워드 모니터링 - 협력사
      this.path = "keywordMonitoring2";
      this.pageHeight = 150;
      this.m_list_fix = false;
      this.k_list_fix = true;
    },
    nowPage: function () {
      //console.log(this.$router.history.current.name)
      this.path = this.$router.history.current.name;

      //원자재별 시황 사이드바 리스트 고정
      if (this.path == "materialMarket1" || this.path == "materialMarket2") {
        this.m_list_fix = true;
      }

      if (this.path == "keywordMonitoring1" || this.path == "keywordMonitoring2") {
        this.k_list_fix = true;
      }
    },

    onFileChange: async function (e) {

      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;


      if (files[0].name.indexOf("csv") != -1) {
        this.csvInput(files[0]);
      } else if (files[0].name.indexOf("pdf") != -1) {
        this.pdfInput(files[0]);
      }

    },
    csvInput: async function (file) { //csv업로드
      let promise = new Promise((resolve, reject) => {
        var reader = new FileReader();
        var vm = this;
        reader.onload = e => {
          resolve((vm.fileinput = reader.result));
        };
        reader.readAsText(file);
      });

      promise.then((result) => {
        var req = {
          name: this.file.name,
          csv: this.fileinput
        }
        return req;
      },
        error => {
          console.log(error);
        }
      ).then((req) => {
        var params = JSON.stringify(req);

        try {
          axios({
            method: "post",
            url: "./upload/upload_csv",
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            data: params
          }).then((res) => {
            let message = res['data'];
            alert(message);
          });

        } catch (err) {
          alert(err);
        }

        this.$refs['doc'].reset();

      });

    },
    pdfInput: async function (file) { //pdf 업로드

      let promise = new Promise((resolve, reject) => {
        var reader = new FileReader();
        var vm = this;

        reader.onerror = reject;

        reader.onload = e => {
          resolve((vm.fileinput = reader.result));
        };

        reader.readAsDataURL(file);
      });

      promise.then((reault) => {
        let formData = new FormData();
        formData.append('pdf', this.file);

        return formData;
      },
        error => {
          /* handle an error */
          console.log(error);
        }
      ).then((req) => {
        var formData = req;

        const config = {
          headers: {
            'content-type': 'multipart/form-data'
          },
        };

        try {
          console.log("file info", this.file.name);
          axios.post("./upload/upload_pdf", formData, config);
          alert('전송 완료: ', this.file.name);
        } catch (err) {
          alert(err);
        }
      });
    },
    downloadFile(title) {
      const config = {
        headers: {
          "Content-Type": "blob"
        },
        url: "http://10.240.252.22/download",
        method: "GET",
        params: {
          title: title
        },
        responseType: "blob",
      }
      axios(config)
        .then((res) => {
          console.log('download_csv');
          // 다운로드 요청을 처리할 임시 링크 엘리먼트 생성
          const href = URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.href = href;
          // 링크 엘리먼트에 download 속성 지정
          link.setAttribute('download', decodeURIComponent(title));
          document.body.appendChild(link);
          link.click();
          // 임시로 생성한 링크 엘리먼트 삭제
          document.body.removeChild(link);
          URL.revokeObjectURL(href);
        })
    }

  },
  mounted() {
    this.initScrollbar();
    this.nowPage();
    window.addEventListener('scroll', this.updateScroll);
  },
  watch: {
    $route: {
      handler() {
        this.nowPage();
      },
    }
  }
};
</script>
<style lang="scss">
.container {
  max-width: 10000px;
}

.navbar-vertical.navbar-expand-md .navbar-brand {
  display: none;
}

.nav-item.dropdown {
  display: none;
}

#btnId {
  color: #5e72e4;
}

#btnId:hover {

  background-color: #5e72e4;
  color: white;

}

.chart1_header {
  display: flex;
  height: 52px;
  background-color: #242445;
}

.h1_header1 {
  color: #b5b4ff;
  font-size: 22px;
  line-height: 50px;
  padding: 0 !important;
  margin: 0 !important;
}

.h1_header2 {
  color: white;
  font-size: 22px;
  line-height: 50px;
}

.sidebar_default {
  margin-top: 52px;
  position: absolute;
  height: 100%;
}

.sidebar_scroll {
  position: fixed;
  height: 100%;
}

#fade {
  cursor: pointer;
  font-size: 12px;
}

#fadeSpan1:hover {
  background-color: #5e72e4;
  color: white;
}

#fadeSpan2 {
  background-color: #5e72e4;
  color: white;
}

.dropdown-toggle {
  white-space: normal;
}

#material_in__BV_toggle_ {
  width: 100%;
  padding: 0px;
  height: 112px;
  background-color: #5e72e4;
  color: white;
}

#material_out__BV_toggle_ {
  width: 100%;
  padding: 0px;
  height: 112px;
}

#material_out__BV_toggle_:hover {
  width: 100%;
  background-color: #5e72e4;
  color: white;
}

.dropdown-toggle:after {
  display: none;
}

.dropdown-menu {
  width: 82px !important;
  min-width: 82px;
  height: 112px;
}

#material_item {
  padding-left: 0.2rem;
}

.drop_item:hover {
  padding-left: 0.2rem;
  background-color: #5e72e4;
  color: #FFFFFF;
}

.download {
  color: #FFCC00;
  font-size: 15px;
}

.download:hover {
  cursor: pointer;
}

.custom-file-input~.custom-file-label[data-browse]:after {
  content: "파일선택";
}

#upload-tooltip .tooltip-inner {
  width: fit-content !important;
}
</style>
