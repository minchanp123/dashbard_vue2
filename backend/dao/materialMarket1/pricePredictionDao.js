// const dbConnect = require("../connect");
const real_price_trend = require("../../model/REAL_PRICE_TREND");
const price_prediction = require("../../model/PRICE_PREDICTION");

const express = require("express");
var router = express.Router();

const { getToday } = require('../../common/common');

// dbConnect();

// 원자재별 시황 :: 원자재 시황 예측 차트 - 실제 / 예측 데이터 조회
router.get("/chart", async function (req, res, next) {
  try {
    var dateArr = [];
    var realArr = [];
    var uNArr = []; // 와이즈넛 데이터를 넣는 배열
    var uYArr = []; // 앙상블 데이터를 넣는 배열
    var hArr = []; // 현대모비스 데이터를 넣는 배열

    var arr = [];
    var name = ["실제가격"];
    let now = await getToday();
    let count;
    let unstructured_N;
    let unstructured_Y;
    let hyundai;

    let { material, frequency } = req.query;

    // 원자재가 구리, 알루미늄, 니켈일 때
    // 실제 가격 : 40개(1M), 120개(3M), 240개(6M)
    // 예측 가격 : 20개(1M), 60개(3M), 120개(6M)
    if (material == "CU" || material == "AL" || material == "NI") {
      count = 40;
    }
    // 원자재가 PP, PC, 열연코일일 때
    // 실제 가격 : 8개(1M), 24개(3M), 48개(6M)
    // 예측 가격 : 4개(1M), 12개(3M), 24개(6M)
    else if (material == "PP" || material == "PC" || material == "HR") {
      count = 8;
    }

    // 사용자가 선택한 주기에 맞는 필드 데이터 가져오기
    // 와이즈넛 => unstructured_N
    // 앙상블 => unstructured_Y
    // 현대 => hyundai
    if (frequency[3] == "1") {
      unstructured_N = "$unstructured_1N";
      unstructured_Y = "$unstructured_1Y";
      hyundai = "$hyundai_1";
    } else if (frequency[3] == "3") {
      count = count * 3;
      unstructured_N = "$unstructured_3N";
      unstructured_Y = "$unstructured_3Y";
      hyundai = "$hyundai_3";
    } else if (frequency[3] == "6") {
      count = count * 6;
      unstructured_N = "$unstructured_6N";
      unstructured_Y = "$unstructured_6Y";
      hyundai = "$hyundai_6";
    }

    // 실제데이터 데이터 가져오기(최신 날짜 기준 해당 데이터 갯수 만큼)
    const real_data = await real_price_trend.aggregate([
      {
        $project: {
          _id: 0,
          datetime: {
            $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
          },
          price: 1,
          material: 1,
          material_other: 1,
        },
      },
      {
        $match: {
          material: material,
          material_other: "",
          datetime: { $lte: now },
        },
      },
      { $sort: { datetime: -1 } },
      { $limit: count },
      { $sort: { datetime: 1 } },
    ]);

    // 실제 가격 데이터의 날짜와 가격을 각 배열에 넣어준다.
    // 예측 가격 배열에는 실제 가격 데이터 만큼 null 값을 넣어준다.
    for (i of real_data) {
      dateArr.push(i.datetime);
      realArr.push(i.price);
      uNArr.push(null);
      uYArr.push(null);
      hArr.push(null);
    }

    // 예측 가격 배열의 마지막을 실제 가격 마지막 데이터를 넣어주어
    // 예측 가격의 시작점을 실제 가격의 마지막 데이터부터 시작하도록 한다.
    let date = dateArr[dateArr.length - 1];
    uNArr[uNArr.length - 1] = realArr[realArr.length - 1];
    uYArr[uYArr.length - 1] = realArr[realArr.length - 1];
    hArr[hArr.length - 1] = realArr[realArr.length - 1];

    // 예측데이터 가져오기(선택한 주기에 맞는 필드와 해당 데이터 갯수 만큼)
    let predict_data = await price_prediction.aggregate([
      {
        $project: {
          _id: false,
          datetime: {
            $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
          },
          unstructured_N: unstructured_N,
          unstructured_Y: unstructured_Y,
          hyundai: hyundai,
          material: 1,
        },
      },
      { $match: { material: material, datetime: { $gt: date } } },
      { $limit: count / 2 },
    ]);

    // 예측 가격의 날짜와 데이터를 각 배열에 넣어준다.
    // 예측 가격의 데이터가 null이 아닌 값을 필드에 따라 배열에 넣어준다.
    for (i of predict_data) {
      dateArr.push(i.datetime);

      if (i.unstructured_N != null) {
        uNArr.push(i.unstructured_N);
      }
      if (i.unstructured_Y != null) {
        uYArr.push(i.unstructured_Y);
      }
      if (i.hyundai != null) {
        hArr.push(i.hyundai);
      }
    }

    // 데이터가 null이 아니면
    // 차트 legend name 배열에 이름을 추가하고
    // 앞에서 저장한 배열을 push 한다.
    var array = [realArr];
    if (predict_data[0].unstructured_N != null) {
      name.push("와이즈넛");
      array.push(uNArr);
    }
    if (predict_data[0].unstructured_Y != null) {
      name.push("앙상블");
      array.push(uYArr);
    }
    if (predict_data[0].hyundai != null) {
      name.push("현대모비스");
      array.push(hArr);
    }

    // default 모델 구하기
    // 차트에서 먼저 보여줄 모델을 구한다.
    let hidden = "";
    let data = await price_prediction.find({
      material: material,
      default: { $regex: frequency[3] },
    });
    if (data[0].default.includes("N")) {
      hidden = "와이즈넛";
    } else if (data[0].default.includes("Y")) {
      hidden = "앙상블";
    } else if (data[0].default.includes("hyundai")) {
      hidden = "현대모비스";
    }

    // 다른 모델들은 초기에 보이지 않도록 설정한다.
    for (i of name) {
      if (i == "실제가격" || i == hidden) {
      } else {
        arr.push(i);
      }
    }

    // 실제가격/비정형 제외/비정형 포함 데이터 갯수 맞춰주기(csv 추출하기 위해)
    for (var i = array[0].length; i < array[1].length; i++) {
      array[0].push(null);
    }

    // 소수점 제거
    for (const [i, element] of array.entries()) {
      for (const [j, element2] of element.entries()) {
        if (element[j] != null) {
          element[j] = element[j].toFixed(0);
        }
      }
    }

    var result = [];
    for (const [i, element] of array.entries()) {
      var obj = {};
      obj.name = name[i];
      obj.data = element;
      obj.date = dateArr;
      obj.hidden = arr;
      result.push(obj);
    }

    res.send(result);
  } catch (e) {
    res.json({
      message: "데이터 조회 실패",
      error: e,
    });
  }
});

