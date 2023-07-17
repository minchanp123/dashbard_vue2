// const dbConnect = require("../connect");
const document = require("../../model/DOCUMENT");

const express = require("express");
var router = express.Router();

// dbConnect();

// 종합상황판 :: 키워드 뉴스 테이블
router.get("/keyword_news", async function (req, res, next) {
  try {
    let result = [];
    let materials = ["CU", "AL", "NI", "PP", "PC", "HR", "all"];
    let reg = /[\{\}\[\]\/?]/gi;

    let now = new Date();
    now.setHours(now.getHours() + 9);

    // currentDate: DOCUMENT 테이블의 데이터 중 가장 최신데이터에 해당하는 날짜
    let currentDate = ( await document.find({}, { _id: 0, datetime: 1 }).sort({ datetime: -1 }).limit(1) )[0].datetime;

    // 날짜 형식 맞춰주기(2022-12-16T00:00:00.000Z -> 2022-12-16)
    currentDate = currentDate.toISOString().slice(0, 10);

    for (let material of materials) {
      let ret = await document.aggregate([
        {
          $project: {
            _id: 0,
            material: 1,
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
            doc_title: 1,
            doc_url: 1,
            topics: 1,
            prob: 1,
          },
        },
        {
          $match: {
            datetime: currentDate,
            material: material,
          },
        },
        { $sort: { prob: -1 } },
      ]);

      for (i of ret) {
        if (i.doc_title.length > 20) {
          // 원문의 title이 20자를 초과한다면 20자로 잘라주기
          i.doc_title = i.doc_title.substring(0, 20);
        }

        // topics 괄호 제거
        i.topics = i.topics.split(",", 5).toString().replace(reg, "");

        result.push(i);
      }
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