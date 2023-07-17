// const dbConnect = require("../connect");
const real_price_trend_category = require("../../model/REAL_PRICE_TREND_CATEGORY");

const express = require("express");
var router = express.Router();

// dbConnect();

// 원자재 시황 :: 사용변수 시황 - 카테고리 차트
router.get("/category_chart", async function (req, res, next) {
  try {
    let { material, category, startDate, endDate } = req.query;

    const data = await real_price_trend_category.aggregate([
      {
        $project: {
          datetime: {
            $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
          },
          tf: 1,
          material: 1,
          category: 1,
        },
      },
      {
        $match: {
          material: material,
          category: category,
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