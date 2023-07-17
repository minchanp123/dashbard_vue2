// const dbConnect = require("../connect");
const document_report = require("../../model/DOCUMENT_REPORT");

const express = require("express");
var router = express.Router();

// dbConnect();

// 키워드 모니터링_원자재:: 원문보기_report
router.get("/material_report_original_text", async function (req, res, next) {
  let { startDate, endDate, material } = req.query;

  let ret;

  if (material == "CU" || material == "AL" || material == "NI") {
    // material이 CU 또는 AL 또는 NI일 경우
    ret = await document_report
      .aggregate([
        {
          $project: {
            _id: 0,
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
            doc_title: "$doc_title",
            source: "$source",
            material: "$material",
          },
        },
        {
          $match: {
            material: "CAN",
            datetime: { $gte: startDate, $lte: endDate },
          },
        },
        { $sort: { datetime: -1 } },
      ])
      .then()
      .catch(console.error);
  } else if (material == "PP" || material == "PC") {
    // material이 PP 또는 PC일 경우
    ret = await document_report
      .aggregate([
        {
          $project: {
            _id: 0,
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
            doc_title: "$doc_title",
            source: "$source",
            material: "$material",
          },
        },
        {
          $match: {
            material: "P2",
            datetime: { $gte: startDate, $lte: endDate },
          },
        },
        { $sort: { datetime: -1 } },
      ])
      .then()
      .catch(console.error);
  } else {
    // material이 HR일 경우
    ret = await document_report
      .aggregate([
        {
          $project: {
            _id: 0,
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
            doc_title: "$doc_title",
            source: "$source",
            material: "$material",
          },
        },
        {
          $match: {
            material: "HR",
            datetime: { $gte: startDate, $lte: endDate },
          },
        },
        { $sort: { datetime: -1 } },
      ])
      .then()
      .catch(console.error);
  }

  res.send(ret);
});

module.exports = router;