// 원자재별 시황 :: 원자재 시황 예측 테이블
router.get("/select_price_prediction", async function (req, res, next) {
  let { predict_material } = req.query;

  var field = ["current", "month1", "month3", "month6"];

  let count1;
  let count3;
  let count6;

  if ( predict_material == "CU" || predict_material == "AL" || predict_material == "NI" ) {
    // 원자재가 CU 또는 AL 또는 NI일 때 가져올 데이터 개수
    // 1개월 후: 20개, 3개월 후: 60개, 6개월 후: 120개
    count1 = 20;
    count3 = 60;
    count6 = 120;
  } else {
    // 원자재가 PC 또는 PP 또는 HR일 때 가져올 데이터 개수
    // 1개월 후: 4개, 3개월 후: 12개, 6개월 후: 24개
    count1 = 4;
    count3 = 12;
    count6 = 24;
  }

  let now = new Date();
  now.setHours(9, 0, 0, 0);

  let result = [];
  let json_N = {};
  let json_Y = {};
  let hyundai = {};

  main();

  async function main() {
    await getCurrent();
    await getMonth1();
    await getMonth3();
    await getMonth6();

    await getPrepare();
  }

  // 현재값 가져오는 함수
  async function getCurrent() {
    let ret = await real_price_trend.find(
        {
          material: predict_material,
          material_other: "",
        },
        { _id: 0, datetime: 1, price: 1 }
      )
      .sort({ datetime: -1 })
      .limit(1);

    json_N[field[0]] = ret[0].price;
    json_Y[field[0]] = ret[0].price;
    hyundai[field[0]] = ret[0].price;

    now = ret[0].datetime;
    now.setDate(now.getDate() + 1);

  }

  // 1개월 후 예측값 가져오는 함수
  async function getMonth1() {
    let month1 = await price_prediction.find(
      {
        material: predict_material,
        datetime: { $gte: now },
      },
      {
        unstructured_1N: 1,
        unstructured_1Y: 1,
        hyundai_1: 1,
        datetime: 1,
        _id: 0,
      }
    )
      .limit(count1);

    month1 = month1.reverse();
    let existMonth1 = {};
    let month1_status1 = false;
    let month1_status2 = false;
    let month1_hyundai = false;

    for (i of month1) {
      if (i.unstructured_1N != null && month1_status1 == false) {
        // 쿼리 결과에서 unstructured_1N이 null이 아닌 값 중에 가장 최신 데이터
        existMonth1.unstructured_1N = i.unstructured_1N;
        json_N[field[1]] = existMonth1.unstructured_1N;

        month1_status1 = true;
      }

      if (i.unstructured_1Y != null && month1_status2 == false) {
        // 쿼리 결과에서 unstructured_1Y이 null이 아닌 값 중에 가장 최신 데이터
        existMonth1.unstructured_1Y = i.unstructured_1Y;

        json_Y[field[1]] = existMonth1.unstructured_1Y;

        month1_status2 = true;
      }

      if (i.hyundai_1 != null && month1_hyundai == false) {
        // 쿼리 결과에서 unstructured_1Y이 null이 아닌 값 중에 가장 최신 데이터
        existMonth1.hyundai_1 = i.hyundai_1;

        hyundai[field[1]] = existMonth1.hyundai_1;

        month1_hyundai = true;
      }

      if (
        month1_status1 == true &&
        month1_status2 == true &&
        month1_hyundai == true
      ) {
        break;
      }

      if (existMonth1.unstructured_1N != undefined) {
        // 쿼리 결과에서 unstructured_1N 데이터가 모두 없을 경우 빈 값 넣어줌
        json_N[field[1]] = "";
      }

      if (existMonth1.unstructured_1Y != undefined) {
        // 쿼리 결과에서 unstructured_1N 데이터가 모두 없을 경우 빈 값 넣어줌
        json_Y[field[1]] = "";
      }

      if (existMonth1.hyundai_1 != undefined) {
        // 쿼리 결과에서 hyundai_1 데이터가 모두 없을 경우 빈 값 넣어줌
        hyundai[field[1]] = "";
      }
    }

    if (month1.length == 0) {
      // 조회된 쿼리 결과가 없을 때 빈 값 넣어줌
      json_N[field[1]] = "";
      json_Y[field[1]] = "";
      hyundai[field[1]] = "";
    }
  }

  // 3개월 후 예측값
  async function getMonth3() {
    let month3 = await price_prediction
      .find(
        {
          material: predict_material,
          datetime: { $gte: now },
        },
        {
          unstructured_3N: 1,
          unstructured_3Y: 1,
          hyundai_3: 1,
          datetime: 1,
          _id: 0,
        }
      )
      .limit(count3);

    month3 = month3.reverse();
    let existMonth3 = [];
    let month3_status1 = false;
    let month3_status2 = false;
    let month3_hyundai = false;
    for (i of month3) {
      if (i.unstructured_3N != null && month3_status1 == false) {
        // 쿼리 결과에서 unstructured_3N이 null이 아닌 값 중에 가장 최신 데이터
        existMonth3.unstructured_3N = i.unstructured_3N;
        json_N[field[2]] = existMonth3.unstructured_3N;
        month3_status1 = true;
      }

      if (i.unstructured_3Y != null && month3_status2 == false) {
        // 쿼리 결과에서 unstructured_3N이 null이 아닌 값 중에 가장 최신 데이터
        existMonth3.unstructured_3Y = i.unstructured_3Y;
        json_Y[field[2]] = existMonth3.unstructured_3Y;

        month3_status2 = true;
      }

      if (i.hyundai_3 != null && month3_hyundai == false) {
        // 쿼리 결과에서 unstructured_1Y이 null이 아닌 값 중에 가장 최신 데이터
        existMonth3.hyundai_3 = i.hyundai_3;
        hyundai[field[2]] = existMonth3.hyundai_3;

        month3_hyundai = true;
      }

      if (
        month3_status1 == true &&
        month3_status2 == true &&
        month3_hyundai == true
      ) {
        break;
      }

      if (existMonth3.unstructured_3N != undefined) {
        // 쿼리 결과에서 unstructured_3N 데이터가 모두 없을 경우 빈 값 넣어줌
        json_N[field[2]] = "";
      }

      if (existMonth3.unstructured_3Y != undefined) {
        // 쿼리 결과에서 unstructured_3N 데이터가 모두 없을 경우 빈 값 넣어줌
        json_Y[field[2]] = "";
      }

      if (existMonth3.hyundai_3 != undefined) {
        // 쿼리 결과에서 hyundai_3 데이터가 모두 없을 경우 빈 값 넣어줌
        hyundai[field[2]] = "";
      }
    }

    if (month3.length == 0) {
      // 조회된 쿼리 결과가 없을 때 빈 값 넣어줌
      json_N[field[2]] = "";
      json_Y[field[2]] = "";
      hyundai[field[2]] = "";
    }
  }

  // 6개월 후 예측값
  async function getMonth6() {
    let month6 = await price_prediction
      .find(
        {
          material: predict_material,
          datetime: { $gte: now },
        },
        {
          unstructured_6N: 1,
          unstructured_6Y: 1,
          hyundai_6: 1,
          datetime: 1,
          _id: 0,
        }
      )
      .limit(count6);

    month6 = month6.reverse();
    let existMonth6 = [];
    let month6_status1 = false;
    let month6_status2 = false;
    let month6_hyundai = false;
    for (i of month6) {
      if (i.unstructured_6N != null && month6_status1 == false) {
        // 쿼리 결과에서 unstructured_6N이 null이 아닌 값 중에 가장 최신 데이터
        existMonth6.unstructured_6N = i.unstructured_6N;
        json_N[field[3]] = existMonth6.unstructured_6N;

        month6_status1 = true;
      }

      if (i.unstructured_6Y != null && month6_status2 == false) {
        // 쿼리 결과에서 unstructured_6N이 null이 아닌 값 중에 가장 최신 데이터
        existMonth6.unstructured_6Y = i.unstructured_6Y;
        json_Y[field[3]] = existMonth6.unstructured_6Y;

        month6_status2 = true;
      }

      if (i.hyundai_6 != null && month6_hyundai == false) {
        // 쿼리 결과에서 hyundai_6이 null이 아닌 값 중에 가장 최신 데이터
        existMonth6.hyundai_6 = i.hyundai_6;
        hyundai[field[3]] = existMonth6.hyundai_6;

        month6_hyundai = true;
      }

      if (
        month6_status1 == true &&
        month6_status2 == true &&
        month6_hyundai == true
      ) {
        break;
      }

      if (existMonth6.unstructured_6N != undefined) {
        // 쿼리 결과에서 unstructured_6N 데이터가 모두 없을 경우 빈 값 넣어줌
        json_N[field[3]] = "";
      }

      if (existMonth6.unstructured_6Y != undefined) {
        // 쿼리 결과에서 unstructured_6N 데이터가 모두 없을 경우 빈 값 넣어줌
        json_Y[field[3]] = "";
      }

      if (existMonth6.hyundai_6 != undefined) {
        // 쿼리 결과에서 hyundai_6 데이터가 모두 없을 경우 빈 값 넣어줌
        hyundai[field[3]] = "";
      }
    }

    if (month6.length == 0) {
      // 조회된 쿼리 결과가 없을 때 빈 값 넣어줌
      json_N[field[3]] = "";
      json_Y[field[3]] = "";
      hyundai[field[3]] = "";
    }
  }

  // 현재값과 예측값 비교하는 함수
  async function getPrepare() {
    result.push(json_N);
    result.push(json_Y);
    result.push(hyundai);

    for (var i = 1; i < 4; i++) {
      // 현재가와 1개월 후, 3개월 후, 6개월 후 비교: 비정형 제외
      if (
        result[0]["current"] != "" &&
        result[0][field[i]] != "" &&
        result[0][field[i]] != undefined
      ) {
        // 변동율 계산
        result[0][`${field[i]}_prepare`] = (
          (result[0][`${field[i]}`] / result[0]["current"] - 1) *
          100
        ).toFixed(0);
      } else {
        result[0][`${field[i]}_prepare`] = "";
      }

      // 현재가와 1개월 후, 3개월 후, 6개월 후 비교: 비정형 포함
      if (
        result[1]["current"] != "" &&
        result[1][field[i]] != "" &&
        result[1][field[i]] != undefined
      ) {
        // 변동율 계산
        result[1][`${field[i]}_prepare`] = (
          (result[1][`${field[i]}`] / result[1]["current"] - 1) *
          100
        ).toFixed(0);
      } else {
        result[1][`${field[i]}_prepare`] = "";
      }

      // 현재가와 1개월 후, 3개월 후, 6개월 후 비교: 현대모비스
      if (
        result[2]["current"] != "" &&
        result[2][field[i]] != "" &&
        result[2][field[i]] != undefined
      ) {
        // 변동율 계산
        result[2][`${field[i]}_prepare`] = (
          (result[2][`${field[i]}`] / result[2]["current"] - 1) *
          100
        ).toFixed(0);
      } else {
        result[2][`${field[i]}_prepare`] = "";
      }
    }

    setNumDigits();
  }

  // 소수점 두자리까지 표현
  function setNumDigits() {
    for (i of result) {
      for (var j = 1; j < 4; j++) {
        if (i[field[j]] != "" && i[field[j]] != undefined) {
          i[field[j]] = i[field[j]].toFixed(2);
        }
      }
    }

    res.send(result);
  }
});

module.exports = router;
