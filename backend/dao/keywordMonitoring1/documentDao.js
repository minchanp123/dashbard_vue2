// const dbConnect = require("../connect");
const document = require("../../model/DOCUMENT");

const express = require("express");
var router = express.Router();

// dbConnect();

// 키워드 모니터링_원자재:: 원문보기_news 
router.get('/material_news_original_text', async function(req, res, next) {

    let {startDate, endDate, material, topic, checkedValue} = req.query;
    let reg = /[\{\}\[\]\/?]/gi;
  
    let ret;
  
    if (checkedValue == 'ALL') {
      // '원자재키워드 포함' 체크박스 선택했을 경우
      ret = await document.aggregate([
        {
          $project: {
            _id: 0,
              datetime: {$dateToString: {format: '%Y-%m-%d', date: '$datetime'}},
              doc_title: '$doc_title',
              doc_url: '$doc_url',
              source: '$source',
              topics: '$topics',
              material: '$material',
              prob: '$prob'
          }
        },
        {
          $match: {
            // material이 해당 원자재이거나 all인 데이터 가져옴
            material: {$in: [material, 'all']},
            datetime: {$gte: startDate, $lte: endDate},
            topics: {$regex: topic}
          }
        },
        {$sort: {datetime: -1}}
      ]);
    } else if (checkedValue == undefined) {
      // '원자재키워드 포함' 체크박스 해제했을 경우
      ret = await document.aggregate([
        {
          $project: {
            _id: 0,
              datetime: {$dateToString: {format: '%Y-%m-%d', date: '$datetime'}},
              doc_title: '$doc_title',
              doc_url: '$doc_url',
              source: '$source',
              topics: '$topics',
              material: '$material',
              prob: '$prob'
          }
        },
        {
          $match: {
            // 해당 material의 원문만 가져옴
            material: material,
            datetime: {$gte: startDate, $lte: endDate},
            topics: {$regex: topic}
          }
        },
        {$sort: {datetime: -1, prob: -1}}
      ])
      .then()
      .catch(console.error);
    }
  
  
    // topics 괄호 제거, 다섯개만 가져옴
    for (i of ret) {
      i.topics = i.topics.split(',', 5).toString().replace(reg, '');
    }
    res.send(ret);
  });

module.exports = router;