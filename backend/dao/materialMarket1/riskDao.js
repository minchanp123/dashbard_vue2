// const dbConnect = require("../connect");
const risk = require("../../model/RISK");

const express = require("express");
var router = express.Router();

// dbConnect();

// 원자재별 시황 :: 원부자재 종합 RISK
router.get("/materialMarket_risk", async function (req, res, next) {
  try {
    let { material } = req.query;

    if (material == "CU") {
      material = "Cu";
    } else if (material == "AL") {
      material = "Al";
    } else if (material == "NI") {
      material = "Ni";
    }

    const data = await risk.find({ material: material });
    let result = [];
    var json = {};
    var d = data[0];

    d.price_info[0] = d.price_info[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    d.price_info[1] = d.price_info[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    d.real_price[0] = d.real_price[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    d.real_price[1] = d.real_price[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    d.price_prediction[0] = d.price_prediction[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    d.price_prediction[1] = d.price_prediction[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    d.news[0] = d.news[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    d.news[1] = d.news[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    json.material = d.material;
    json.rank = d.rank;

    var symbol = "";
    if (d.price_info[4][0] == "-") {
      symbol = "▼";
    } else if (d.price_info[0] == d.price_info[1]) {
      symbol = "-";
    } else {
      symbol = "▲";
    }

    json.price_info = d.price_info[0] + " → " + d.price_info[1] + "(" + d.price_info[2] + symbol + ")";
    json.price_info_ago = d.price_info[1];
    json.price_info_now = d.price_info[0];
    json.price_info_sd = d.price_info[2];
    json.price_info_ed = d.price_info[3];
    json.price_info_per = d.price_info[4];
    json.price_info_symbol = symbol;

    if (d.real_price[2][0] == "-") {
      symbol = "▼";
    } else if (d.real_price[0] == d.real_price[1]) {
      symbol = "-";
    } else {
      symbol = "▲";
    }

    json.real_price_ago = d.real_price[1];
    json.real_price_now = d.real_price[0];
    json.real_price_per = d.real_price[2];
    json.real_price_rank = d.real_price[3];
    json.real_price_symbol = symbol;

    if (d.price_prediction[2][0] == "-") {
      symbol = "▼";
    } else if (d.price_prediction[0] == d.price_prediction[1]) {
      symbol = "-";
    } else {
      symbol = "▲";
    }

    json.price_prediction_ago = d.price_prediction[1];
    json.price_prediction_now = d.price_prediction[0];
    json.price_prediction_per = d.price_prediction[2];
    json.price_prediction_rank = d.price_prediction[3];
    json.price_prediction_symbol = symbol;

    if (d.news[2][0] == "-") {
      symbol = "▼";
    } else if (d.news[0] == d.news[1]) {
      symbol = "-";
    } else {
      symbol = "▲";
    }

    json.news_ago = d.news[0];
    json.news_now = d.news[1];
    json.news_per = d.news[2];
    json.news_rank = d.news[3];
    json.news_symbol = symbol;
    json.report_now = d.report[0];
    json.report_rank = d.report[1];

    result.push(json);
    res.send(result);
  } catch (e) {
    res.json({
      message: "데이터 조회 실패",
      error: e,
    });
  }
});

module.exports = router;