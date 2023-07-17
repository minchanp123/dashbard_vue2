// const dbConnect = require("../connect");
const real_price_trend = require("../../model/REAL_PRICE_TREND");
const price_prediction = require("../../model/PRICE_PREDICTION");

const express = require("express");
var router = express.Router();

const { getToday } = require('../../common/common');

// dbConnect();

// 종합상황판 :: 가격동향 차트 - 실제 / 예측 데이터 조회
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
    let data = await price_prediction.find({ material: material, default: { $regex: frequency[3] } });
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

module.exports = router;