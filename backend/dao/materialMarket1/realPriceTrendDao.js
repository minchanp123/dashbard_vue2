// const dbConnect = require("../connect");
const real_price_trend = require("../../model/REAL_PRICE_TREND");

const express = require("express");
var router = express.Router();

// dbConnect();

// 원자재별 시황 :: 사용변수 시황 차트
router.get("/chart", async function (req, res, next) {
  try {
    let { material, material_other, startDate, endDate } = req.query;

    const data = await real_price_trend.aggregate([
      {
        $project: {
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
          material_other: material_other,
          datetime: { $gte: startDate, $lte: endDate },
        },
      },
    ]);

    res.send(data);
  } catch (e) {
    res.json({
      message: "데이터 조회 실패",
      error: e,
    });
  }
});

// 사용변수 시황 재고량 데이터 조회
router.get("/stock_chart", async function (req, res, next) {
  try {
    let { material, material_other, startDate, endDate } = req.query;

    const data = await real_price_trend.aggregate([
      {
        $project: {
          datetime: {
            $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
          },
          stock: 1,
          material: 1,
          material_other: 1,
        },
      },
      {
        $match: {
          material: material,
          material_other: material_other,
          datetime: { $gte: startDate, $lte: endDate },
        },
      },
    ]);

    res.send(data);
  } catch (e) {
    res.json({
      message: "데이터 조회 실패",
      error: e,
    });
  }
});

module.exports = router;