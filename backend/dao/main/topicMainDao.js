// const dbConnect = require("../connect");
const topic_main = require("../../model/TOPIC_MAIN");

const express = require("express");
var dayjs = require('dayjs');
var router = express.Router();

// dbConnect();

// 종합 상황판 :: 영향 키워드 동향 테이블
router.get("/effect_keyword_rank", async function (req, res, next) {
  try {
    let datetime = new dayjs().subtract(1, "day").format("YYYY-MM-DD");
    let cu = await topic_main.find({ material: "CU", datetime: new Date(datetime) }).sort({ rank: 1 });
    let al = await topic_main.find({ material: "AL", datetime: new Date(datetime) }).sort({ rank: 1 });
    let ni = await topic_main.find({ material: "NI", datetime: new Date(datetime) }).sort({ rank: 1 });
    let pp = await topic_main.find({ material: "PP", datetime: new Date(datetime) }).sort({ rank: 1 });
    let pc = await topic_main.find({ material: "PC", datetime: new Date(datetime) }).sort({ rank: 1 });
    let hr = await topic_main.find({ material: "HR", datetime: new Date(datetime) }).sort({ rank: 1 });

    let data = [];
    for (const [i, element] of cu.entries()) {
      data.push([element, al[i], ni[i], pp[i], pc[i], hr[i]]);
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
