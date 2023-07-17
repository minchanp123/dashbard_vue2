// const dbConnect = require("../connect");
const topic_company = require("../../model/TOPIC_COMPANY");
const topic_company_today_table = require("../../model/TOPIC_COMPANY_TODAY_TABLE");
const topic_company_today_chart = require("../../model/TOPIC_COMPANY_TODAY_CHART");

const express = require("express");
var router = express.Router();

const { getToday, getF1, getF2, getF3, dictId, dictTopic } = require('../../common/common');
// dbConnect();

// 키워드 데이터 조회
router.get("/select_topic_company", async function (req, res, next) {
  try {
    let { material, startDate, endDate } = req.query;

    let frequency;
    let data;

    if (endDate == (await getToday())) {
      if (startDate == (await getF1())) {
        frequency = 1;
        data = await topicTodayData(frequency);
      } else if (startDate == (await getF2())) {
        frequency = 3;
        data = await topicTodayData(frequency);
      } else if (startDate == (await getF3())) {
        frequency = 6;
        data = await topicTodayData(frequency);
      } else {
        data = await topicData();
      }
    } else {
      data = await topicData();
    }

    // 단기, 중기, 장기 선택을 했을 경우
    async function topicTodayData(frequency) {
      let data = await topic_company_today_table.aggregate([
        {
          $project: {
            _id: "$topic",
            rank: 1,
            material: 1,
            tf: 1,
            frequency: 1,
          },
        },
        { $match: { material: material, frequency: frequency } },
        { $sort: { rank: 1 } },
      ]);

      return data;
    }
    // 단기, 중기, 장기 선택을 안했을 경우
    async function topicData() {
      let data = await topic_company.aggregate([
        {
          $project: {
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
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
        {
          $group: {
            _id: "$topic",
            tf: { $sum: "$tf" },
            tf_idf: { $sum: "$tf_idf" },
          },
        },
        { $sort: { tf_idf: -1 } },
        { $limit: 10 },
      ]);

      return data;
    }
    
    await dictId(data);

    res.send(data);
  } catch (e) {
    res.json({
      message: "데이터 조회 실패",
      error: e,
    });
  }
});

// 협력사 카테고리별 화제어 빈도 / 화제어 발생추이
router.get("/keyword_topic_company", async function (req, res, next) {
  try {
    let { material, startDate, endDate } = req.query;

    let data;

    if (endDate == (await getToday())) {
      if (startDate == (await getF1())) {
        frequency = 1;
        data = await topicTodayChart(frequency);
      } else if (startDate == (await getF2())) {
        frequency = 3;
        data = await topicTodayChart(frequency);
      } else if (startDate == (await getF3())) {
        frequency = 6;
        data = await topicTodayChart(frequency);
      } else {
        data = await topicChart();
      }
    } else {
      data = await topicChart();
    }

    async function topicTodayChart(frequency) {
      let data = await topic_company_today_chart.aggregate([
        {
          $project: {
            _id: 0,
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
            material: 1,
            category: 1,
            tf: 1,
            frequency: 1,
          },
        },
        { $match: { material: material, frequency: frequency } },
      ]);

      let category = ["재해", "전쟁", "국가", "질병", "환경"];
      let c1 = [];
      let c2 = [];
      let c3 = [];
      let c4 = [];
      let c5 = [];
      let dateArr = [];

      for (i of data) {
        if (i.category != "") {
          dateArr.push(i.datetime);
        }
        if (i.category == category[0]) {
          c1.push(i.tf);
        } else if (i.category == category[1]) {
          c2.push(i.tf);
        } else if (i.category == category[2]) {
          c3.push(i.tf);
        } else if (i.category == category[3]) {
          c4.push(i.tf);
        } else if (i.category == category[4]) {
          c5.push(i.tf);
        }
      }
      let cArr = [c1, c2, c3, c4, c5];

      let result = [];
      for (const [i, element] of category.entries()) {
        let obj = {};
        obj.name = element;
        obj.data = cArr[i];
        obj.datetime = [...new Set(dateArr)];
        result.push(obj);
      }

      return result;
    }

    async function topicChart() {
      let data = await topic_company.aggregate([
        {
          $project: {
            _id: 0,
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
            material: 1,
            topic: 1,
            tf: 1,
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

      return result;
    }

    res.send(data);
  } catch (e) {
    res.json({
      message: "데이터 조회 실패",
      error: e,
    });
  }
});

module.exports = router;