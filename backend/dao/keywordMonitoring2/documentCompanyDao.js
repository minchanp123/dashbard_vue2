// const dbConnect = require("../connect");
const document_company = require("../../model/DOCUMENT_COMPANY");

const express = require("express");
var router = express.Router();

// dbConnect();

/* 키워드 모니터링_협력사:: 원문보기 */
router.get("/company_original_text", async function (req, res, next) {
  let { startDate, endDate, material, topic } = req.query;

  let reg = /[\{\}\[\]\/?]/gi;

  let ret = await document_company
    .aggregate([
      {
        $project: {
          _id: 0,
          datetime: {
            $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
          },
          doc_title: "$doc_title",
          doc_url: "$doc_url",
          topics: "$topics",
          material: "$material",
        },
      },
      {
        $match: {
          material: material,
          datetime: { $gte: startDate, $lte: endDate },
          topics: { $regex: topic },
        },
      },
      { $sort: { datetime: -1 } },
    ])
    .then()
    .catch(console.error);

  // topics 괄호 제거, 다섯개만 가져옴
  for (i of ret) {
    i.topics = i.topics.split(",", 5).toString().replace(reg, "");
  }

  res.send(ret);
});

module.exports = router;