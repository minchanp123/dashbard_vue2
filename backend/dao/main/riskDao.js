// const dbConnect = require("../connect");
const risk = require("../../model/RISK");

const express = require('express');
var router = express.Router();

// dbConnect();

// 종합상황판 :: 리스크
router.get("/main_risk", async function (req, res, next) {
  try {
    let data = await risk.find({});
    let result = [];
    for await (let d of data) {
      var json = {};

      d.price_info[0] = d.price_info[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      d.price_info[1] = d.price_info[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      d.real_price[0] = d.real_price[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      d.real_price[1] = d.real_price[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      d.price_prediction[0] = d.price_prediction[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      d.price_prediction[1] = d.price_prediction[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      d.news[0] = d.news[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      d.news[1] = d.news[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      json.material = d.material;
      json.rank = d.rank;
      json.pre_rank = d.pre_rank;

      var symbol = "";
      if (d.price_info[4][0] == "-") {
        symbol = "▼";
      } else if (d.price_info[0] == d.price_info[1]) {
        symbol = "-";
      } else {
        symbol = "▲";
      }

      json.price_info = d.price_info[0] + " → " + d.price_info[1] + "(" + d.price_info[2] + symbol + ")";
      json.price_info_ago = d.price_info[5];
      json.price_info_today = d.price_info[0];
      json.price_info_unit = "(USD/ton)";
      json.price_info_per = d.price_info[4];
      json.price_info_symbol = symbol;

      symbol = "";
      if (d.real_price[2][0] == "-") {
        symbol = "▼";
      } else if (d.real_price[0] == d.real_price[1]) {
        symbol = "-";
      } else {
        symbol = "▲";
      }
      json.real_price = d.real_price[0] + " → " + d.real_price[1] + "(" + d.real_price[2] + symbol + ")";

      symbol = "";
      if (d.price_prediction[2][0] == "-") {
        symbol = "▼";
      } else if (d.price_prediction[0] == d.price_prediction[1]) {
        symbol = "-";
      } else {
        symbol = "▲";
      }
      json.price_prediction = d.price_prediction[0] + " → " + d.price_prediction[1] + "(" + d.price_prediction[2] + symbol + ")";

      symbol = "";
      if (d.news[2][0] == "-") {
        symbol = "▼";
      } else if (d.news[0] == d.news[1]) {
        symbol = "-";
      } else {
        symbol = "▲";
      }
      json.news = d.news[0] + " → " + d.news[1] + "(" + d.news[2] + symbol + ")";

      json.report = d.report;

      if (d.material == "Cu") {
        json.info = "(구리)";
      } else if (d.material == "Al") {
        json.info = "(알루미늄)";
      } else if (d.material == "Ni") {
        json.info = "(니켈)";
      } else if (d.material == "HR") {
        json.info = "(열연코일)";
      } else if (d.material == "PP") {
        json.info = "(폴리프로필렌)";
      } else if (d.material == "PC") {
        json.info = "(폴리카보네이트)";
      }
      result.push(json);
    }
    res.send(result);
  } catch (e) {
    res.json({
      message: "데이터 조회 실패",
      error: e,
    });
  }
});

// 종합상황판 - 원자재별 시황 사용예측 리스크 (프로그레스바)
router.get("/materialMarket_risk", async function (req, res, next) {
  try {
    let cu = await risk.find({ material: "Cu" });
    let al = await risk.find({ material: "Al" });
    let ni = await risk.find({ material: "Ni" });
    let pp = await risk.find({ material: "PP" });
    let pc = await risk.find({ material: "PC" });
    let hr = await risk.find({ material: "HR" });

    let material = [cu[0], al[0], ni[0], pp[0], pc[0], hr[0]];
    let result = [];

    for (i of material) {
      var json = {};
      json.material = i.material;

      json.real_price_per = parseFloat(i.real_price[2].slice(0, -1));
      if (json.real_price_per < 0) {
        json.real_price_per = 0;
      }
      json.price_prediction_per = parseFloat(
        i.price_prediction[2].slice(0, -1)
      );
      if (json.price_prediction_per < 0) {
        json.price_prediction_per = 0;
      }
      json.news_per = parseFloat(i.news[2]);
      if (json.news_per < 0) {
        json.news_per = 0;
      }
      json.report_per = parseFloat(i.report[0]);
      if (json.report_per < 0) {
        json.report_per = 0;
      }
      result.push(json);
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