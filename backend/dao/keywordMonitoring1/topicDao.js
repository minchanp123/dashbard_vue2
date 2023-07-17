// const dbConnect = require("../connect");
const real_price_trend = require("../../model/REAL_PRICE_TREND");
const topic = require("../../model/TOPIC");
const topic_today_table = require("../../model/TOPIC_TODAY_TABLE");
const topic_today_chart = require("../../model/TOPIC_TODAY_CHART");
const topic_company_today_chart = require("../../model/TOPIC_COMPANY_TODAY_CHART");
const topic_company = require("../../model/TOPIC_COMPANY");
const topic_report = require("../../model/TOPIC_REPORT");

const express = require("express");;
var router = express.Router();

const { getToday, getF1, getF2, getF3, dictId, dictTopic } = require("../../common/common");

// dbConnect();

// 키워드 데이터 조회
router.get("/select_topic", async function (req, res, next) {
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
      let data = await topic_today_table.aggregate([
        {
          $project: {
            _id: "$topic",
            rank: 1,
            material: 1,
            tf: 1,
            frequency: 1,
            notice: 1,
          },
        },
        { $match: { material: material, frequency: frequency } },
        { $sort: { rank: 1 } },
        { $limit: 10 },
      ]);

      return data;
    }

    // 단기, 중기, 장기 선택을 안했을 경우
    async function topicData() {
      let data = await topic.aggregate([
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

// 키워드 모니터링 - 카테고리별 화제어 빈도 / 화제어 발생추이 : 화제어 클릭 x (default)
router.get("/keyword_topic", async function (req, res, next) {
  try {
    let { material, startDate, endDate } = req.query;
    let frequency;

    // 데이터를 조회하는 날짜가 단기, 중기, 장기인지
    // 사용자가 지정한 날짜인지 확인한다.
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

    // 단기, 중기, 장기를 선택했을 경우
    async function topicTodayChart(frequency) {
      let data = await topic_today_chart.aggregate([
        {
          $project: {
            _id: 0,
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
            material: 1,
            category: 1,
            tf: 1,
            price: 1,
            frequency: 1,
          },
        },
        { $match: { material: material, frequency: frequency } },
        { $sort: { datetime: 1 } },
      ]);

      let category = ["재해", "전쟁", "국가", "질병", "환경", "가격"];
      let c1 = [];
      let c2 = [];
      let c3 = [];
      let c4 = [];
      let c5 = [];
      let c6 = [];
      let dateArr = [];
      let result = [];

      for (i of data) {
        // 카테고리 데이터가 있는 날짜만 날짜 배열에 넣어준다.
        if (i.category != "") {
          dateArr.push(i.datetime);
        }
        // 일치하는 카테고리 배열에 데이터를 넣어준다.
        if (i.category == category[0]) {
          c1.push(i.tf);
          c6.push(i.price);
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
      let cArr = [c1, c2, c3, c4, c5, c6];

      for (const [i, element] of category.entries()) {
        let obj = {};
        obj.name = element;
        obj.data = cArr[i];
        obj.datetime = [...new Set(dateArr)];
        result.push(obj);
      }

      return result;
    }

    // 단기, 중기, 장기를 선택하지 않았을 경우
    async function topicChart() {
      let data = await topic.aggregate([
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

      if (result.length != 0) {
        let realData = {};
        realData.name = "가격";
        realData.data = await realPrice(dateArr, material);
        result.push(realData);
      }

      return result;
    }

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

    res.send(data);
  } catch (e) {
    res.json({
        message: "데이터 조회 실패",
        'error': e
    });
  }
});

// 키워드 모니터링 - 카테고리별 화제어 빈도/발생추이 차트 : 화제어 클릭시 차트에 화제어 데이터 추가
router.get("/keyword_frequency", async function (req, res, next) {
  try {
    let { material, startDate, endDate, date, keyword, item } = req.query;
    let tf = [];
    let result = [];
    let collection;
    let datetime = "$datetime";

    // 데이터를 조회하는 날짜가 단기, 중기, 장기인지
    // 사용자가 지정한 날짜인지 확인한다.
    if (item == "news" || item == "company") {
      if (endDate == (await getToday())) {
        if (startDate == (await getF1())) {
          frequency = 1;
          data = await topicTodayChart(frequency, item);
        } else if (startDate == (await getF2())) {
          frequency = 3;
          data = await topicTodayChart(frequency, item);
        } else if (startDate == (await getF3())) {
          frequency = 6;
          data = await topicTodayChart(frequency, item);
        } else {
          data = await topicChart();
        }
      } else {
        data = await topicChart();
      }
    } else {
      data = await topicChart();
    }

    // 뉴스와 협력사는 단기, 중기, 장기를 선택했을 경우 today 테이블에서 topic 정보를 가져온다.
    async function topicTodayChart(frequency, item) {
      if (item == "news") {
        collection = topic_today_chart;
      } else if (item == "company") {
        collection = topic_company_today_chart;
      }
      let data = await collection.aggregate([
        {
          $project: {
            _id: 0,
            material: 1,
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
            topic: 1,
            tf: 1,
            frequency: 1,
          },
        },
        {
          $match: { material: material, topic: keyword, frequency: frequency },
        },
        { $sort: { datetime: 1 } },
      ]);
      return data;
    }

    // 단기, 중기, 장기를 선택하지 않았을 경우
    async function topicChart() {
      if (item == "news") {
        collection = topic;
      } else if (item == "report") {
        datetime = "$d_datetime";

        if (material == "CU" || material == "AL" || material == "NI") {
          material = "CAN";
        } else if (material == "PP" || material == "PC") {
          material = "P2";
        }

        collection = topic_report;
      } else if (item == "company") {
        collection = topic_company;
      }

      let data = await collection.aggregate([
        {
          $project: {
            _id: 0,
            material: 1,
            datetime: { $dateToString: { format: "%Y-%m-%d", date: datetime } },
            topic: 1,
            tf: 1,
          },
        },
        {
          $match: {
            material: material,
            topic: keyword,
            datetime: { $gte: date[0], $lte: date[date.length - 1] },
          },
        },
        { $sort: { datetime: 1 } },
      ]);
      return data;
    }

    // 기존에 있던 차트의 날짜 배열 데이터를 가져온 후
    // 배열의 날짜와 일치하는 키워드 tf 데이터를 배열에 넣는다.
    for (i of date) {
      let count = 0;
      for (j of data) {
        if (j.datetime == i) {
          tf.push(j.tf);
          count += 1;
        }
      }
      if (count == 0) {
        tf.push(0);
      }
    }
    let obj = {};
    obj.name = keyword + "(화제어)";
    obj.data = tf;

    result.push(obj);

    res.send(result);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;