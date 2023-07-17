// const dbConnect = require("../connect");
const real_price_trend_today = require("../../model/REAL_PRICE_TREND_TODAY");

const express = require("express");
var router = express.Router();

// dbConnect();

// 원자재별 시황:: 시황 모니터링_테이블
router.get('/monitoring_conditions', async function(req, res, next) {
    let {material} = req.query;
  
    // 해당 테이블에 출력될 데이터는 모듈을 사용해 데이터 계산 후 REAL_PRICE_TREND_TODAY 테이블에 즉시 넣어줌(갱신)
    let ret = await real_price_trend_today.find({material_list: material}, {_id: 0, material_list: 0, index: 0, __v: 0}).sort({index: 1});
  
    res.send(ret);
});

module.exports = router;