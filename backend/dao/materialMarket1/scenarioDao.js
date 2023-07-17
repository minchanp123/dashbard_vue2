// const dbConnect = require("../connect");
const scenario = require("../../model/SCENARIO");

const express = require("express");
var router = express.Router();

// dbConnect();

// 원자재별 시황 :: 시나리오 유사도 테이블
router.get("/select_scenario_material", async function (req, res, next) {
  let { material } = req.query;

  let ret = await scenario.find({ material: material });

  let data = ret[0];
  let scenario_arr = [data.climate, data.disease, data.war];
  let max = 0;
  let maxIndex;

  for (const [i, element] of scenario_arr.entries()) {
    if (max < element) {
      maxIndex = i;
      max = element;
    }
  }

  var json = {};
  if (maxIndex == "0") {
    json.high = "climate";
  } else if (maxIndex == "1") {
    json.high = "disease";
  } else {
    json.high = "war";
  }

  json.material = data.material;
  json.disease = data.disease;
  json.climate = data.climate;
  json.war = data.war;

  res.send(json);
});

module.exports = router;
