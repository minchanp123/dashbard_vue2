// const dbConnect = require("../connect");
const real_price_trend = require("../../model/REAL_PRICE_TREND");

const express = require("express");
var router = express.Router();

// dbConnect();

// 원자재별 시황 :: 원자재 시황 차트
// 모니터링지표 시황 가격, 거래량 차트
router.get("/price_volume_chart", async function (req, res, next) {
  try {
    let { material, startDate, endDate } = req.query;
    const data = await real_price_trend
      .find({
        datetime: {
          $gte: new Date(startDate + "T00:00:00.000Z"),
          $lte: new Date(endDate + "T23:59:59.999Z"),
        },
        material: material,
        material_other: "",
      })
      .sort({ datetime: 1 });
    res.send(data);
  } catch (e) {
    res.json({
      message: "데이터 조회 실패",
      error: e,
    });
  }
});

// 원자재별 시황:: 원자재 시황_일별 데이터 추출
router.get("/select_day", async function (req, res, next) {
  let { material } = req.query;
  let ret;

  if (material == "PC" || material == "HR") {
    // 원자재가 PC 또는 HR일 경우 재고량 출력X
    ret = await real_price_trend.aggregate([
      {
        $project: {
          datetime: {
            $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
          },
          price: "$price",
          variation: "$variation",
          variation_price: "$variation_price",
          material_other: "$material_other",
          material: "$material",
          material_other: "$material_other",
        },
      },
      {
        $match: { material: material, material_other: "" },
      },
      {
        $group: {
          _id: "$datetime",
          price: { $first: "$price" },
          variation: { $first: "$variation" },
          variation_price: { $first: "$variation_price" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 7 },
    ]);
  } else {
    // 원자재가 PC 또는 HR이 아닐 경우 재고량(PP는 거래량) 출력O
    ret = await real_price_trend.aggregate([
      {
        $project: {
          datetime: {
            $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
          },
          price: "$price",
          variation: "$variation",
          variation_price: "$variation_price",
          stock: "$stock",
          material_other: "$material_other",
          material: "$material",
        },
      },
      {
        $match: { material: material, material_other: "" },
      },
      {
        $group: {
          _id: "$datetime",
          price: { $first: "$price" },
          variation: { $first: "$variation" },
          variation_price: { $first: "$variation_price" },
          stock: { $first: "$stock" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 7 },
    ]);
  }

  res.send(ret);
});

// 원자재별 시황 :: 원자재 시황_월별 데이터 추출
router.get("/select_month", async function (req, res, next) {
  let { material } = req.query;
  let ret;

  if (material == "PC" || material == "HR") {
    // 원자재가 PC 또는 HR일 경우 재고량 출력X
    ret = await real_price_trend.aggregate([
      {
        $project: {
          yearMonth: { $dateToString: { format: "%Y-%m", date: "$datetime" } },
          price: "$price",
          variation: "$variation",
          variation_price: "$variation_price",
          material_other: "$material_other",
          material: "$material",
        },
      },
      {
        $match: { material: material, material_other: "" },
      },
      {
        $group: {
          _id: "$yearMonth",
          price: { $avg: "$price" },
          variation: { $avg: "$variation" },
          variation_price: { $avg: "$variation_price" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 7 },
    ]);
  } else {
    // 원자재가 PC 또는 HR이 아닐 경우 재고량(PP는 거래량) 출력O
    ret = await real_price_trend.aggregate([
      {
        // project 먼저 실행
        /*
          year <= $datetime을 0000 형식으로 변경 후 대입
          price, variation, variation_price, stock 모두 가져옴
        */
        $project: {
          year: { $dateToString: { format: "%Y-%m", date: "$datetime" } },
          price: "$price",
          variation: "$variation",
          variation_price: "$variation_price",
          stock: "$stock",
          material_other: "$material_other",
          material: "$material",
        },
      },
      {
        $match: { material: material, material_other: "" },
      },
      {
        /*
          -id(project의 yearMonth) 기준으로
          price, variation, variation_price, stock의 평균을 각각 리턴
        */
        $group: {
          _id: "$year",
          price: { $avg: "$price" },
          variation: { $avg: "$variation" },
          variation_price: { $avg: "$variation_price" },
          stock: { $avg: "$stock" },
        },
      },
      // 날짜 내림차 순
      { $sort: { _id: -1 } },
      // 일곱개만
      { $limit: 7 },
    ]);
  }

  for (var i = 0; i < ret.length - 1; i++) {
    // 변동가격 구하기
    ret[i].variation = ret[i].price - ret[i + 1].price;
    // 변동율 구하기
    ret[i].variation_price = (ret[i].variation / ret[i + 1].price) * 100;
  }

  res.send(ret);
});

// 원자재별 시황:: 원자재 시황_분기별 데이터 추출
router.get("/select_quarter", async function (req, res, next) {
  let { material } = req.query;
  let ret;

  if (material == "PC" || material == "HR") {
    // 원자재가 PC 또는 HR일 경우 재고량 출력X
    ret = await real_price_trend.aggregate([
      {
        $project: {
          yearQuarter: {
            $concat: [
              { $dateToString: { format: "%Y", date: "$datetime" } },
              "-",
              { $substr: [{ $add: [{ $divide: [{ $subtract: [{ $month: "$datetime" }, 1 ]}, 3 ]}, 1 ]}, 0, 1 ]},
            ],
          },
          price: "$price",
          variation: "$variation",
          variation_price: "$variation_price",
          material_other: "$material_other",
          material: "$material",
        },
      },
      {
        $match: { material: material, material_other: "" },
      },
      {
        $group: {
          _id: "$yearQuarter",
          price: { $avg: "$price" },
          variation: { $avg: "$variation" },
          variation_price: { $avg: "$variation_price" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 7 },
    ]);
  } else {
    // 원자재가 PC 또는 HR이 아닐 경우 재고량(PP는 거래량) 출력O
    ret = await real_price_trend.aggregate([
      {
        $project: {
          yearQuarter: {
            $concat: [
              { $dateToString: { format: "%Y", date: "$datetime" } },
              "-",
              { $substr: [{ $add: [{ $divide: [{ $subtract: [{ $month: "$datetime" }, 1 ]}, 3 ]}, 1 ]}, 0, 1 ]},
            ],
          },
          price: "$price",
          variation: "$variation",
          variation_price: "$variation_price",
          stock: "$stock",
          material_other: "$material_other",
          material: "$material",
        },
      },
      {
        $match: { material: material, material_other: "" },
      },
      {
        $group: {
          _id: "$yearQuarter",
          price: { $avg: "$price" },
          variation: { $avg: "$variation" },
          variation_price: { $avg: "$variation_price" },
          stock: { $avg: "$stock" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 7 },
    ]);
  }

  for (var i = 0; i < ret.length - 1; i++) {
    // 변동가격 구하기
    ret[i].variation = ret[i].price - ret[i + 1].price;
    // 변동율 구하기
    ret[i].variation_price = (ret[i].variation / ret[i + 1].price) * 100;
  }

  res.send(ret);
});

// 원자재별 시황 :: 원자재 시황_연도별 데이터 추출
router.get("/select_year", async function (req, res, next) {
  let { material } = req.query;
  let ret;

  if (material == "PC" || material == "HR") {
    // 원자재가 PC 또는 HR일 경우 재고량 출력X
    ret = await real_price_trend.aggregate([
      {
        // project 먼저 실행
        /*
          year <= $datetime을 0000 형식으로 변경 후 대입
          price, variation, variation_price, stock 모두 가져옴
        */
        $project: {
          year: { $dateToString: { format: "%Y", date: "$datetime" } },
          price: "$price",
          variation: "$variation",
          variation_price: "$variation_price",
          material_other: "$material_other",
          material: "$material",
        },
      },
      {
        $match: { material: material, material_other: "" },
      },
      {
        /*
          -id(project의 yearMonth) 기준으로
          price, variation, variation_price, stock의 합을 각각 리턴
        */
        $group: {
          _id: "$year",
          price: { $avg: "$price" },
          variation: { $avg: "$variation" },
          variation_price: { $avg: "$variation_price" },
        },
      },
      // 날짜 내림차 순
      { $sort: { _id: -1 } },
      { $limit: 7 },
    ]);
  } else {
    // 원자재가 PC 또는 HR이 아닐 경우 재고량(PP는 거래량) 출력O
    ret = await real_price_trend.aggregate([
      {
        // project 먼저 실행
        /*
          year <= $datetime을 0000 형식으로 변경 후 대입
          price, variation, variation_price, stock 모두 가져옴
        */
        $project: {
          year: { $dateToString: { format: "%Y", date: "$datetime" } },
          price: "$price",
          variation: "$variation",
          variation_price: "$variation_price",
          stock: "$stock",
          material_other: "$material_other",
          material: "$material",
        },
      },
      {
        $match: { material: material, material_other: "" },
      },
      {
        /*
          -id(project의 yearMonth) 기준으로
          price, variation, variation_price, stock의 합을 각각 리턴
        */
        $group: {
          _id: "$year",
          price: { $avg: "$price" },
          variation: { $avg: "$variation" },
          variation_price: { $avg: "$variation_price" },
          stock: { $avg: "$stock" },
        },
      },
      // 날짜 내림차 순
      { $sort: { _id: -1 } },
      { $limit: 7 },
    ]);
  }

  for (var i = 0; i < ret.length - 1; i++) {
    // 변동가격 구하기
    ret[i].variation = ret[i].price - ret[i + 1].price;
    // 변동율 구하기
    ret[i].variation_price = (ret[i].variation / ret[i + 1].price) * 100;
  }

  res.send(ret);
});

// 원자재별 시황 :: 원자재 시황_excel 추출
router.get("/toExcel", async function (req, res, next) {
  let { material, startDate, endDate, date } = req.query;
  startDate = startDate.slice(0, 10);
  endDate = endDate.slice(0, 10);

  let ret;

  // 일별
  if (date == "d1") {
    // 원자재가 PC 또는 HR일 경우 재고량 출력X
    if (material == "PC" || material == "HR") {
      ret = await real_price_trend.aggregate([
        {
          $project: {
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
            price: 1,
            variation: 1,
            variation_price: 1,
            material: 1,
            material_other: 1,
          },
        },
        {
          $match: {
            material: material,
            material_other: "",
            datetime: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$datetime",
            price: { $avg: "$price" },
            variation: { $avg: "$variation" },
            variation_price: { $avg: "$variation_price" },
          },
        },
        { $sort: { _id: -1 } },
      ]);
    } else {
      // 원자재가 PC 또는 HR이 아닐 경우 재고량(PP는 거래량) 출력O
      ret = await real_price_trend.aggregate([
        {
          $project: {
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
            price: 1,
            stock: 1,
            material: 1,
            material_other: 1,
          },
        },
        {
          $match: {
            material: material,
            material_other: "",
            datetime: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$datetime",
            price: { $avg: "$price" },
            stock: { $avg: "$stock" },
          },
        },
        { $sort: { _id: -1 } },
      ]);
    }
  } else if (date == "d2") {
    // 월별
    if (material == "PC" || material == "HR") {
      // 원자재가 PC 또는 HR일 경우 재고량 출력X
      ret = await real_price_trend.aggregate([
        {
          $project: {
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
            price: 1,
            // variation: 1,
            // variation_price: 1,
            material: 1,
            material_other: 1,
          },
        },
        {
          $match: {
            material: material,
            material_other: "",
            datetime: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            // 날짜의 월까지 잘라서 그룹화 -> 그룹 평균 구함
            _id: { $substr: ["$datetime", 0, 7] },
            price: { $avg: "$price" },
            variation: { $avg: "$variation" },
            variation_price: { $avg: "$variation_price" },
          },
        },
        { $sort: { _id: -1 } },
      ]);
    } else {
      // 원자재가 PC 또는 HR이 아닐 경우 재고량(PP는 거래량) 출력O
      ret = await real_price_trend.aggregate([
        {
          $project: {
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
            price: 1,
            stock: 1,
            material: 1,
            material_other: 1,
          },
        },
        {
          $match: {
            material: material,
            material_other: "",
            datetime: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $substr: ["$datetime", 0, 7] },
            price: { $avg: "$price" },
            stock: { $avg: "$stock" },
          },
        },
        { $sort: { _id: -1 } },
      ]);
    }
  } else if (date == "d3") {
    // 분기별
    if (material == "PC" || material == "HR") {
      // 원자재가 PC 또는 HR일 경우 재고량 출력X
      ret = await real_price_trend.aggregate([
        {
          $project: {
            yearQuarter: {
              $concat: [
                { $dateToString: { format: "%Y", date: "$datetime" } },
                "-",
                { $substr: [{ $add: [{ $divide: [{ $subtract: [{ $month: "$datetime" }, 1 ]}, 3 ]}, 1 ]}, 0, 1 ]}
              ],
            },
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
            material_other: "",
            datetime: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            // 날짜의 분기 구한 후 같은 분기끼리 그룹화 -> 그룹 평균 구함
            _id: "$yearQuarter",
            price: { $avg: "$price" },
          },
        },
        { $sort: { _id: -1 } },
      ]);
    } else {
      // 원자재가 PC 또는 HR이 아닐 경우 재고량(PP는 거래량) 출력O
      ret = await real_price_trend.aggregate([
        {
          $project: {
            yearQuarter: {
              $concat: [
                { $dateToString: { format: "%Y", date: "$datetime" } },
                "-",
                { $substr: [{ $add: [{ $divide: [{ $subtract: [{ $month: "$datetime" }, 1 ]}, 3 ]}, 1 ]}, 0, 1 ]},
              ],
            },
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
            price: 1,
            stock: 1,
            material: 1,
            material_other: 1,
          },
        },
        {
          $match: {
            material: material,
            material_other: "",
            datetime: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$yearQuarter",
            price: { $avg: "$price" },
            stock: { $avg: "$stock" },
          },
        },
        { $sort: { _id: -1 } },
      ]);
    }
  } else if (date == "d4") {
    // 연도별
    if (material == "PC" || material == "HR") {
      // 원자재가 PC 또는 HR일 경우 재고량 출력X
      ret = await real_price_trend.aggregate([
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
            material_other: "",
            datetime: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            // 날짜의 연도만 자른 후 그룹화 -> 그룹 평균 구함
            _id: { $substr: ["$datetime", 0, 4] },
            price: { $avg: "$price" },
          },
        },
        { $sort: { _id: -1 } },
      ]);
    } else {
      // 원자재가 PC 또는 HR이 아닐 경우 재고량(PP는 거래량) 출력O
      ret = await real_price_trend.aggregate([
        {
          $project: {
            datetime: {
              $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
            },
            price: 1,
            stock: 1,
            material: 1,
            material_other: 1,
          },
        },
        {
          $match: {
            material: material,
            material_other: "",
            datetime: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $substr: ["$datetime", 0, 4] },
            price: { $avg: "$price" },
            stock: { $avg: "$stock" },
          },
        },
        { $sort: { _id: -1 } },
      ]);
    }
  }

  for (const [index, r] of ret.entries()) {
    // let index = parseInt(r);
    if (
      ret[index + 1] != undefined &&
      ret[index + 1].price != null &&
      r.price != null
    ) {
      // 변동가격 구한 후 소수점 2자리까지 표현
      r.variation = (r.price - ret[index + 1].price).toFixed(
        2
      );
      // 변동 상승/하락/유지 표현
      if (r.variation > 0) {
        r.variation += "(▲)";
      } else if (r.variation < 0) {
        r.variation += "(▼)";
      } else {
        r.variation += "(-)";
      }

      // 변동율 구한 후 소수점 2자리까지 표현
      r.variation_price = (
        (r.price / ret[index + 1].price - 1) *
        100
      ).toFixed(2);
      // 변동 상승/하락/유지 표현
      if (r.variation_price > 0) {
        r.variation_price += "(▲)";
      } else if (r.variation_price < 0) {
        r.variation_price += "(▼)";
      } else {
        r.variation_price += "(-)";
      }
    } else if (ret[index + 1] == undefined) {
      r.variation = "-";
      r.variation_price = "-";
    }
  }

  for (r of ret) {
    if (r.stock != null) {
      // 재고량 소수점 2자리까지 표현
      r.stock = r.stock.toFixed(2);
    }

    if (r.price != null) {
      // 가격 소수점 2자리까지 표현
      r.price = r.price.toFixed(2);
      // 가격 천단위 표현
      r.price = r.price
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }

  res.send(ret);
});

module.exports = router;