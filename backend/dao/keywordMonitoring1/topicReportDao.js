// const dbConnect = require("../connect");
const topic_report = require("../../model/TOPIC_REPORT");
const real_price_trend = require("../../model/REAL_PRICE_TREND");

const express = require("express");
var router = express.Router();

const { dictId, dictTopic } = require('../../common/common');

// dbConnect();

// 레포트 키워드 데이터 조회
router.get("/select_topic_report", async function (req, res, next) {
  try {
    let { material, startDate, endDate } = req.query;
    if (material == "CU" || material == "AL" || material == "NI") {
      material = "CAN";
    } else if (material == "PP" || material == "PC") {
      material = "P2";
    }

    // note가 null 값일 때는 그대로 출력(나중에 사전에서 카테고리를 넣어줌)
    // note가 null이 아니고 '신규'일때 신규로 출력
    let data = await topic_report.aggregate([
      {
        $project: {
          d_datetime: {
            $dateToString: { format: "%Y-%m-%d", date: "$d_datetime" },
          },
          material: 1,
          topic: 1,
          tf: 1,
        },
      },
      {
        $match: {
          material: material,
          d_datetime: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$topic",
          tf: { $sum: "$tf" },
        },
      },
      { $sort: { tf: -1 } },
      { $limit: 10 },
    ]);

    // note가 null이고 (신규/급등 아닐때)
    // 사전에서 화제어와 일치하는 카테고리를 넣어준다.
    await dictId(data);

    res.send(data);
  } catch (e) {
    res.json({
      message: "데이터 조회 실패",
      error: e,
    });
  }
});

// 카테고리별 화제어 빈도 / 화제어 발생추이
router.get("/keyword_topic_report", async function (req, res, next) {
  try {
    let { material, startDate, endDate } = req.query;

    if (material == "CU" || material == "AL" || material == "NI") {
      material = "CAN";
    } else if (material == "PP" || material == "PC") {
      material = "P2";
    }
    let data = await topic_report.aggregate([
      {
        $project: {
          _id: 0,
          datetime: {
            $dateToString: { format: "%Y-%m-%d", date: "$d_datetime" },
          },
          material: 1,
          topic: 1,
          tf: 1,
          tf_idf: 1,
        },
      },
      {
        $match: {
          material: material,
          datetime: { $gte: startDate, $lte: endDate },
        },
      },
    ]);

    let dateArr = [];
    let noteArr = [];
    let array = [];
    let result = [];

    await dictTopic(data, noteArr, array);

    // 날짜 오름차순으로 데이터 정렬
    const orderedDate = array.sort(
      (a, b) => new Date(a.datetime) - new Date(b.datetime)
    );
    for (i of orderedDate) {
      dateArr.push(i.datetime);
    }

    dateArr = [...new Set(dateArr)];
    noteArr = [...new Set(noteArr)];

    // 일치하는 비고 확인
    for (let note of noteArr) {
      let dataArr = [];
      // 날짜 별 비고 건수 합 구하기
      for (let date of dateArr) {
        var obj = {};
        var tf_sum = 0;
        for (let item of array) {
          // 비고와 날짜가 일치하면 tf 더하기
          if (item.datetime == date && item.note == note) {
            tf_sum += item.tf;
          }
        }
        // 날짜 별 tf 총합 배열에 넣기
        dataArr.push(tf_sum);
      }
      obj.name = note;
      obj.data = dataArr;
      obj.datetime = dateArr;
      result.push(obj);
    }

    let realData = {};
    realData.name = "가격";
    realData.data = await realPrice(dateArr, material);
    result.push(realData);

    // 구한 날짜를 기준으로 실제가격 구하기
    async function realPrice(dateArr, material) {
      let price = [];
      let data = await real_price_trend.aggregate([
        {
          $project: {
            _id: 0,
            price: 1,
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
            material: 1,
            material_other: 1,
          },
        },
        {
          $match: {
            material: material,
            material_other: "",
            datetime: { $gte: dateArr[0], $lte: dateArr[dateArr.length - 1] },
          },
        },
      ]);
      for (i of dateArr) {
        let count = 0;
        for (j of data) {
          if (j.datetime == i) {
            price.push(j.price);
            count += 1;
          }
        }
        if (count == 0) {
          price.push(0);
        }
      }

      return price;
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