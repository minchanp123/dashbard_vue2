// const dbConnect = require("../connect");
const network_graph = require("../../model/NETWORK_GRAPH");

const express = require("express");
var router = express.Router();

const { dictId } = require("../../common/common");

// dbConnect();

// 네트워크 그래프 데이터 조회
router.get("/select_network_graph", async function (req, res, next) {
  try {
    let { material, frequency } = req.query;

    let f;
    if (frequency == "f1") {
      f = 1;
    } else if (frequency == "f2") {
      f = 7;
    } else if (frequency == "f3") {
      f = 30;
    }

    let title = material;
    if (material == "CU") {
      title = "Cu";
    } else if (material == "AL") {
      title = "Al";
    } else if (material == "NI") {
      title = "Ni";
    }

    // 카테고리, 데이터, 링크 데이터 필요
    let categoryArr = [
      { name: "원자재" },
      { name: "재해", itemStyle: { color: "#008FFB" } },
      { name: "전쟁", itemStyle: { color: "#00E396" } },
      { name: "국가", itemStyle: { color: "#FEB019" } },
      { name: "질병", itemStyle: { color: "#FF4560" } },
      { name: "환경", itemStyle: { color: "#775DD0" } },
      { name: "없음", itemStyle: { color: "lightgray" } },
    ];
    
    let topicArr = [];
    // 원자재, 협력사의 데이터는 초기에 선언해준다.
    let dataArr = [{ id: 0, name: title, symbolSize: 90, category: 0 }];
    let linkArr = [];
    let result = [];

    // 화제어 추출
    const topicData = await network_graph.aggregate([
      {
        $project: {
          material: 1,
          topic: 1,
          tf: 1,
          frequency: 1,
        },
      },
      { $match: { material: material, frequency: f } },
      {
        $group: {
          _id: "$topic",
          material: { $first: "$material" },
          tf: { $first: "$tf" },
        },
      },
    ]);

    for (i of topicData) {
      topicArr.push(i._id);
    }

    // 사전에서 화제어와 일치하는 카테고리를 찾아주는 함수
    // 화제어가 사전에 있는 카테고리에 포함되면 추가해준다.
    await dictId(topicData);

    // 화제어 데이터를 추가해준다.
    for (const [i, element] of topicData.entries()) {
      let obj = {};

      // 화제어 데이터 저장
      obj.id = i + 1;
      obj.name = element._id;
      obj.symbolSize = 60;
      obj.category = 6;

      // 화제어 카테고리 설정
      for (const [j, element2] of categoryArr.entries()) {
        if (element.note == element2.name) {
          obj.category = j;
        }
      }
      obj.value = element.tf;
      dataArr.push(obj);
    }

    // 원자재와 화제어 link 연결
    for (let i = 1; i < dataArr.length; i++) {
      var l_obj = {};
      l_obj.source = 0;
      l_obj.target = i;
      linkArr.push(l_obj);
    }

    // 화제어의 연관어를 구한다.
    const data = await network_graph.aggregate([
      {
        $project: {
          _id: "$related",
          material: 1,
          topic: 1,
          tf: 1,
          frequency: 1,
        },
      },
      { $match: { material: material, frequency: f } },
    ]);

    // 연관어가 사전에 있는 카테고리에 포함되면 추가해준다.
    await dictId(data);

    // 데이터가 저장된 배열에서 마지막 id값 가져오기
    var index = dataArr[dataArr.length - 1].id;

    for (i of data) {
      // 화제어와 연관어가 같지 않은 경우
      if (i.topic != i._id) {
        for (const [j, element] of topicArr.entries()) {
          // 화제어와 해당하는 연관어의 id link 연결
          if (i.topic == element) {
            let d_obj = {};
            let l_obj = {};

            index += 1;

            // 화제어에 해당하는 연관어를 연결해준다.
            l_obj.source = j + 1; // 화제어 id
            l_obj.target = index; // 연관어 id

            // 연관어 데이터 저장
            d_obj.id = index;
            d_obj.name = i._id;
            d_obj.symbolSize = 30;
            d_obj.category = 6;

            // 연관어 카테고리 설정
            for (const [k, element2] of categoryArr.entries()) {
              if (i.note == element2.name) {
                d_obj.category = k;
              }
            }
            d_obj.value = i.tf;
            dataArr.push(d_obj);
            linkArr.push(l_obj);
          }
        }
      }
    }

    result.push(categoryArr);
    result.push(dataArr);
    result.push(linkArr);

    res.send(result);
  } catch (e) {
    res.json({
      message: "데이터 조회 실패",
      error: e,
    });
  }
});

module.exports = router;