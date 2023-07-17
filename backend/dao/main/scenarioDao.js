// const dbConnect = require("../connect");
const scenario = require("../../model/SCENARIO");
const real_price_trend = require("../../model/REAL_PRICE_TREND");

var express = require("express");
var router = express.Router();

// dbConnect();

// 종합상황판 - 종합가격 현황 테이블
router.get("/multi_price", async function (req, res, next) {
  try {
    let ret = [];
    let unit = ["LME", "LME", "LME", "CFR FEA", "CIF China", "FOB China"];
    let frequency = [
      "(일간)",
      "(일간)",
      "(일간)",
      "(주간)",
      "(주간)",
      "(주간)",
    ];
    let url = [
      "http://www.nonferrous.or.kr/stats/?act=sub3",
      "http://www.nonferrous.or.kr/stats/?act=sub3",
      "http://www.nonferrous.or.kr/stats/?act=sub3",
      "",
      "",
      "",
    ];

    let cu = await getMultiPrice("CU");
    let al = await getMultiPrice("AL");
    let ni = await getMultiPrice("NI");
    let pp = await getMultiPrice("PP");
    let pc = await getMultiPrice("PC");
    let hr = await getMultiPrice("HR");

    let material_Arr = [...cu, ...al, ...ni, ...pp, ...pc, ...hr];

    const cu_scenario = await scenario.find({ material: "CU" });
    const al_scenario = await scenario.find({ material: "AL" });
    const ni_scenario = await scenario.find({ material: "NI" });
    const pp_scenario = await scenario.find({ material: "PP" });
    const pc_scenario = await scenario.find({ material: "PC" });
    const hr_scenario = await scenario.find({ material: "HR" });

    let pattern_arr = [
      cu_scenario[0],
      al_scenario[0],
      ni_scenario[0],
      pp_scenario[0],
      pc_scenario[0],
      hr_scenario[0],
    ];
    let pattern_result = [];

    for (const [i, element] of material_Arr.entries()) {
      let scenario_arr = [
        pattern_arr[i].climate,
        pattern_arr[i].disease,
        pattern_arr[i].war,
      ];
      let max = 0;

      for (j of scenario_arr) {
        if (max < j) {
          max = j;
        }
      }
      pattern_result.push(max);
    }

    let variationStatus_arr = [];
    for (const [i, element] of material_Arr.entries()) {
      if (element.variation > 0) {
        variationStatus_arr[i] = "▲";
      } else if (element.variation < 0) {
        variationStatus_arr[i] = "▼";
      } else {
        variationStatus_arr[i] = "-";
      }
    }

    let update_time = await real_price_trend
      .find({}, { _id: 0, update_time: 1 })
      .sort({ update_time: -1 })
      .limit(1);
    update_time = update_time[0].update_time
      .toISOString()
      .slice(0, -5)
      .replace("T", " ");

    for (const [i, element] of material_Arr.entries()) {
      var json = {};
      json.material = element.material;
      json.price = element.price.toFixed(0);
      json.variation = element.variation;
      json.variation_price = `${element.variation_price.toFixed(2)}%`;
      json.variation_status = variationStatus_arr[i];
      json.update_time = update_time;
      json.pattern = pattern_result[i];
      json.datetime = element.datetime;
      json.frequency = frequency[i];
      json.unit = unit[i];
      json.url = url[i];
      ret.push(json);
    }
    res.send(ret);
  } catch (e) {
    res.json({
      message: "데이터 조회 실패",
      error: e,
    });
  }
});

const getMultiPrice = async function (material) {
  let ret = await real_price_trend.aggregate([
    {
      $project: {
        _id: 1,
        material: 1,
        datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
        price: 1,
        variation: 1,
        variation_price: 1,
        material_other: 1,
      },
    },
    { $match: { material: material, material_other: "" } },
    { $sort: { datetime: -1 } },
    { $limit: 1 },
  ]);
  return ret;
};

module.exports = router;
