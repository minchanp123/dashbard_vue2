// const dbConnect = require("../connect");
const real_price_trend = require("../../model/REAL_PRICE_TREND");

const express = require("express");
var router = express.Router();

// dbConnect();

// 종합상황판 :: 주요 지표 현황 테이블
router.get("/key_index_status", async function (req, res, next) {
  try {
    const source = [
      "싱가포르 현물",
      "싱가포르 현물",
      "하나은행",
      "하나은행",
      "하나은행",
      "상하이운임지수",
    ];
    const unit = [
      "USD/bbl",
      "USD/bbl",
      "KRW/USD",
      "KRW/EUR",
      "KRW/CNY",
      "INDEX",
    ];
    let url = [
      "https://www.opinet.co.kr/glopopdSelect.do",
      "https://www.opinet.co.kr/glopopdSelect.do",
      "https://www.kebhana.com/cont/mall/mall15/mall1501/index.jsp",
      "https://www.kebhana.com/cont/mall/mall15/mall1501/index.jsp",
      "https://www.kebhana.com/cont/mall/mall15/mall1501/index.jsp",
      "https://www.kcla.kr/web/inc/html/4-1_3.asp",
    ];
    let material_other_Arr = [];

    // [두바이, 나프타]와 [usd, eur, cny, scfi]는 데이터 조회 쿼리가 다름
    // -> 두 개의 함수로 분리하여 쿼리 실행
    const dubai = await getData1("dubai");
    const naphtha = await getData1("naphtha");
    const usd = await getData2("usd");
    const eur = await getData2("eur");
    const cny = await getData2("cny");
    const scfi = await getData2("scfi");

    // 쿼리 결과를 배열에 담음
    material_other_Arr = [
      ...dubai,
      ...naphtha,
      ...usd,
      ...eur,
      ...cny,
      ...scfi,
    ];

    let variance_arr = [];
    let varianceRate_arr = [];
    let varianceStatus_arr = [];

    // 기준일로부터 기준일을 제외한 가장 최신의 데이터 불러옴
    const dubai_secondRecent = await getSecondRecent1( "dubai", material_other_Arr[0].datetime );
    const naphtha_secondRecent = await getSecondRecent1( "naphtha",material_other_Arr[1].datetime );
    const usd_secondRecent = await getSecondRecent2( "usd", material_other_Arr[2].datetime );
    const eur_secondRecent = await getSecondRecent2( "eur", material_other_Arr[3].datetime );
    const cny_secondRecent = await getSecondRecent2( "cny", material_other_Arr[4].datetime );
    const scfi_secondRecent = await getSecondRecent2( "scfi", material_other_Arr[5].datetime );

    // 쿼리 결과 배열에 담음
    let secondRecent_arr = [
      dubai_secondRecent,
      naphtha_secondRecent,
      usd_secondRecent,
      eur_secondRecent,
      cny_secondRecent,
      scfi_secondRecent,
    ];

    let update_time = await real_price_trend.find({}, { _id: 0, update_time: 1 }).sort({ update_time: -1 }).limit(1);
    update_time = update_time[0].update_time.toISOString().slice(0, -5).replace("T", " ");

    for (const [i, element] of material_other_Arr.entries()) {
      element.update_time = update_time;
      if (element.price !== "" && secondRecent_arr[i] !== "") {
        // 비교하고자 하는 데이터의 값이 있을 때 실행

        // 변동율: 소수점 2자리까지 표현, + %
        let varianceRate =
          (element.price / secondRecent_arr[i] - 1) * 100;
        varianceRate_arr[i] = `${varianceRate.toFixed(2)}%`;

        // 변동(차이금액)
        variance_arr[i] = (
          element.price - secondRecent_arr[i]
        ).toFixed(2);

        // 상승/하락/유지 를 나타내는 기호 추가
        if (element.price > secondRecent_arr[i]) {
          varianceStatus_arr[i] = "▲";
        } else if (element.price < secondRecent_arr[i]) {
          varianceStatus_arr[i] = "▼";
        } else {
          variance_arr[i] = "";
          varianceStatus_arr[i] = "-";
          varianceRate_arr[i] = "";
        }
      } else {
        varianceStatus_arr[i] = "-";
      }
    }

    // 일간/주간 데이터 추가
    for (const [i, element] of material_other_Arr.entries()) {
      element.variance = variance_arr[i];
      element.varianceStatus = varianceStatus_arr[i];
      element.varianceRate = varianceRate_arr[i];
      if (i == 5) {
        element.frequency = "(주간)";
      } else {
        element.frequency = "(일간)";
      }
      element.unit = "(" + unit[i] + ")";
      element.source = source[i];
      element.url = url[i];
    }

    // [두바이유, 나프타] 현재가 가져오는 함수
    async function getData1(material_other) {
      let ret = await real_price_trend.aggregate([
        {
          $project: {
            _id: 0,
            material_other: "$material_other",
            price: "$price",
            material: "$material",
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
          },
        },
        {
          $match: { material_other: material_other },
        },
        { $sort: { datetime: -1 } },
        { $limit: 1 },
      ]);

      // 데이터가 없을 때 빈값을 넣어서 처리해준다.
      if (ret.length == 0) {
        let obj = {};
        obj.material_other = material_other;
        // obj.material_other = '';
        obj.price = "";
        obj.material = "";
        obj.datetime = "";

        return [obj];
      } else {
        ret[0].price = ret[0].price.toFixed(2);

        return ret;
      }
    }

    // [usd, eur, cny, scfi] 현재가 가져오는 함수
    async function getData2(material_other) {
      let ret = await real_price_trend.aggregate([
        {
          $project: {
            _id: 0,
            material_other: "$material_other",
            price: "$price",
            material: "$material",
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
          },
        },
        {
          $match: {
            material: "main",
            material_other: { $regex: material_other },
          },
        },
        { $sort: { datetime: -1 } },
        { $limit: 1 },
      ]);

      // 데이터가 없을 때 빈값을 넣어서 처리해준다.
      if (ret.length == 0) {
        let obj = {};
        obj.material_other = material_other;
        obj.price = "";
        obj.material = "";
        obj.datetime = "";

        return [obj];
      } else {
        ret[0].price = ret[0].price.toFixed(2);

        return ret;
      }
    }

    // [두바이유, 나프타] 기준일로부터 기준일을 제외한 가장 최신의 현재가 가져오는 함수
    async function getSecondRecent1(material_other, datetime) {
      let secondRecent = await real_price_trend.aggregate([
        {
          $project: {
            _id: 0,
            material_other: "$material_other",
            price: "$price",
            material: "$material",
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
          },
        },
        {
          $match: {
            material_other: material_other,
            datetime: { $lt: datetime },
          },
        },
        { $sort: { datetime: -1 } },
        { $limit: 1 },
      ]);

      if (secondRecent[0] != undefined) {
        return secondRecent[0].price;
      } else {
        return "";
      }
    }

    // [usd, eur, cny, scfi] 기준일로부터 기준일을 제외한 가장 최신의 현재가 가져오는 함수
    async function getSecondRecent2(material_other, datetime) {
      let secondRecent = await real_price_trend.aggregate([
        {
          $project: {
            _id: 0,
            material_other: "$material_other",
            price: "$price",
            material: "$material",
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
          },
        },
        {
          $match: {
            material: "main",
            material_other: { $regex: material_other },
            datetime: { $lt: datetime },
          },
        },
        { $sort: { datetime: -1 } },
        { $limit: 1 },
      ]);

      if (secondRecent[0] != undefined) {
        return secondRecent[0].price;
      } else {
        return "";
      }
    }
    res.send(material_other_Arr);
  } catch (e) {
    res.json({
      message: "데이터 조회 실패",
      error: e,
    });
  }
});

module.exports = router;