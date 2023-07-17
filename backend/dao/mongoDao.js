const dbConfig = require('../lib/db_config');
const mongoose = require('mongoose');
const real_price_trend =  require("../model/REAL_PRICE_TREND");
const real_price_trend_today = require("../model/REAL_PRICE_TREND_TODAY");
const real_price_trend_category = require('../model/REAL_PRICE_TREND_CATEGORY');
const price_prediction = require('../model/PRICE_PREDICTION');
const risk = require('../model/RISK');
const topic = require('../model/TOPIC');
const topic_main = require('../model/TOPIC_MAIN');
const topic_report = require('../model/TOPIC_REPORT');
const topic_company = require('../model/TOPIC_COMPANY');
const topic_today_table = require('../model/TOPIC_TODAY_TABLE');
const topic_today_chart = require('../model/TOPIC_TODAY_CHART');
const topic_company_today_table = require('../model/TOPIC_COMPANY_TODAY_TABLE');
const topic_company_today_chart = require('../model/TOPIC_COMPANY_TODAY_CHART');
const network_graph = require('../model/NETWORK_GRAPH');
const document = require('../model/DOCUMENT');
const document_report = require('../model/DOCUMENT_REPORT');
const document_company = require('../model/DOCUMENT_COMPANY');
const scenario = require('../model/SCENARIO');


var express = require('express');
var fs = require('fs-extra');
var csv = require('csv-parser');
var router = express.Router();
var readStream;
var dayjs = require('dayjs');

mongoose.connect(dbConfig.dbUrl + "/" + dbConfig.dbName, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: false
})
  .then(console.log("mongoDB connected..."))
  .catch( e => console.error(e));

// 몽구스 연결 에러 발생 시 에러내용 출력, 재연결
mongoose.connection.on('error', (error) => {
  console.error('mongoDB connect error', error);
});

/* xlsx to json -> json 
* 데이터 -> real_trend save
*/
router.get('/insert_real_trend', async function(req, res, next) {
  var price_trend_sampleData = require('../public/json/price_trend_sampleData');

  const data = await price_trend_sampleData.xlsxToJSON();
  await real_price_trend.insertMany(data)
  .then(/* console.log('===== insert data =====') */)
  .catch(console.error);

  res.send(data);
});

/* csv to json -> json 
* 데이터 -> price_prediction save
*/
router.get('/insert_price_prediction', async function(req, res, next) {
  var price_prediction_sampleData = require('../public/price_prediction/price_prediction_sampleData');

  const data = await price_prediction_sampleData.csvToJSON();
  await price_prediction.insertMany(data)
    .then(/* console.log('===== insert data =====') */)
    .catch(console.error);

  res.send(data);
});

router.get('/insert_price_prediction2', async function(req, res, next) {

  const csv_save = require("../test_price_prediction_ctj")
  data = await csv_save.jsonSearch();

  // console.log(data);

  await price_prediction.insertMany(data)
    // .then(/* console.log('===== insert data =====') */)
    // .catch(console.error);

  res.send(data);
});

// 종합상황판 - 가격동향 차트: 실제 / 예측 데이터 조회
router.get('/price_prediction_chart', async function (req, res, next) {
  try {

    var dateArr = [];
    var realArr = [];
    var uNArr = [];
    var uYArr = [];
    var hArr = [];
    // var sArr = [];
    // var eArr = [];
    var arr = [];
    var name = ['실제가격']
    let now = await getToday();
    let count;
    let unstructured_N;
    let unstructured_Y;
    let hyundai;
    // let sarimax;
    // let ensemble;

    let { material, frequency } = req.query;

    // 오늘 날짜 가져오는 함수
    async function getToday() {
      let now = new dayjs().format('YYYY-MM-DD');
      return now;
    }
    
    // 원자재가 구리, 알루미늄, 니켈일 때
    // 실제 가격 : 40개(1M), 120개(3M), 240개(6M)  
    // 예측 가격 : 20개(1M), 60개(3M), 120개(6M)
    if (material == 'CU' || material == 'AL' || material == 'NI') {
      count = 40;
    }  
    // 원자재가 PP, PC, 열연코일일 때
    // 실제 가격 : 8개(1M), 24개(3M), 48개(6M)  
    // 예측 가격 : 4개(1M), 12개(3M), 24개(6M)
    else if (material == 'PP' || material == 'PC' || material == 'HR') {
      count = 8;
    }

    // 사용자가 선택한 주기에 맞는 필드 데이터 가져오기
    // 와이즈넛 => unstructured_N
    // 앙상블 => unstructured_Y
    // 현대 => hyundai
    if (frequency[3] == '1') {   
      unstructured_N = '$unstructured_1N';
      unstructured_Y = '$unstructured_1Y';
      hyundai = '$hyundai_1';
      // sarimax = '$sarimax_1';
      // ensemble = '$ensemble_1';
    } else if (frequency[3] == '3') {
      count = count * 3;
      unstructured_N = '$unstructured_3N';
      unstructured_Y = '$unstructured_3Y';
      hyundai = '$hyundai_3';
      // sarimax = '$sarimax_3';
      // ensemble = '$ensemble_3';
    } else if (frequency[3] == '6') {
      count = count * 6;
      unstructured_N = '$unstructured_6N';
      unstructured_Y = '$unstructured_6Y';
      hyundai = '$hyundai_6';
      // sarimax = '$sarimax_6';
      // ensemble = '$ensemble_6';
    }

    // 실제데이터 데이터 가져오기(최신 날짜 기준 해당 데이터 갯수 만큼)
    const real_data = await real_price_trend.aggregate([
      {
        $project:
        {
          _id: 0,
          datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
          price: 1,
          material: 1,
          material_other: 1
        }
      },
      { $match: { material: material, material_other: '', datetime: { $lte: now } } },
      { $sort: {datetime: -1} },
      { $limit: count },
      { $sort: {datetime: 1} },
    ])

    // 실제 가격 데이터의 날짜와 가격을 각 배열에 넣어준다.
    // 예측 가격 배열에는 실제 가격 데이터 만큼 null 값을 넣어준다.
    for (i in real_data) {
      dateArr.push(real_data[i].datetime);
      realArr.push(real_data[i].price);
      uNArr.push(null);
      uYArr.push(null);
      hArr.push(null);
      // sArr.push(null);
      // eArr.push(null);
    }

    // 예측 가격 배열의 마지막을 실제 가격 마지막 데이터를 넣어주어
    // 예측 가격의 시작점을 실제 가격의 마지막 데이터부터 시작하도록 한다.
    let date = dateArr[dateArr.length - 1];
    uNArr[uNArr.length - 1] = realArr[realArr.length - 1];
    uYArr[uYArr.length - 1] = realArr[realArr.length - 1];
    hArr[hArr.length - 1] = realArr[realArr.length - 1];
    // sArr[sArr.length - 1] = realArr[realArr.length - 1];
    // eArr[eArr.length - 1] = realArr[realArr.length - 1];

    // 예측데이터 가져오기(선택한 주기에 맞는 필드와 해당 데이터 갯수 만큼)
    let predict_data = await price_prediction.aggregate([
      {
        $project:
        {
          _id: false,
          datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
          unstructured_N: unstructured_N,
          unstructured_Y: unstructured_Y,
          hyundai: hyundai,
          // sarimax: sarimax,
          // ensemble: ensemble,
          material: 1,
        }
      },
      { $match: { material: material, datetime: { $gt: date } } },
      { $limit: count/2 }
    ]);

    // 예측 가격의 날짜와 데이터를 각 배열에 넣어준다.
    // 예측 가격의 데이터가 null이 아닌 값을 필드에 따라 배열에 넣어준다.
    for(i of predict_data) {
      dateArr.push(i.datetime);

      if(i.unstructured_N != null) {     
        uNArr.push(i.unstructured_N);
      } 
      if(i.unstructured_Y != null) {    
        uYArr.push(i.unstructured_Y);
      } 
      if(i.hyundai != null) {   
        hArr.push(i.hyundai);
      } 
      // if(i.sarimax != null) {   
      //   sArr.push(i.sarimax);
      // } 
      // if(i.ensemble != null) {      
      //   eArr.push(i.ensemble);
      // }
    }

    // 데이터가 null이 아니면
    // 차트 legend name 배열에 이름을 추가하고
    // 앞에서 저장한 배열을 push 한다.
    var array = [realArr];
    if(predict_data[0].unstructured_N != null) {     
      name.push('와이즈넛');
      array.push(uNArr);
    } 
    if(predict_data[0].unstructured_Y != null) {     
      name.push('앙상블');
      array.push(uYArr);
    } 
    if(predict_data[0].hyundai != null) {     
      name.push('현대모비스');
      array.push(hArr);
    } 
    // if(predict_data[0].sarimax != null) {     
    //   name.push('sarimax');
    //   array.push(sArr);
    // } 
    // if(predict_data[0].ensemble != null) {     
    //   name.push('ensemble');
    //   array.push(eArr);
    // }

    // default 모델 구하기
    // 차트에서 먼저 보여줄 모델을 구한다.
    let hidden = '';
    let data = await price_prediction.find({material: material,default:{$regex: frequency[3]}});
    if(data[0].default.includes('N')) {
      hidden = '와이즈넛'
    } else if (data[0].default.includes('Y')) {
      hidden = '앙상블'
    } else if (data[0].default.includes('hyundai')) {
      hidden = '현대모비스'
    } 
    // else if (data[0].default.includes('sarimax')) {
    //   hidden = 'sarimax'
    // } else if (data[0].default.includes('ensemble')) {
    //   hidden = 'ensemble'
    // }
    
    // 다른 모델들은 초기에 보이지 않도록 설정한다.
    for (i of name) {
      if(i == '실제가격' || i== hidden) {
      } else {       
        arr.push(i);
      }
    }

    // 실제가격/비정형 제외/비정형 포함 데이터 갯수 맞춰주기(csv 추출하기 위해)
    for (var i=array[0].length; i<array[1].length; i++) {
      array[0].push(null);
    }

    // 소수점 제거
    for (i in array) {
      for (j in array[i]) {
        if (array[i][j] != null) {
          array[i][j] = array[i][j].toFixed(0);
        }
      }
    }

    var result = [];
    for (i in array) {
      var obj = {}
      obj.name = name[i];
      obj.data = array[i];
      obj.date = dateArr;
      obj.hidden = arr;
      result.push(obj);
    }

    res.send(result);
  } catch (e) {
    res.json({
      message: "데이터 조회 실패",
      'error': e
    });
  }
});

/* 종합상황판:: 중요 지표 현황 */
router.get('/main_key_index_status', async function(req, res, next) {

  // 구분
  const division = ['dubai', 'naphtha', 'usd', 'eur', 'cny', 'scfi'];
  const divisionKor = ['두바이유', '나프타', '달러', 'eur', 'cny', 'scfi'];
  const source = ['싱가포르 현물', '싱가포르 현물', '하나은행', '하나은행', '하나은행', '상하이운임지수']
  const unit = ['USD/bbl','USD/bbl','KRW/USD','KRW/EUR','KRW/CNY','INDEX'];
  let url = [
    'https://www.opinet.co.kr/glopopdSelect.do',
    'https://www.opinet.co.kr/glopopdSelect.do',
    'https://www.kebhana.com/cont/mall/mall15/mall1501/index.jsp',
    'https://www.kebhana.com/cont/mall/mall15/mall1501/index.jsp',
    'https://www.kebhana.com/cont/mall/mall15/mall1501/index.jsp',
    'https://www.kcla.kr/web/inc/html/4-1_3.asp'
  ]
  let dataArray = [];
  let material_other_Arr = [];

  // for (i in division) {
  //   if (i < 2) {
  //     let data = await real_price_trend.aggregate([
  //       {
  //           $project: {
  //               _id: 0,
  //               material_other: '$material_other',
  //               price: '$price',
  //               material: '$material',
  //               datetime: {$dateToString: {format: "%Y-%m-%d", date: "$datetime"}},
                
  //           }
  //       },
  //       {
  //           $match: {material_other: division[i]}
  //       },
  //       {$sort: {datetime: -1}},
  //       {$limit: 1},
    
  //     ]);
  
  //     // 데이터가 없을 때 빈값을 넣어서 처리해준다.
  //     if(data.length == 0) {
  //       let obj = {};
  //       obj.material_other = divisionKor[i];
  //       // obj.material_other = '';
  //       obj.price = '';
  //       obj.material = '';
  //       obj.datetime = '';
  //       dataArray.push(obj);
  //     } else {
  //       data[0].price = data[0].price.toFixed(0);
  //       dataArray.push(data[0]);
  //     }
  //   } else {
  //     let data = await real_price_trend.aggregate([
  //       {
  //           $project: {
  //               _id: 0,
  //               material_other: '$material_other',
  //               price: '$price',
  //               material: '$material',
  //               datetime: {$dateToString: {format: "%Y-%m-%d", date: "$datetime"}},
                
  //           }
  //       },
  //       {
  //           $match: {material: 'main', material_other: {$regex: division[i]}}
  //       },
  //       {$sort: {datetime: -1}},
  //       {$limit: 1},
    
  //     ]);
  
  //     // 데이터가 없을 때 빈값을 넣어서 처리해준다.
  //     if(data.length == 0) {
  //       let obj = {};
  //       obj.material_other = divisionKor[i];
  //       // obj.material_other = '';
  //       obj.price = '';
  //       obj.material = '';
  //       obj.datetime = '';
  //       dataArray.push(obj);
  //     } else {
  //       data[0].price = data[0].price.toFixed(0);
  //       dataArray.push(data[0]);
  //     }
  //   }
    
  // }

  // [두바이, 나프타]와 [usd, eur, cny, scfi]는 데이터 조회 쿼리가 다름
  // -> 두 개의 함수로 분리하여 쿼리 실행
  const dubai = await getData1('dubai');
  const naphtha = await getData1('naphtha');
  const usd = await getData2('usd');
  const eur = await getData2('eur');
  const cny = await getData2('cny');
  const scfi = await getData2('scfi');

  // 쿼리 결과를 배열에 담음
  material_other_Arr = [
    ...dubai,
    ...naphtha,
    ...usd,
    ...eur,
    ...cny,
    ...scfi
  ];

  let variance_arr = [];
  let varianceRate_arr = [];
  let varianceStatus_arr = [];

  // 기준일로부터 기준일을 제외한 가장 최신의 데이터 불러옴
  const dubai_secondRecent = await getSecondRecent1('dubai', material_other_Arr[0].datetime);
  const naphtha_secondRecent = await getSecondRecent1('naphtha', material_other_Arr[1].datetime);
  const usd_secondRecent = await getSecondRecent2('usd', material_other_Arr[2].datetime);
  const eur_secondRecent = await getSecondRecent2('eur', material_other_Arr[3].datetime);
  const cny_secondRecent = await getSecondRecent2('cny', material_other_Arr[4].datetime);
  const scfi_secondRecent = await getSecondRecent2('scfi', material_other_Arr[5].datetime);
  // 쿼리 결과 배열에 담음
  let secondRecent_arr = [dubai_secondRecent, naphtha_secondRecent, usd_secondRecent, eur_secondRecent, cny_secondRecent, scfi_secondRecent];

  // for (var i=0; i<dataArray.length; i++) {
  //   if (i < 2) {
  //     let secondRecent = await real_price_trend.aggregate([
  //       {
  //           $project: {
  //               _id: 0,
  //               material_other: '$material_other',
  //               price: '$price',
  //               material: '$material',
  //               datetime: {$dateToString: {format: "%Y-%m-%d", date: "$datetime"}},
                
  //           }
  //       },
  //       {
  //           $match: {
  //               material_other: division[i],
  //               datetime: {$lt: dataArray[i].datetime}
  //           }
  //       },
  //       {$sort: {datetime: -1}},
  //       {$limit: 1},
  //     ]);

  //     if (secondRecent[0] != undefined) {
  //       secondRecent_arr[i] = secondRecent[0].price;
  //     } else {
  //       secondRecent_arr[i] = ''
  //     }
  //   } else {
  //     let secondRecent = await real_price_trend.aggregate([
  //       {
  //           $project: {
  //               _id: 0,
  //               material_other: '$material_other',
  //               price: '$price',
  //               material: '$material',
  //               datetime: {$dateToString: {format: "%Y-%m-%d", date: "$datetime"}},
                
  //           }
  //       },
  //       {
  //           $match: {
  //               material: 'main',
  //               material_other: division[i],
  //               datetime: {$lt: dataArray[i].datetime}
  //           }
  //       },
  //       {$sort: {datetime: -1}},
  //       {$limit: 1},
  //     ]);

  //     if (secondRecent[0] != undefined) {
  //       secondRecent_arr[i] = secondRecent[0].price;
  //     } else {
  //       secondRecent_arr[i] = ''
  //     }
  //   }
  // }

  // for (var i=0; i<dataArray.length; i++) {
  //   if (dataArray[i].price !== '' && secondRecent_arr[i] !== '') {
  //     let varianceRate = ((dataArray[i].price/secondRecent_arr[i])-1)*100;
  //     varianceRate_arr[i] = `${varianceRate.toFixed(2)}%`;
  //     variance_arr[i] = (dataArray[i].price - secondRecent_arr[i]).toFixed(2);
      
  //     if (dataArray[i].price > secondRecent_arr[i]) {
  //       varianceStatus_arr[i] = '▲';
  //     } else if (dataArray[i].price < secondRecent_arr[i]) {
  //       varianceStatus_arr[i] = '▼';
  //     } else {
  //       variance_arr[i] = '';
  //       varianceStatus_arr[i] = '-';
  //       varianceRate_arr[i] = ''
  //     }
  //   } else {
  //     //variance_arr[i] = '';
  //     varianceStatus_arr[i] = '-';
  //     //varianceRate_arr[i] = ''
  //   }
  // }

  // update_time
  let update_time = await real_price_trend.find({}, {_id: 0, update_time: 1}).sort({update_time: -1}).limit(1);
  update_time = update_time[0].update_time.toISOString().slice(0, -5).replace("T", " ");
  
  for (i in material_other_Arr) {
    material_other_Arr[i].update_time = update_time;
    if (material_other_Arr[i].price !== '' && secondRecent_arr[i] !== '') {
      // 비교하고자 하는 데이터의 값이 있을 때 실행

      // 변동율: 소수점 2자리까지 표현, + %
      let varianceRate = ((material_other_Arr[i].price/secondRecent_arr[i])-1)*100;
      varianceRate_arr[i] = `${varianceRate.toFixed(2)}%`;

      // 변동(차이금액)
      variance_arr[i] = (material_other_Arr[i].price - secondRecent_arr[i]).toFixed(2);
      
      // 상승/하락/유지 를 나타내는 기호 추가
      if (material_other_Arr[i].price > secondRecent_arr[i]) {
        varianceStatus_arr[i] = '▲';
      } else if (material_other_Arr[i].price < secondRecent_arr[i]) {
        varianceStatus_arr[i] = '▼';
      } else {
        variance_arr[i] = '';
        varianceStatus_arr[i] = '-';
        varianceRate_arr[i] = ''
      }
    } else {
      //variance_arr[i] = '';
      varianceStatus_arr[i] = '-';
      //varianceRate_arr[i] = ''
    }
  }

  // 일간/주간 데이터 추가
  for (i in material_other_Arr) {
    material_other_Arr[i].variance = variance_arr[i];
    material_other_Arr[i].varianceStatus = varianceStatus_arr[i];
    material_other_Arr[i].varianceRate = varianceRate_arr[i];
    if (i == 5) {
      material_other_Arr[i].frequency = "(주간)";
    } else {
      material_other_Arr[i].frequency = "(일간)";
    }
    material_other_Arr[i].source = source[i];
    material_other_Arr[i].unit = "("+unit[i]+")";
    material_other_Arr[i].url = url[i];
  }

  // [두바이유, 나프타] 현재가 가져오는 함수
  async function getData1(material_other) {
    let ret = await real_price_trend.aggregate([
      {
          $project: {
              _id: 0,
              material_other: '$material_other',
              price: '$price',
              material: '$material',
              datetime: {$dateToString: {format: "%Y-%m-%d", date: "$datetime"}},
              
          }
      },
      {
          $match: {material_other: material_other}
      },
      {$sort: {datetime: -1}},
      {$limit: 1},
  
    ]);

    // 데이터가 없을 때 빈값을 넣어서 처리해준다.
    if(ret.length == 0) {
      let obj = {};
      obj.material_other = material_other;
      // obj.material_other = '';
      obj.price = '';
      obj.material = '';
      obj.datetime = '';
      
      return [obj];
    } else {
      ret[0].price = ret[0].price.toFixed(2);
      
      return ret;
    }
  }

  // [usd, eur, cny, scfi] 현재가 가져오는 함수
  async function getData2(material_other) {
    let ret = await real_price_trend.aggregate([
      {
          $project: {
              _id: 0,
              material_other: '$material_other',
              price: '$price',
              material: '$material',
              datetime: {$dateToString: {format: "%Y-%m-%d", date: "$datetime"}},
              
          }
      },
      {
          $match: {material: 'main', material_other: {$regex: material_other}}
      },
      {$sort: {datetime: -1}},
      {$limit: 1},
  
    ]);

    // 데이터가 없을 때 빈값을 넣어서 처리해준다.
    if(ret.length == 0) {
      let obj = {};
      obj.material_other = material_other;
      // obj.material_other = '';
      obj.price = '';
      obj.material = '';
      obj.datetime = '';

      return [obj];
    } else {
      ret[0].price = ret[0].price.toFixed(2);

      return ret;
    }
  }

  // [두바이유, 나프타] 기준일로부터 기준일을 제외한 가장 최신의 현재가 가져오는 함수
  async function getSecondRecent1(material_other, datetime) {
    let secondRecent = await real_price_trend.aggregate([
      {
          $project: {
              _id: 0,
              material_other: '$material_other',
              price: '$price',
              material: '$material',
              datetime: {$dateToString: {format: "%Y-%m-%d", date: "$datetime"}},
              
          }
      },
      {
          $match: {
              material_other: material_other,
              datetime: {$lt: datetime}
          }
      },
      {$sort: {datetime: -1}},
      {$limit: 1},
    ]);

    if (secondRecent[0] != undefined) {
      // secondRecent_arr[i] = secondRecent[0].price;

      return secondRecent[0].price;
    } else {
      return '';
    }
  }

  // [usd, eur, cny, scfi] 기준일로부터 기준일을 제외한 가장 최신의 현재가 가져오는 함수
  async function getSecondRecent2(material_other, datetime) {
    let secondRecent = await real_price_trend.aggregate([
      {
          $project: {
              _id: 0,
              material_other: '$material_other',
              price: '$price',
              material: '$material',
              datetime: {$dateToString: {format: "%Y-%m-%d", date: "$datetime"}},
              
          }
      },
      {
          $match: {
              material: 'main',
              material_other: {$regex: material_other},
              datetime: {$lt: datetime}
          }
      },
      {$sort: {datetime: -1}},
      {$limit: 1},
    ]);

    if (secondRecent[0] != undefined) {
      // secondRecent_arr[i] = secondRecent[0].price;

      return secondRecent[0].price;
    } else {
      // secondRecent_arr[i] = ''

      return '';
    }
        
  }
  
  // 원자재 항목
  async function getMeterial() {

    let index = 0;
    for (i in division) {
      let data = await real_price_trend.distinct("material", {material_other: {$regex: division[i]}});
      data = data.join(" ");

      
      dataArray[index].material = data;
      dataArray[index].material_other = divisionKor[index];

      index++;
    }
  }

  res.send(material_other_Arr);
})

/* 모니터링 지표 시황 */
/*
router.get('/materialMarket_monitoring_conditions', async function(req, res, next) {

  let {material} = req.query;
  // console.log("material", material);
  
  // 구분
  let division = [];
  const division1 = ['PP', 'PC', 'BPA', 'dubai', 'brent', 'wti', 'naphtha'];  // 석유화학
  const division2 = ['HR', 'iron_ore china', 'bituminous_coal'];  // 강재
  const division3 = ['NI', 'AL', 'CU'];  // 비철금속
  const division4 = ['usd_cny', 'eur', 'cny_krw', 'ccfi'];  // 경제지표

  let avgPrevYear = [];
  let avgPrevQuarter = [];
  let avgPrevMonth = [];
  let recentPrice = [];

  // 현황
  const status = ['prevYear', 'prevQuarter', 'prevMonth', 'current'];
  // 전년, 전분기, 전월
  let dateArrayGte = [];
  let dateArrayLte = [];
  let dateArray = [];

  // return
  let dataArray = [];

  // 현재 날짜
  let now = new Date();
  now.setHours(now.getHours() + 9);
  let nowMonth = now.getMonth() + 1;
  let nowYear = now.getFullYear();

  let gteDate = new Date(`${nowYear}-${nowMonth}-1`);
  gteDate.setHours(gteDate.getHours() + 9);
  let lteDate = new Date(nowYear, nowMonth, 0);
  lteDate.setHours(lteDate.getHours() + 9);


  let ret = await main();

  async function main() {

    if (material == '석유화학') {
      division = division1;
    } else if (material == '강재') {
      division = division2;
    } else if (material == '비철금속') {
      division = division3;
    } else {
      division = division4;
    }

    getDateArray();

    await getPrice();
    await dataRefine();
    await getPrepare();
    await setNumDigits();

    return dataArray;
  }

  function getDateArray() {
    getPrevYear(nowYear);
    getPrevQuarter(nowMonth);
    getPrevMonth(nowMonth); 

    // return dateArray;
  }

  // 전년: (nowYear -1)-12-31
  function getPrevYear(nowYear) {
    // let prevYear = new Date((nowYear - 1), 12,0);
    // prevYear.setHours(prevYear.getHours() + 9);

    // let prevYearGte = new Date(prevYear.getFullYear(), 0, 1);
    // prevYearGte.setHours(prevYearGte.getHours() + 9);
    
    // dateArrayGte[0] = prevYearGte;
    // dateArrayLte[0] = prevYear;
    let prevYear = nowYear - 1;
    dateArray[0] = prevYear;
  }

  // 전분기  
  function getPrevQuarter(month) {

    let prevQuarter;
    let prevQuarterGte;

    if (month > 0 && month < 4) {
      // 현재: 1분기 -> (nowYear -1)-12-31
      prevQuarter = `${nowYear-1}-4`;
      // prevQuarter.setHours(prevQuarter.getHours() + 9);

      // prevQuarterGte = new Date(prevQuarter.getFullYear(), 9, 1);
      // prevQuarterGte.setHours(prevQuarterGte.getHours() + 9);

      // dateArrayGte[1] = prevQuarterGte;
      // dateArrayLte[1] = prevQuarter;
      dateArray[1] = prevQuarter;

    } else if (month > 3 && month < 7) {
        // 현재: 2분기 -> nowYear-3-31
        prevQuarter = `${nowYear}-1`;
        // prevQuarter = new Date(nowYear, 3, 0);
        // prevQuarter.setHours(prevQuarter.getHours() + 9);

        // prevQuarterGte = new Date(prevQuarter.getFullYear(), 0, 1);
        // prevQuarterGte.setHours(prevQuarterGte.getHours() + 9);

        // dateArrayGte[1] = prevQuarterGte;
        // dateArrayLte[1] = prevQuarter;
        dateArray[1] = prevQuarter;
    } else if (month > 6 && month < 10) {
        // 현재: 3분기 -> nowYear-6-30
        prevQuarter = `${nowYear}-2`;
        // prevQuarter = new Date(nowYear, 6, 0);
        // prevQuarter.setHours(prevQuarter.getHours() + 9);

        // prevQuarterGte = new Date(prevQuarter.getFullYear(), 3, 1);
        // prevQuarterGte.setHours(prevQuarterGte.getHours() + 9);

        // dateArrayGte[1] = prevQuarterGte;
        // dateArrayLte[1] = prevQuarter;
        dateArray[1] = prevQuarter;
    } else {
        // 현재: 4분기 -> nowYear-9-30
        prevQuarter = `${nowYear}-3`;
        // prevQuarter = new Date(nowYear, 9, 0);
        // prevQuarter.setHours(prevQuarter.getHours() + 9);

        // prevQuarterGte = new Date(prevQuarter.getFullYear(), 6, 1);
        // prevQuarterGte.setHours(prevQuarterGte.getHours() + 9);

        // dateArrayGte[1] = prevQuarterGte;
        // dateArrayLte[1] = prevQuarter;
        dateArray[1] = prevQuarter;
    }
  }

  function getPrevMonth(month) {
    let prevMonth;

    if (month == 1) {
      prevMonth = `${nowYear-1}-12`;
    } else {
      prevMonth = `${nowYear}-${month-1}`;
    }
    // let prevMonthGte;

    // prevMonth = new Date(nowYear, (month - 1), 0);
    // prevMonth.setHours(prevMonth.getHours() + 9);

    // prevMonthGte = new Date(prevMonth.getFullYear(), (month - 2), 1);
    // prevMonthGte.setHours(prevMonthGte.getHours() + 9);

    // dateArrayGte[2] = prevMonthGte;
    // dateArrayLte[2] = prevMonth;
    dateArray[2] = prevMonth;
  }

  async function getPrice() {

    // 전년
    if (material == '석유화학') {
      for (i in division) {
        if (i < 2) {
          let ret = await real_price_trend.aggregate([
            {
                $project: {
                    datetime: { $dateToString: { format: "%Y", date: "$datetime" } },
                    price: '$price',
                    material: '$material',
                    material_other: '$material_other'
                }
            },
            { $match: {material: division[i], material_other: '', datetime: dateArray[0].toString() }},
            {
                $group: {
                    _id: '$datetime',
                    price: {$avg: '$price'}
                }
            }
          ]);
  
          if (ret[0] != undefined) {
            avgPrevYear.push(ret[0].price);
          } else {
            avgPrevYear.push('');
          }
        } else {
          let ret = await real_price_trend.aggregate([
            {
                $project: {
                    datetime: { $dateToString: { format: "%Y", date: "$datetime" } },
                    price: '$price',
                    material: '$material',
                    material_other: '$material_other'
                }
            },
            { $match: {material_other: division[i], datetime: dateArray[0].toString() }},
            {
                $group: {
                    _id: '$datetime',
                    price: {$avg: '$price'}
                }
            }
          ]);
  
          if (ret[0] != undefined) {
            avgPrevYear.push(ret[0].price);
          } else {
            avgPrevYear.push('');
          }
        }
      }
    } else if (material == '강재')  {
      for (i in division) {
        if (i < 1) {
          let ret = await real_price_trend.aggregate([
            {
                $project: {
                    datetime: { $dateToString: { format: "%Y", date: "$datetime" } },
                    price: '$price',
                    material: '$material',
                    material_other: '$material_other'
                }
            },
            { $match: {material: division[i], material_other: '', datetime: dateArray[0].toString() }},
            {
                $group: {
                    _id: '$datetime',
                    price: {$avg: '$price'}
                }
            }
          ]);
  
          if (ret[0] != undefined) {
            avgPrevYear.push(ret[0].price);
          } else {
            avgPrevYear.push('');
          }
        } else {
            let ret = await real_price_trend.aggregate([
              {
                  $project: {
                      datetime: { $dateToString: { format: "%Y", date: "$datetime" } },
                      price: '$price',
                      material: '$material',
                      material_other: '$material_other'
                  }
              },
              { $match: {material_other: division[i], datetime: dateArray[0].toString() }},
              {
                  $group: {
                      _id: '$datetime',
                      price: {$avg: '$price'}
                  }
              }
            ]);
    
            if (ret[0] != undefined) {
              avgPrevYear.push(ret[0].price);
            } else {
              avgPrevYear.push('');
            }
        }
      }
    } else if (material == '비철금속') {
      // for (i in division) {
      //   let data = [];
      //   for (j in dateArrayLte) {
      //     let ret = await real_price_trend.find({
      //       datetime: {$gte: dateArrayGte[j], $lte: dateArrayLte[j]},
      //       material: division2[i],
      //       material_other: ''},
      //       {'_id': 0, price: 1})
      //       .sort({datetime: -1}).limit(1);
      //     if (typeof(ret[0]) == 'undefined') {
      //       ret[0] = '';
      //       ret[0]['price'] = '';
      //     }
  
      //     data.push(ret[0].price);
      //   }
      //   dataArray.push(data);
      // }

      for (i in division) {
        let ret = await real_price_trend.aggregate([
          {
              $project: {
                  datetime: { $dateToString: { format: "%Y", date: "$datetime" } },
                  price: '$price',
                  material: '$material',
                  material_other: '$material_other'
              }
          },
          { $match: {material: division[i], material_other: '', datetime: dateArray[0].toString() }},
          {
              $group: {
                  _id: '$datetime',
                  price: {$avg: '$price'}
              }
          }
        ]);

        if (ret[0] != undefined) {
          avgPrevYear.push(ret[0].price);
        } else {
          avgPrevYear.push('');
        }
      }
    } else {
      for (i in division) {
        let ret = await real_price_trend.aggregate([
          {
              $project: {
                  datetime: { $dateToString: { format: "%Y", date: "$datetime" } },
                  price: '$price',
                  material_other: '$material_other'
              }
          },
          { $match: {material_other: division[i], datetime: dateArray[0].toString() }},
          {
              $group: {
                  _id: '$datetime',
                  price: {$avg: '$price'}
              }
          }
        ]);

        if (ret[0] != undefined) {
          avgPrevYear.push(ret[0].price);
        } else {
          avgPrevYear.push('');
        }
      }
    }

    // 전분기
    if (material == '석유화학') {
      for (i in division) {
        if (i < 2) {
          let ret = await real_price_trend.aggregate([
            {
                $project: {
                    "yearQuarter": {$concat: [{$dateToString: {format: "%Y", date: "$datetime"}}, "-", {$substr: [{$add: [{$divide: [{$subtract: [{$month: "$datetime"}, 1]}, 3]}, 1]}, 0, 1]}]},
                    "price": "$price",
                    "material_other": "$material_other",
                    "material": "$material"
                }
            },
            {
                $match: {material: division[i], material_other: '', yearQuarter: dateArray[1]}
            },
            {
                $group: {
                    "_id": "$yearQuarter",
                    "price": {$avg: "$price"}
                }
            }
          ]);
  
          if (ret[0] != undefined) {
            avgPrevQuarter.push(ret[0].price);
          } else {
            avgPrevQuarter.push('');
          }
        } else {
          let ret = await real_price_trend.aggregate([
            {
                $project: {
                    "yearQuarter": {$concat: [{$dateToString: {format: "%Y", date: "$datetime"}}, "-", {$substr: [{$add: [{$divide: [{$subtract: [{$month: "$datetime"}, 1]}, 3]}, 1]}, 0, 1]}]},
                    "price": "$price",
                    "material_other": "$material_other",
                }
            },
            {
                $match: {material_other: division[i], yearQuarter: dateArray[1]}
            },
            {
                $group: {
                    "_id": "$yearQuarter",
                    "price": {$avg: "$price"}
                }
            }
          ]);
  
          if (ret[0] != undefined) {
            avgPrevQuarter.push(ret[0].price);
          } else {
            avgPrevQuarter.push('');
          }
        }
      }
    } else if (material == '강재') {
      for (i in division) {
        if (i < 1) {
          let ret = await real_price_trend.aggregate([
            {
                $project: {
                    "yearQuarter": {$concat: [{$dateToString: {format: "%Y", date: "$datetime"}}, "-", {$substr: [{$add: [{$divide: [{$subtract: [{$month: "$datetime"}, 1]}, 3]}, 1]}, 0, 1]}]},
                    "price": "$price",
                    "material_other": "$material_other",
                    "material": "$material"
                }
            },
            {
                $match: {material: division[i], material_other: '', yearQuarter: dateArray[1]}
            },
            {
                $group: {
                    "_id": "$yearQuarter",
                    "price": {$avg: "$price"}
                }
            }
          ]);
  
          if (ret[0] != undefined) {
            avgPrevQuarter.push(ret[0].price);
          } else {
            avgPrevQuarter.push('');
          }
        } else {
          let ret = await real_price_trend.aggregate([
            {
                $project: {
                    "yearQuarter": {$concat: [{$dateToString: {format: "%Y", date: "$datetime"}}, "-", {$substr: [{$add: [{$divide: [{$subtract: [{$month: "$datetime"}, 1]}, 3]}, 1]}, 0, 1]}]},
                    "price": "$price",
                    "material_other": "$material_other",
                }
            },
            {
                $match: {material_other: division[i], yearQuarter: dateArray[1]}
            },
            {
                $group: {
                    "_id": "$yearQuarter",
                    "price": {$avg: "$price"}
                }
            }
          ]);
  
          if (ret[0] != undefined) {
            avgPrevQuarter.push(ret[0].price);
          } else {
            avgPrevQuarter.push('');
          }
        }
      }
    } else if (material == '비철금속') {
      for (i in division) {
        let ret = await real_price_trend.aggregate([
          {
              $project: {
                  "yearQuarter": {$concat: [{$dateToString: {format: "%Y", date: "$datetime"}}, "-", {$substr: [{$add: [{$divide: [{$subtract: [{$month: "$datetime"}, 1]}, 3]}, 1]}, 0, 1]}]},
                  "price": "$price",
                  "material_other": "$material_other",
                  "material": "$material"
              }
          },
          {
              $match: {material: division[i], material_other: '', yearQuarter: dateArray[1]}
          },
          {
              $group: {
                  "_id": "$yearQuarter",
                  "price": {$avg: "$price"}
              }
          }
        ]);

        if (ret[0] != undefined) {
          avgPrevQuarter.push(ret[0].price);
        } else {
          avgPrevQuarter.push('');
        }
      }
    } else {
      for (i in division) {
        let ret = await real_price_trend.aggregate([
          {
              $project: {
                  "yearQuarter": {$concat: [{$dateToString: {format: "%Y", date: "$datetime"}}, "-", {$substr: [{$add: [{$divide: [{$subtract: [{$month: "$datetime"}, 1]}, 3]}, 1]}, 0, 1]}]},
                  "price": "$price",
                  "material_other": "$material_other",
              }
          },
          {
              $match: {material_other: division[i], yearQuarter: dateArray[1]}
          },
          {
              $group: {
                  "_id": "$yearQuarter",
                  "price": {$avg: "$price"}
              }
          }
        ]);

        if (ret[0] != undefined) {
          avgPrevQuarter.push(ret[0].price);
        } else {
          avgPrevQuarter.push('');
        }
      }
    }

    // else {
      // for (i in division) {
      //   let data = [];
      //   for (j in dateArrayLte) {
      //     let ret = await real_price_trend.find({
      //       datetime: {$gte: dateArrayGte[j], $lte: dateArrayLte[j]},
      //       material: material,
      //       material_other: {$regex: division[i]}},
      //       {'_id': 0, price: 1})
      //       .sort({datetime: -1}).limit(1);
      //     if (typeof(ret[0]) == 'undefined') {
      //       ret[0] = '';
      //       ret[0]['price'] = '';
      //     }
  
      //     data.push(ret[0].price);
      //   }
      //   dataArray.push(data);
      // }
    // }

    // 전월
    if (material == '석유화학') {
      for (i in division) {
        if (i < 2) {
          let ret = await real_price_trend.aggregate([
            {
                $project: {
                    datetime: { $dateToString: { format: "%Y-%m", date: "$datetime" } },
                    price: '$price',
                    material: '$material',
                    material_other: '$material_other'
                }
            },
            { $match: {material: division[i], material_other: '', datetime: dateArray[2] }},
            {
                $group: {
                    _id: '$datetime',
                    price: {$avg: '$price'}
                }
            }
          ]);
  
          if (ret[0] != undefined) {
            avgPrevMonth.push(ret[0].price);
          } else {
            avgPrevMonth.push('');
          }
        } else {
          let ret = await real_price_trend.aggregate([
            {
                $project: {
                    datetime: { $dateToString: { format: "%Y-%m", date: "$datetime" } },
                    price: '$price',
                    material: '$material',
                    material_other: '$material_other'
                }
            },
            { $match: {material_other: division[i], datetime: dateArray[2] }},
            {
                $group: {
                    _id: '$datetime',
                    price: {$avg: '$price'}
                }
            }
          ]);
  
          if (ret[0] != undefined) {
            avgPrevMonth.push(ret[0].price);
          } else {
            avgPrevMonth.push('');
          }
        }
      }
    } else if (material == '강재') {
        for (i in division) {
          if (i < 1) {
            let ret = await real_price_trend.aggregate([
              {
                  $project: {
                      datetime: { $dateToString: { format: "%Y-%m", date: "$datetime" } },
                      price: '$price',
                      material: '$material',
                      material_other: '$material_other'
                  }
              },
              { $match: {material: division[i], material_other: '', datetime: dateArray[2] }},
              {
                  $group: {
                      _id: '$datetime',
                      price: {$avg: '$price'}
                  }
              }
            ]);
    
            if (ret[0] != undefined) {
              avgPrevMonth.push(ret[0].price);
            } else {
              avgPrevMonth.push('');
            }
          } else {
            let ret = await real_price_trend.aggregate([
              {
                  $project: {
                      datetime: { $dateToString: { format: "%Y-%m", date: "$datetime" } },
                      price: '$price',
                      material_other: '$material_other'
                  }
              },
              { $match: {material_other: division[i], datetime: dateArray[2] }},
              {
                  $group: {
                      _id: '$datetime',
                      price: {$avg: '$price'}
                  }
              }
            ]);
    
            if (ret[0] != undefined) {
              avgPrevMonth.push(ret[0].price);
            } else {
              avgPrevMonth.push('');
            }
          }
        }
    } else if (material == '비철금속') {
        for (i in division) {
          let ret = await real_price_trend.aggregate([
            {
                $project: {
                    datetime: { $dateToString: { format: "%Y-%m", date: "$datetime" } },
                    price: '$price',
                    material: '$material',
                    material_other: '$material_other'
                }
            },
            { $match: {material: division[i], material_other: '', datetime: dateArray[2] }},
            {
                $group: {
                    _id: '$datetime',
                    price: {$avg: '$price'}
                }
            }
          ]);

          if (ret[0] != undefined) {
            avgPrevMonth.push(ret[0].price);
          } else {
            avgPrevMonth.push('');
          }
        }
    } else {
      for (i in division) {
        let ret = await real_price_trend.aggregate([
          {
              $project: {
                  datetime: { $dateToString: { format: "%Y-%m", date: "$datetime" } },
                  price: '$price',
                  material_other: '$material_other'
              }
          },
          { $match: {material_other: division[i], datetime: dateArray[2] }},
          {
              $group: {
                  _id: '$datetime',
                  price: {$avg: '$price'}
              }
          }
        ]);

        if (ret[0] != undefined) {
          avgPrevMonth.push(ret[0].price);
        } else {
          avgPrevMonth.push('');
        }
      }
    }

    // 현황
    if (material == '석유화학') {
      for (i in division) {
        if (i < 2) {
          let ret = await real_price_trend.find(
            {material: division[i], material_other: '', datetime: {$gte: gteDate, $lte: lteDate}},
            {_id: 0, price: 1}
          ).sort({datetime: -1}).limit(1);
  
          if (ret[0] != undefined) {
            recentPrice.push(ret[0].price);
          } else {
            recentPrice.push('');
          }
        } else {
          let ret = await real_price_trend.find(
            {material_other: division[i], datetime: {$gte: gteDate, $lte: lteDate}},
            {_id: 0, price: 1}
          ).sort({datetime: -1}).limit(1);
  
          if (ret[0] != undefined) {
            recentPrice.push(ret[0].price);
          } else {
            recentPrice.push('');
          }
        }
      }
    } else if (material == '강재') {
      for (i in division) {
        if (i < 1) {
          let ret = await real_price_trend.find(
            {material: division[i], material_other: '', datetime: {$gte: gteDate, $lte: lteDate}},
            {_id: 0, price: 1}
          ).sort({datetime: -1}).limit(1);
  
          if (ret[0] != undefined) {
            recentPrice.push(ret[0].price);
          } else {
            recentPrice.push('');
          }
        } else {
            let ret = await real_price_trend.find(
              {material_other: division[i], datetime: {$gte: gteDate, $lte: lteDate}},
              {_id: 0, price: 1}
            ).sort({datetime: -1}).limit(1);
    
            if (ret[0] != undefined) {
              recentPrice.push(ret[0].price);
            } else {
              recentPrice.push('');
            }
        }
      }
    } else if (material == '비철금속') {
      for (i in division) {
        let ret = await real_price_trend.find(
          {material: division[i], material_other: '', datetime: {$gte: gteDate, $lte: lteDate}},
          {_id: 0, price: 1}
        ).sort({datetime: -1}).limit(1);

        if (ret[0] != undefined) {
          recentPrice.push(ret[0].price);
        } else {
          recentPrice.push('');
        }
      }
    } else {
      for (i in division) {
        let ret = await real_price_trend.find(
          {material_other: division[i], datetime: {$gte: gteDate, $lte: lteDate}},
          {_id: 0, price: 1}
        ).sort({datetime: -1}).limit(1);

        if (ret[0] != undefined) {
          recentPrice.push(ret[0].price);
        } else {
          recentPrice.push('');
        }
      }

    }

  }

  async function dataRefine() {

    for (i in division) {
      let object = [];
      object.push(avgPrevYear[i], avgPrevQuarter[i], avgPrevMonth[i], recentPrice[i]);
      dataArray.push(object);
    }
  }

  async function getPrepare() {
    let prepare = 0;
    for (i in dataArray) {
      for (var j=0; j<3; j++) {
        if (dataArray[i][3] != '') {
          prepare = (((dataArray[i][3]/dataArray[i][j])-1)*100).toFixed(0);
          dataArray[i].push(prepare);
        } else {
          dataArray[i].push('');
        }
      }
    }
  }

  async function setNumDigits() {
    for (var i=0; i<division.length; i++) {
      for (var j=0; j<4; j++) {
        if (dataArray[i][j] != '' && dataArray[i][j] != undefined) {
          dataArray[i][j] = dataArray[i][j].toFixed(2);
          dataArray[i][j] = dataArray[i][j].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
      }
    }
  }

  res.send(dataArray);
});
*/

/* 원자재별 시황:: 시황 모니터링_테이블 */
router.get('/materialMarket_monitoring_conditions', async function(req, res, next) {
  let {material} = req.query;

  // 해당 테이블에 출력될 데이터는 모듈을 사용해 데이터 계산 후 REAL_PRICE_TREND_TODAY 테이블에 즉시 넣어줌(갱신)
  let ret = await real_price_trend_today.find({material_list: material}, {_id: 0, material_list: 0, index: 0, __v: 0}).sort({index: 1});

  res.send(ret);
});

/* 원자재별 시황:: 원자재 시황_excel 추출 */
router.get('/price_prediction_toExcel', async function(req, res, next) {
  let {material, startDate, endDate, date} = req.query;
  startDate = startDate.slice(0, 10);
  endDate = endDate.slice(0, 10);

  console.log("startDate : "+startDate);
  let ret;

  // 일별
  if (date == 'd1') {
    // 원자재가 PC 또는 HR일 경우 재고량 출력X
    if (material == 'PC' || material == 'HR') {
      ret = await real_price_trend.aggregate([
        { $project: 
          { 
            datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
            price: 1,
            variation: 1,
            variation_price: 1,
            material: 1,
            material_other: 1,
          }
        },
        { $match: {material: material, material_other: '',  datetime: {$gte: startDate, $lte: endDate}} },
        {
          $group: {
            "_id": "$datetime",
            "price": {$avg: "$price"},
            "variation": {$avg: "$variation"},
            "variation_price": {$avg: "$variation_price"},
          }
         },
         {$sort: {_id: -1}}
      ]);
      // ret = await real_price_trend.find(
      //   {
      //     datetime: {$gte: startDate, $lte: endDate},
      //     material: material,
      //     material_other: '',
      //   },
      //   {_id: 0, __v: 0, material: 0, material_other: 0, stock: 0}
      // ).sort({datetime: -1});
    } else {
      // ret = await real_price_trend.find(
      //   {
      //     datetime: {$gte: startDate, $lte: endDate},
      //     material: material,
      //     material_other: '',
      //   },
      //   {_id: 0, __v: 0, material: 0, material_other: 0}
      // ).sort({datetime: -1});
      // 원자재가 PC 또는 HR이 아닐 경우 재고량(PP는 거래량) 출력O
      ret = await real_price_trend.aggregate([
        { $project: 
          { 
            datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
            price: 1,
            // variation: 1,
            // variation_price: 1,
            stock: 1,
            material: 1,
            material_other: 1,
          }
        },
        { $match: {material: material, material_other: '',  datetime: {$gte: startDate, $lte: endDate}} },
        {
          $group: {
            "_id": '$datetime',
            "price": {$avg: "$price"},
            // "variation": {$avg: "$variation"},
            // "variation_price": {$avg: "$variation_price"},
            "stock": {$avg: "$stock"}
          }
         },
         {$sort: {_id: -1}}
      ]);
    }
    // else {
    //   ret = await real_price_trend.find(
    //     {
    //       datetime: {$gte: startDate, $lte: endDate},
    //       material: material,
    //       material_other: '',
    //     },
    //     {_id: 0, __v: 0, material: 0, material_other: 0}
    //   ).sort({datetime: -1});
    // }
  } else if (date == 'd2') {
    // 월별
    if (material == 'PC' || material == 'HR') {
      // 원자재가 PC 또는 HR일 경우 재고량 출력X
      ret = await real_price_trend.aggregate([
        { $project: 
              { 
                  datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
                  price: 1,
                  // variation: 1,
                  // variation_price: 1,
                  material: 1,
                  material_other: 1
              }
        },
        { $match: {material: material, material_other: '',  datetime: {$gte: startDate, $lte: endDate}} },
        {
            $group: {
              // 날짜의 월까지 잘라서 그룹화 -> 그룹 평균 구함
              "_id": {$substr: ['$datetime', 0, 7]},
              "price": {$avg: "$price"},
              "variation": {$avg: "$variation"},
              "variation_price": {$avg: "$variation_price"},
            }
         },
         {$sort: {_id: -1}}
      ]);
    } else {
      // 원자재가 PC 또는 HR이 아닐 경우 재고량(PP는 거래량) 출력O
      ret = await real_price_trend.aggregate([
        { $project: 
          { 
            datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
            price: 1,
            // variation: 1,
            // variation_price: 1,
            stock: 1,
            material: 1,
            material_other: 1
          }
        },
        { $match: {material: material, material_other: '',  datetime: {$gte: startDate, $lte: endDate}} },
        {
          $group: {
            "_id": {$substr: ['$datetime', 0, 7]},
            "price": {$avg: "$price"},
            // "variation": {$avg: "$variation"},
            // "variation_price": {$avg: "$variation_price"},
            "stock": {$avg: "$stock"}
          }
        },
        {$sort: {_id: -1}}
      ]);
    }
  } else if (date == 'd3') {
    // 분기별
    if (material == 'PC' || material == 'HR') {
      // 원자재가 PC 또는 HR일 경우 재고량 출력X
      ret = await real_price_trend.aggregate([
        { $project: 
          { 
            "yearQuarter": {$concat: [{$dateToString: {format: "%Y", date: "$datetime"}}, "-", {$substr: [{$add: [{$divide: [{$subtract: [{$month: "$datetime"}, 1]}, 3]}, 1]}, 0, 1]}]},
            datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
            price: 1,
            // variation: 1,
            // variation_price: 1,
            material: 1,
            material_other: 1
          }
        },
        { $match: {material: material, material_other: '',  datetime: {$gte: startDate, $lte: endDate}} },
        {
          $group: {
            // 날짜의 분기 구한 후 같은 분기끼리 그룹화 -> 그룹 평균 구함
            "_id": "$yearQuarter",
            "price": {$avg: "$price"},
            // "variation": {$avg: "$variation"},
            // "variation_price": {$avg: "$variation_price"},
          }
        },
        {$sort: {_id: -1}}
      ]);
    } else {
      // 원자재가 PC 또는 HR이 아닐 경우 재고량(PP는 거래량) 출력O
      ret = await real_price_trend.aggregate([
        { $project: 
          { 
            "yearQuarter": {$concat: [{$dateToString: {format: "%Y", date: "$datetime"}}, "-", {$substr: [{$add: [{$divide: [{$subtract: [{$month: "$datetime"}, 1]}, 3]}, 1]}, 0, 1]}]},
            datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
            price: 1,
            // variation: 1,
            // variation_price: 1,
            stock: 1,
            material: 1,
            material_other: 1
          }
        },
        { $match: {material: material, material_other: '',  datetime: {$gte: startDate, $lte: endDate}} },
        {
          $group: {
            "_id": "$yearQuarter",
            "price": {$avg: "$price"},
            // "variation": {$avg: "$variation"},
            // "variation_price": {$avg: "$variation_price"},
            "stock": {$avg: "$stock"}
          }
        },
        {$sort: {_id: -1}}
      ]);
    }
  } else if (date == 'd4') {
    // 연도별
    if (material == 'PC' || material == 'HR') {
      // 원자재가 PC 또는 HR일 경우 재고량 출력X
      ret = await real_price_trend.aggregate([
        { $project: 
          { 
            datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
            price: 1,
            // variation: 1,
            // variation_price: 1,
            material: 1,
            material_other: 1
          }
        },
        { $match: {material: material, material_other: '',  datetime: {$gte: startDate, $lte: endDate}} },
        {
          $group: {
            // 날짜의 연도만 자른 후 그룹화 -> 그룹 평균 구함
            "_id": {$substr: ['$datetime', 0, 4]},
            "price": {$avg: "$price"},
            // "variation": {$avg: "$variation"},
            // "variation_price": {$avg: "$variation_price"},
          }
        },
        {$sort: {_id: -1}}
      ]);
    } else {
      // 원자재가 PC 또는 HR이 아닐 경우 재고량(PP는 거래량) 출력O
      ret = await real_price_trend.aggregate([
        { $project: 
          { 
            datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
            price: 1,
            // variation: 1,
            // variation_price: 1,
            stock: 1,
            material: 1,
            material_other: 1
          }
        },
        { $match: {material: material, material_other: '',  datetime: {$gte: startDate, $lte: endDate}} },
        {
          $group: {
            "_id": {$substr: ['$datetime', 0, 4]},
            "price": {$avg: "$price"},
            // "variation": {$avg: "$variation"},
            // "variation_price": {$avg: "$variation_price"},
            "stock": {$avg: "$stock"}
          }
        },
        {$sort: {_id: -1}}
      ]);
    }
  }

  for (var r in ret) {
    let index = parseInt(r);
    if (ret[index+1] != undefined && ret[index+1].price != null && ret[index].price != null) {
      // 변동가격 구한 후 소수점 2자리까지 표현
      ret[index].variation = (ret[index].price - ret[index+1].price).toFixed(2);
      // 변동 상승/하락/유지 표현
      if (ret[index].variation > 0) {
        ret[index].variation += '(▲)';
      } else if (ret[index].variation < 0) {
        ret[index].variation += '(▼)';
      } else {
        ret[index].variation += '(-)';
      }

      // 변동율 구한 후 소수점 2자리까지 표현
      ret[index].variation_price = ((ret[index].price/ret[index+1].price-1)*100).toFixed(2);
      // 변동 상승/하락/유지 표현        
      if (ret[index].variation_price > 0) {
        ret[index].variation_price += '(▲)';
      } else if (ret[index].variation_price < 0) {
        ret[index].variation_price += '(▼)';
      } else {
        ret[index].variation_price += '(-)';
      }

    } else if (ret[index+1] == undefined) {
      ret[index].variation = '-';
      ret[index].variation_price = '-';
    }
  }

  for (r in ret) {
    if (ret[r].stock != null) {
      // 재고량 소수점 2자리까지 표현
      ret[r].stock = ret[r].stock.toFixed(2);
    }

    if (ret[r].price != null) {
      // 가격 소수점 2자리까지 표현
      ret[r].price = ret[r].price.toFixed(2);
      // 가격 천단위 표현
      ret[r].price = ret[r].price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }

  res.send(ret);
});

/* 원자재 예측 시황
* 비정형 제외, 비정형 포함
* 현재: 2022-08-18
*/
router.get('/select_price_prediction_chart', async function(req, res, next) {
  let {predict_material, predict_frequency} = req.query;

  // let predict_material = 'al';
  // let predict_frequency = 'f1';

  let now = new Date("2022, 10, 11");
  now.setHours(now.getHours()+9);
  
  // 차트에 표시할 날짜 배열
  let dateArray = [];
  let prevDateArray = [];

  // dateArray의 원소 개수
  let count = 0;

  // 정제된 데이터, return해줄 값
  let dataRefine = [
    {'name': '실제가격',}, 
    {'name': '비정형 제외',}, 
    {'name': '비정형 포함',}, 
    {'name': '가중치 제외',}, 
    {'name': '가중치 포함',}
  ];

  /* predict_freqyency -> 데이터 개수 설정 */
  async function setPeriod(material) {
    if ((material == 'CU' || material == 'AL' || material == 'NI') && predict_frequency == 'f1') {
        count = 4;
        return 20;
    } if ((material == 'CU' || material == 'AL' || material == 'NI') && predict_frequency == 'f2') {
        count = 12;
        return 60;
    } if ((material == 'CU' || material == 'AL' || material == 'NI') && predict_frequency == 'f3') {
        count = 24;
        return 120;
    } if ((material == 'PP' || material == 'PC' || material == 'HR') && predict_frequency == 'f1') {
        count = 4;
        return 4;
    } if ((material == 'PP' || material == 'PC' || material == 'HR') && predict_frequency == 'f2') {
        count = 12;
        return 12;
    } if ((material == 'PP' || material == 'PC' || material == 'HR') && predict_frequency == 'f3') {
        count = 24;
        return 24;
    }
  }

  /* 일주일 단위로 날짜 구하기 */
  async function getWeekDate(count) {

    // dateArray.push(now);
    let currentDate = now;
    
    // 단기/중기/장기_데이터 수: 4/12/24
    for(var i=0; i<count; i++) {
      let newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7);
      newDate.setHours(newDate.getHours()+9);

      dateArray.push(newDate);
      currentDate = newDate;      
    }
  }

  /* 일주일 단위로 날짜 구하기 > 실제 */
  async function getPrevWeekDate() {

    // dateArray.push(now);
    let currentDate = now;
    prevDateArray.unshift(now);
    
    for(var i=0; i<4; i++) {
      let newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7);
      newDate.setHours(newDate.getHours()+9);

      prevDateArray.unshift(newDate);
      currentDate = newDate;
    }
  }

  async function getQueryResult(queryLength) {

    let result = await price_prediction.find(
      {'datetime': {$gte: (now.toISOString())}, 'material': predict_material},
      {'_id': 0, '__v': 0, 'material': 0})
      .limit(queryLength).sort({'datetime': 1});

    return result;
  }

  async function getRealPrice() {

    let dataArray = {};

    for (i in prevDateArray) {
      let ret = await real_price_trend.find(
        {'datetime': {$lte: prevDateArray[i]}, 'material': predict_material, 'material_other': ''},
        {'_id': 0, 'price': 1, 'datetime': 1}
      ).sort({'datetime': -1}).limit(1);

      prevDateArray[i] = prevDateArray[i].toISOString().slice(0, 10);
      if (typeof(ret[0]) != 'undefined') {
        dataArray[prevDateArray[i]] = ret[0].price;
      } else {
          dataArray[prevDateArray[i]] = 0;
      }

      dataRefine[0].data = dataArray;
    }
  }

  async function getAvgField(result, predict_material) {

    // result 5개별로 평균낸 값 저장할 배열
    let dataArray = [];
    let count = 0;
    let index = 0;

    let sumUnstructured_N = 0;
    let sumUnstructured_Y = 0;
    let sumWeighted_N = 0;
    let sumWeighted_Y =0;
    
    // 쿼리 결과 20개 이상이면
    if ((predict_material != 'PP' && predict_material != 'PC' && predict_material != 'HR') &&  result.length >= 20) {

      // 필드별 합
      for (var i in result) {

        let data = {};

        sumUnstructured_N += result[i].unstructured_N;
        sumUnstructured_Y += result[i].unstructured_Y;
        sumWeighted_N += result[i].weighted_N;
        sumWeighted_Y += result[i].weighted_N;

        count++;

        // 쿼리결과 5개씩 평균내서 배열에 넣기
        if (count%5 == 0) {
          data['unstructured_N'] = sumUnstructured_N / 5;
          data['unstructured_Y'] = sumUnstructured_Y / 5;
          data['weighted_N'] = sumWeighted_N / 5;
          data['weighted_Y'] = sumWeighted_Y / 5;

          dataArray[index] = data;

          sumUnstructured_N = 0;
          sumUnstructured_Y = 0;
          sumWeighted_N = 0;
          sumWeighted_Y = 0;

          index++;
        }
      }
    } else {
      // 필드별 합
      for (var i in result) {

        let data = {};

        data['unstructured_N'] = result[i].unstructured_N;
        data['unstructured_Y'] = result[i].unstructured_Y;
        data['weighted_N'] = result[i].weighted_N;
        data['weighted_Y'] = result[i].weighted_N;

        dataArray[index] = data;

        index++;
      }
    }

    return dataArray;
  }

  async function setDataRefine(result) {

    // dataRefine의 각 인덱스 안의 'data'라는 키에 들어갈 값
    let dataArray = {}; 
    let nowFormat = now.toISOString().slice(0, 10);

    //실제값
    dataArray[nowFormat] = dataRefine[0].data[`${nowFormat}`];
    // dataArray[now.toISOString().slice(0, 10)] = 8245;
    // unstructured_N
    for (i in result) {
      dataArray[dateArray[i]] = result[i].unstructured_N;
    }
    dataRefine[1].data = dataArray;
    dataArray = {};

    //실제값
    dataArray[nowFormat] = dataRefine[0].data[`${nowFormat}`];
    // dataArray[now.toISOString().slice(0, 10)] = 8245;
    // unstructured_Y
    for (i in result) {
      dataArray[dateArray[i]] = result[i].unstructured_Y;
    }
    dataRefine[2].data = dataArray;
    dataArray = {};

    //실제값
    dataArray[nowFormat] = dataRefine[0].data[`${nowFormat}`];
    // dataArray[now.toISOString().slice(0, 10)] = 8245;
    // weighted_N
    for (i in result) {
      dataArray[dateArray[i]] = result[i].weighted_N;
    }
    dataRefine[3].data = dataArray;
    dataArray = {};

    //실제값
    dataArray[nowFormat] = dataRefine[0].data[`${nowFormat}`];
    // dataArray[now.toISOString().slice(0, 10)] = 8245;
    // weighted_Y
    for (i in result) {
      
      dataArray[dateArray[i]] = result[i].weighted_Y;
    }
    dataRefine[4].data = dataArray;
  }

  async function main() {

    // predict_material = await setMaterial(predict_material);
    
    // predict_freqyency -> 데이터 개수 설정
    let queryLength = await setPeriod(predict_material);

    await getPrevWeekDate();
    await getWeekDate(count);

    await getRealPrice();

    let queryResult = await getQueryResult(queryLength);

    let result = await getAvgField(queryResult, predict_material);


    // datetime format(YYYY-mm-dd)
    
    for ( i in dateArray) {
      dateArray[i] = dateArray[i].toISOString().slice(0, 10);
    }

    // 소수점 두자리까지 표현
    for (i in result) {
      result[i].datetime = dateArray[i];
      if (result[i].unstructured_N != null) {
        result[i].unstructured_N = result[i].unstructured_N.toFixed(2);
      }
      if (result[i].unstructured_Y != null) {
        result[i].unstructured_Y = result[i].unstructured_Y.toFixed(2);
      }
      if (result[i].weighted_N != null) {
        result[i].weighted_N = result[i].weighted_N.toFixed(2);
      }
      if (result[i].weighted_N != null) {
        result[i].weighted_Y = result[i].weighted_Y.toFixed(2);
      }
    }

    await setDataRefine(result);

    return dataRefine;
  }

  let ret = await main();

  res.send(ret);
});

/* 원자재별 시황:: 예측 시황_테이블 */
router.get('/select_price_prediction', async function(req, res, next) {
  let {predict_material} = req.query;

  var field = ['current', 'month1', 'month3', 'month6'];

  let count1;
  let count3;
  let count6;

  if (predict_material == 'CU' || predict_material == 'AL' || predict_material == 'NI') {
    // 원자재가 CU 또는 AL 또는 NI일 때 가져올 데이터 개수
    // 1개월 후: 20개, 3개월 후: 60개, 6개월 후: 120개
    count1 = 20;
    count3 = 60;
    count6 = 120;
  } else {
    // 원자재가 PC 또는 PP 또는 HR일 때 가져올 데이터 개수
    // 1개월 후: 4개, 3개월 후: 12개, 6개월 후: 24개
    count1 = 4;
    count3 = 12;
    count6 = 24;
  }

  // let GteDateArray = [];
  // let LteDateArray = [];

  let now = new Date();
  // let now = new Date(2022, 7, 28);
  now.setHours(9, 0, 0, 0);
  // let date = new Date();
  // GteDateArray.push(new Date(`${now.getFullYear()}-01-01`));
  // LteDateArray.push(now);

  let result = [];
  let json_N = {};
  let json_Y = {}; 
  let hyundai = {};

  // let count = 1;
  // for(var i=1; i<4; i++) {
  //   let progress = false;
  //   let lteNext = new Date();
  //   lteNext.setMonth(lteNext.getMonth()+count+1);
  //   lteNext.setDate(0);
  //   lteNext.setHours(9, 0, 0, 0);
  //   LteDateArray.push(lteNext);

  //   let gteNext = new Date(lteNext);
  //   gteNext.setDate(1);
  //   GteDateArray.push(gteNext);

  //   if (count == 1){
  //     count += 2;
  //   } else {
  //     count += 3;
  //   }
  // }

  main();

  async function main() {
    await getCurrent();
    await getMonth1();
    await getMonth3();
    await getMonth6();
    
    await getPrepare();
  }

  // 현재값 가져오는 함수
  async function getCurrent() {
    let ret = await real_price_trend.find(
      {
          material: predict_material, material_other: ''
      },
      {'_id': 0, 'datetime': 1, 'price': 1}
    ).sort({datetime: -1}).limit(1);
  
    json_N[field[0]] = ret[0].price;
    json_Y[field[0]] = ret[0].price;
    hyundai[field[0]] = ret[0].price;

    now = ret[0].datetime;
    now.setDate(now.getDate() + 1);

    // if (ret[0] != undefined && ret[0].price != null && ret[0].price != 'null' ) {
    //   json_N[field[0]] = ret[0].price.toFixed(2);
    //   json_Y[field[0]] = ret[0].price.toFixed(2);
    // } else {
    //   json_N[field[0]] = '';
    //   json_Y[field[0]] = '';
    // }
  }
  

  // 1개월 후 예측값 가져오는 함수
  async function getMonth1() {
    let month1 = await price_prediction.find(
      {
          material: predict_material,
          datetime: {$gte: now}
      },
      {'unstructured_1N': 1, 'unstructured_1Y': 1, 'hyundai_1': 1, 'datetime': 1, '_id': 0}
    ).limit(count1);
  
    month1 = month1.reverse();
    let existMonth1 = {};
    let month1_status1 = false;
    let month1_status2 = false;
    let month1_hyundai = false;

    for (i in month1) {

      if (month1[i].unstructured_1N != null && month1_status1 == false) {
        // 쿼리 결과에서 unstructured_1N이 null이 아닌 값 중에 가장 최신 데이터
        existMonth1.unstructured_1N = month1[i].unstructured_1N;
        json_N[field[1]] = existMonth1.unstructured_1N;

        month1_status1 = true;
      }

      if (month1[i].unstructured_1Y != null && month1_status2 == false) {
        // 쿼리 결과에서 unstructured_1Y이 null이 아닌 값 중에 가장 최신 데이터
        existMonth1.unstructured_1Y = month1[i].unstructured_1Y;

        json_Y[field[1]] = existMonth1.unstructured_1Y;

        month1_status2 = true;
      }

      if (month1[i].hyundai_1 != null && month1_hyundai == false) {
        // 쿼리 결과에서 unstructured_1Y이 null이 아닌 값 중에 가장 최신 데이터
        existMonth1.hyundai_1 = month1[i].hyundai_1;

        hyundai[field[1]] = existMonth1.hyundai_1;

        month1_hyundai = true;
      }

      if (month1_status1 == true && month1_status2 == true && month1_hyundai == true) {
        break;
      }

      if (existMonth1.unstructured_1N != undefined) {
        // 쿼리 결과에서 unstructured_1N 데이터가 모두 없을 경우 빈 값 넣어줌
        json_N[field[1]] = '';
      }
  
      if (existMonth1.unstructured_1Y != undefined) {
        // 쿼리 결과에서 unstructured_1N 데이터가 모두 없을 경우 빈 값 넣어줌
        json_Y[field[1]] = '';
      }

      if (existMonth1.hyundai_1 != undefined) {
        // 쿼리 결과에서 hyundai_1 데이터가 모두 없을 경우 빈 값 넣어줌
        hyundai[field[1]] = '';
      }
    }

    if (month1.length == 0) {
      // 조회된 쿼리 결과가 없을 때 빈 값 넣어줌
      json_N[field[1]] = '';
      json_Y[field[1]] = '';
      hyundai[field[1]] = '';
    }

  
    // if (month1[0] != undefined) {
    //   if (month1[0].unstructured_1N != null) {
    //     json_N[field[1]] = month1[0].unstructured_1N.toFixed(2);
    //   } else {
    //     json_N[field[1]] = '';
    //   }
    //   if (month1[0].unstructured_1Y != null) {
    //     json_Y[field[1]] = month1[0].unstructured_1Y.toFixed(2);
    //   } else {
    //     json_Y[field[1]] = '';
    //   }
    // } else {
    //   json_N[field[1]] = '';
    //   json_Y[field[1]] = '';
    // }
    
  }

  // 3개월 후 예측값
  async function getMonth3() {
    let month3 = await price_prediction.find(
      {
          material: predict_material,
          datetime: {$gte: now}
      },
      {'unstructured_3N': 1, 'unstructured_3Y': 1, 'hyundai_3': 1, 'datetime': 1, '_id': 0}
    ).limit(count3);
  
    month3 = month3.reverse();
    let existMonth3 = [];
    let month3_status1 = false;
    let month3_status2 = false;
    let month3_hyundai = false;
    for (i in month3) {

      if (month3[i].unstructured_3N != null && month3_status1 == false) {
        // 쿼리 결과에서 unstructured_3N이 null이 아닌 값 중에 가장 최신 데이터
        existMonth3.unstructured_3N = month3[i].unstructured_3N;
        json_N[field[2]] = existMonth3.unstructured_3N;
        month3_status1 = true;
      }

      if (month3[i].unstructured_3Y != null && month3_status2 == false) {
        // 쿼리 결과에서 unstructured_3N이 null이 아닌 값 중에 가장 최신 데이터
        existMonth3.unstructured_3Y = month3[i].unstructured_3Y;
        json_Y[field[2]] = existMonth3.unstructured_3Y;

        month3_status2 = true;
      }

      if (month3[i].hyundai_3 != null && month3_hyundai == false) {
        // 쿼리 결과에서 unstructured_1Y이 null이 아닌 값 중에 가장 최신 데이터
        existMonth3.hyundai_3 = month3[i].hyundai_3;
        hyundai[field[2]] = existMonth3.hyundai_3;

        month3_hyundai = true;
      }

      if (month3_status1 == true && month3_status2 == true && month3_hyundai == true) {
        break;
      }

      if (existMonth3.unstructured_3N != undefined) {
        // 쿼리 결과에서 unstructured_3N 데이터가 모두 없을 경우 빈 값 넣어줌
        json_N[field[2]] = '';
      }
  
      if (existMonth3.unstructured_3Y != undefined) {
        // 쿼리 결과에서 unstructured_3N 데이터가 모두 없을 경우 빈 값 넣어줌
        json_Y[field[2]] = '';
      }

      if (existMonth3.hyundai_3 != undefined) {
        // 쿼리 결과에서 hyundai_3 데이터가 모두 없을 경우 빈 값 넣어줌
        hyundai[field[2]] = '';
      }
    }

    if (month3.length == 0) {
      // 조회된 쿼리 결과가 없을 때 빈 값 넣어줌
      json_N[field[2]] = '';
      json_Y[field[2]] = '';
      hyundai[field[2]] = '';
    }

  
    // if (month1[0] != undefined) {
    //   if (month1[0].unstructured_1N != null) {
    //     json_N[field[1]] = month1[0].unstructured_1N.toFixed(2);
    //   } else {
    //     json_N[field[1]] = '';
    //   }
    //   if (month1[0].unstructured_1Y != null) {
    //     json_Y[field[1]] = month1[0].unstructured_1Y.toFixed(2);
    //   } else {
    //     json_Y[field[1]] = '';
    //   }
    // } else {
    //   json_N[field[1]] = '';
    //   json_Y[field[1]] = '';
    // }
    
  }


  // 6개월 후 예측값
  async function getMonth6() {
    let month6 = await price_prediction.find(
      {
          material: predict_material,
          datetime: {$gte: now}
      },
      {'unstructured_6N': 1, 'unstructured_6Y': 1, 'hyundai_6': 1, 'datetime': 1, '_id': 0}
    ).limit(count6);

    month6 = month6.reverse();
    let existMonth6 = [];
    let month6_status1 = false;
    let month6_status2 = false;
    let month6_hyundai = false;
    for (i in month6) {

      if (month6[i].unstructured_6N != null && month6_status1 == false) {
        // 쿼리 결과에서 unstructured_6N이 null이 아닌 값 중에 가장 최신 데이터
        existMonth6.unstructured_6N = month6[i].unstructured_6N;
        json_N[field[3]] = existMonth6.unstructured_6N;

        month6_status1 = true;
      }

      if (month6[i].unstructured_6Y != null && month6_status2 == false) {
        // 쿼리 결과에서 unstructured_6N이 null이 아닌 값 중에 가장 최신 데이터
        existMonth6.unstructured_6Y = month6[i].unstructured_6Y;
        json_Y[field[3]] = existMonth6.unstructured_6Y;

        month6_status2 = true;
      }

      if (month6[i].hyundai_6 != null && month6_hyundai == false) {
        // 쿼리 결과에서 hyundai_6이 null이 아닌 값 중에 가장 최신 데이터
        existMonth6.hyundai_6 = month6[i].hyundai_6;
        hyundai[field[3]] = existMonth6.hyundai_6;

        month6_hyundai = true;
      }

      if (month6_status1 == true && month6_status2 == true && month6_hyundai == true) {
        break;
      }

      if (existMonth6.unstructured_6N != undefined) {
        // 쿼리 결과에서 unstructured_6N 데이터가 모두 없을 경우 빈 값 넣어줌
        json_N[field[3]] = '';
      }
  
      if (existMonth6.unstructured_6Y != undefined) {
        // 쿼리 결과에서 unstructured_6N 데이터가 모두 없을 경우 빈 값 넣어줌
        json_Y[field[3]] = '';
      }

      if (existMonth6.hyundai_6 != undefined) {
        // 쿼리 결과에서 hyundai_6 데이터가 모두 없을 경우 빈 값 넣어줌
        hyundai[field[3]] = '';
      }

    }

    if (month6.length == 0) {
      // 조회된 쿼리 결과가 없을 때 빈 값 넣어줌
      json_N[field[3]] = '';
      json_Y[field[3]] = '';
      hyundai[field[3]] = '';
    }

  
    // if (month1[0] != undefined) {
    //   if (month1[0].unstructured_1N != null) {
    //     json_N[field[1]] = month1[0].unstructured_1N.toFixed(2);
    //   } else {
    //     json_N[field[1]] = '';
    //   }
    //   if (month1[0].unstructured_1Y != null) {
    //     json_Y[field[1]] = month1[0].unstructured_1Y.toFixed(2);
    //   } else {
    //     json_Y[field[1]] = '';
    //   }
    // } else {
    //   json_N[field[1]] = '';
    //   json_Y[field[1]] = '';
    // }
    
  }

  // 현재값과 예측값 비교하는 함수
  async function getPrepare() {

    result.push(json_N);
    result.push(json_Y);
    result.push(hyundai);

    for (var i=1; i<4; i++) {
      // 현재가와 1개월 후, 3개월 후, 6개월 후 비교: 비정형 제외
      if (result[0]['current'] != '' && result[0][field[i]] != '' && result[0][field[i]] != undefined) {
        // 변동율 계산
        result[0][`${field[i]}_prepare`] = ((result[0][`${field[i]}`]/result[0]['current']-1)*100).toFixed(0);
      } else {
        result[0][`${field[i]}_prepare`] = '';
      }
  
      // 현재가와 1개월 후, 3개월 후, 6개월 후 비교: 비정형 포함
      if (result[1]['current'] != '' && result[1][field[i]] != '' && result[1][field[i]] != undefined) {
        // 변동율 계산
        result[1][`${field[i]}_prepare`] = ((result[1][`${field[i]}`]/result[1]['current']-1)*100).toFixed(0);
      }else {
        result[1][`${field[i]}_prepare`] = '';
      }

      // 현재가와 1개월 후, 3개월 후, 6개월 후 비교: 현대모비스
      if (result[2]['current'] != '' && result[2][field[i]] != '' && result[2][field[i]] != undefined) {
        // 변동율 계산
        result[2][`${field[i]}_prepare`] = ((result[2][`${field[i]}`]/result[2]['current']-1)*100).toFixed(0);
      }else {
        result[2][`${field[i]}_prepare`] = '';
      }
    }

    setNumDigits();
  }

  // 소수점 두자리까지 표현
  function setNumDigits() {
    for (i in result) {
      for (var j=1; j<4; j++) {
        if (result[i][field[j]] != '' && result[i][field[j]] != undefined) {
          result[i][field[j]] = result[i][field[j]].toFixed(2);
        }
      }
    }

    res.send(result);
  }

});

// 사용변수 시황 데이터 저장
router.get('/insert_price_trend', async function(req, res, next) {

  try {
    const csv_save = require("../csv_save")
    data = await csv_save.jsonSearch();
    
    await price_trend.insertMany(data);

    res.send({ 'result': '데이터 저장 완료' });
  } catch (e) {
      res.json({
          message: "데이터 저장 실패",
          'error': e
      });
  }
})

// 사용변수 시황 데이터 조회
router.get('/select_price_trend', async function(req, res, next) {

  try {
    let { material, material_other, startDate, endDate } = req.query;
    
    const data = await price_trend.aggregate([
      { $project: 
          { 
              datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
              price: 1,
              material: 1,
              material_other: 1
          }
      },
      { $match: { material : material, material_other : material_other, datetime: {$gte: startDate, $lte: endDate}} }
  ])

    res.send(data);
  } catch (e) {
      res.json({
          message: "데이터 조회 실패",
          'error': e
      });
  }
});


// 원자재 테이블 데이터 저장
router.get('/insert_real_price_trend', async function(req, res, next) {

  try {
    const csv_save = require("../real_price_trend_ctj")
    data = await csv_save.jsonSearch();
    
    await real_price_trend.insertMany(data);

    res.send({ 'result': '데이터 저장 완료' });
  } catch (e) {
      res.json({
          message: "데이터 저장 실패",
          'error': e
      });
  }
});

// 원자재 테이블 데이터 가져오기
router.get('/select_real_price_trend', async function(req, res, next) {

  try {
    let { material, material_other, startDate, endDate } = req.query;

    const data = await real_price_trend.aggregate([
      { $project: 
          { 
              datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
              price: 1,
              material: 1,
              material_other: 1
          }
      },
      { $match: { material : material, material_other : material_other, datetime: {$gte: startDate, $lte: endDate}} }
  ])

    // console.log('데이터 조회');
    // console.log(data);

    res.send(data);
  } catch (e) {
      res.json({
          message: "데이터 조회 실패",
          'error': e
      });
  }
});

// 사용변수 시황 재고량 데이터 조회
router.get('/select_real_price_trend_stock', async function(req, res, next) {

  try {
    let { material, material_other, startDate, endDate } = req.query;
    
    const data = await real_price_trend.aggregate([
      { $project: 
          { 
              datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
              stock: 1,
              material: 1,
              material_other: 1
          }
      },
      { $match: { material : material, material_other : material_other, datetime: {$gte: startDate, $lte: endDate}} }
  ])

    // console.log('데이터 조회');
    // console.log(data);

    res.send(data);
  } catch (e) {
      res.json({
          message: "데이터 조회 실패",
          'error': e
      });
  }
});

router.get('/select_real_trend', async function(req, res, next) {
  let ret = await select(dbConfig.real_trend)
  .then()
  .catch(console.error)
  .finally(() => client.close());

  res.send(ret);
});

router.get('/select_doc_keyword', async function(req, res, next) {
  let ret = await select(dbConfig.doc_keyword)
  .then()
  .catch(console.error)
  .finally(() => client.close());

  res.send(ret);
});

router.get('/select_topic_keyword', async function(req, res, next) {

  let ret = await select(dbConfig.topic_keyword)
  .then()
  .catch(console.error)
  .finally(() => client.close());

  res.send(ret);
});

module.exports = router;
mongoose.connection.on('disconnected', () => {
  console.error('retry connection');
  this.connect();
});

/* GET home page. */
async function select(collectionName){

  var db = client.db(dbConfig.dbName);
  var collection = db.collection(collectionName);
  filteredDocs = await collection.find({}).toArray();

  return filteredDocs
}

router.get('/select_price_prediction', async function (req, res, next) {

  let ret = await select(dbConfig.dbName.price_prediction)
  .then()
  .catch(console.error)
  .finally(() => client.close());

  res.send(ret);
});

/* db에 데이터 삽입 후 출력 (일, 월, 연)
* vpn에 session 정보 입력 후 저장
* putty에 키 파일 등록: SSH > Auth
*/

/* 원자재별 시황:: 원자재 시황_일별 데이터 추출 */
router.get('/select_real_trend_day', async function(req, res, next) {

  let { material } = req.query;
  let ret;

  // if (material == 'PP') {
  //   ret = await real_price_trend.find(
  //     {material: material, material_other: ""}, 
  //     {"datetime": 1, "price": 1, "variation": 1, "variation_price": 1, "stock": 1, "_id": 0}
  //   ).sort({datetime: -1}).limit(7)
  // } 
  if(material == 'PC' || material == 'HR') {
    // 원자재가 PC 또는 HR일 경우 재고량 출력X
    ret = await real_price_trend.aggregate([
      {
        $project: {
          datetime: {$dateToString: {format: "%Y-%m-%d", date: "$datetime"}},
              "price": "$price",
              "variation": "$variation",
              "variation_price": "$variation_price",
              "material_other": "$material_other",
              "material": "$material",
              "material_other": "$material_other",
        }
      },
      {
        $match: {material: material, material_other: ''}
      },
      {
        $group: {
          "_id": "$datetime",
          "price": {$first: "$price"},
          "variation": {$first: "$variation"},
          "variation_price": {$first: "$variation_price"},
        }
      },
      {'$sort': {'_id': -1}},
      {'$limit': 7}
    ])
  } else {
    // 원자재가 PC 또는 HR이 아닐 경우 재고량(PP는 거래량) 출력O
    ret = await real_price_trend.aggregate([
      {
        $project: {
          datetime: {$dateToString: {format: "%Y-%m-%d", date: "$datetime"}},
              "price": "$price",
              "variation": "$variation",
              "variation_price": "$variation_price",
              "stock": "$stock",
              "material_other": "$material_other",
              "material": "$material"
        }
      },
      {
        $match: {material: material, material_other: ''}
      },
      {
        $group: {
          "_id": "$datetime",
          "price": {$first: "$price"},
          "variation": {$first: "$variation"},
          "variation_price": {$first: "$variation_price"},
          "stock": {$first: "$stock"}
        }
      },
      {'$sort': {'_id': -1}},
      {'$limit': 7}
    ])
  }

  res.send(ret);
});

/* 원자재별 시황:: 원자재 시황_월별 데이터 추출 */
router.get('/select_real_trend_month', async function(req, res, next) {

  let { material } = req.query;
  let ret;

  if (material == 'PC' || material == 'HR') {
    // 원자재가 PC 또는 HR일 경우 재고량 출력X
    ret = await real_price_trend.aggregate([
      {
        $project: {
          yearMonth: {$dateToString: {format: "%Y-%m", date: "$datetime"}},
              "price": "$price",
              "variation": "$variation",
              "variation_price": "$variation_price",
              "material_other": "$material_other",
              "material": "$material"
        }
      },
      {
        $match: {material: material, material_other: ''}
      },
      {
        $group: {
          "_id": "$yearMonth",
          "price": {$avg: "$price"},
          "variation": {$avg: "$variation"},
          "variation_price": {$avg: "$variation_price"},
        }
      },
      {'$sort': {'_id': -1}},
      {'$limit': 7}
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
              year: {$dateToString: {format: "%Y-%m", date: "$datetime"}},
              "price": "$price",
              "variation": "$variation",
              "variation_price": "$variation_price",
              "stock": "$stock",
              "material_other": "$material_other",
              "material": "$material"
          }
      },
      {
        $match: {material: material, material_other: ''}
      },
      {
          /*
              -id(project의 yearMonth) 기준으로
              price, variation, variation_price, stock의 평균을 각각 리턴
          */
          $group: {
                  "_id": "$year",
                  "price": {$avg: "$price"},
                  "variation": {$avg: "$variation"},
                  "variation_price": {$avg: "$variation_price"},
                  "stock": {$avg: "$stock"}
          }
          
      },
      // 날짜 내림차 순
      {'$sort': {'_id': -1}},
      // 일곱개만
      {'$limit': 7}
    ]);
  }

  for (var i = 0; i<ret.length-1; i++) {
    // 변동가격 구하기
    ret[i].variation = ret[i].price - ret[i +1].price;
    // 변동율 구하기
    ret[i].variation_price = (ret[i].variation / ret[i +1].price) * 100
  }

  res.send(ret);
});

/* 분기별 데이터 추출 */
router.get('/select_real_trend_quarter', async function(req, res, next) {

  let { material } = req.query;
  let ret;

  if (material == 'PC' || material == 'HR') {
    // 원자재가 PC 또는 HR일 경우 재고량 출력X
    ret = await real_price_trend.aggregate([
      {
          $project: {
              "yearQuarter": {$concat: [{$dateToString: {format: "%Y", date: "$datetime"}}, "-", {$substr: [{$add: [{$divide: [{$subtract: [{$month: "$datetime"}, 1]}, 3]}, 1]}, 0, 1]}]},
              "price": "$price",
              "variation": "$variation",
              "variation_price": "$variation_price",
              "material_other": "$material_other",
              "material": "$material"
          }
      },
      {
          $match: {material: material, material_other: ''}
      },
      {
          $group: {
              "_id": "$yearQuarter",
              "price": {$avg: "$price"},
              "variation": {$avg: "$variation"},
              "variation_price": {$avg: "$variation_price"},
          }
      },
      {'$sort': {'_id': -1}},
      {'$limit': 7}
    ]);
  } 
  else {
    // 원자재가 PC 또는 HR이 아닐 경우 재고량(PP는 거래량) 출력O
    ret = await real_price_trend.aggregate([
      {
          $project: {
              "yearQuarter": {$concat: [{$dateToString: {format: "%Y", date: "$datetime"}}, "-", {$substr: [{$add: [{$divide: [{$subtract: [{$month: "$datetime"}, 1]}, 3]}, 1]}, 0, 1]}]},
              "price": "$price",
              "variation": "$variation",
              "variation_price": "$variation_price",
              "stock": "$stock",
              "material_other": "$material_other",
              "material": "$material"
          }
      },
      {
          $match: {material: material, material_other: ''}
      },
      {
          $group: {
              "_id": "$yearQuarter",
              "price": {$avg: "$price"},
              "variation": {$avg: "$variation"},
              "variation_price": {$avg: "$variation_price"},
              "stock": {$avg: "$stock"}
          }
      },
      {'$sort': {'_id': -1}},
      {'$limit': 7}
    ]);
  }
  
  for (var i = 0; i<ret.length-1; i++) {
    // 변동가격 구하기
    ret[i].variation = ret[i].price - ret[i +1].price;
    // 변동율 구하기
    ret[i].variation_price = (ret[i].variation / ret[i +1].price) * 100;
  }

  res.send(ret);
});

/* 원자재별 시황:: 원자재 시황_연도별 데이터 추출 */
router.get('/select_real_trend_year', async function(req, res, next) {

  let { material } = req.query;
  let ret;

  if (material == 'PC' || material == 'HR') {
    // 원자재가 PC 또는 HR일 경우 재고량 출력X
    ret = await real_price_trend.aggregate([
      {
          // project 먼저 실행
          /*
              year <= $datetime을 0000 형식으로 변경 후 대입
              price, variation, variation_price, stock 모두 가져옴
          */
          $project: {
              year: {$dateToString: {format: "%Y", date: "$datetime"}},
              "price": "$price",
              "variation": "$variation",
              "variation_price": "$variation_price",
              "material_other": "$material_other",
              "material": "$material"
          }
      },
      {
        $match: {material: material, material_other: ''}
      },
      {
          /*
              -id(project의 yearMonth) 기준으로
              price, variation, variation_price, stock의 합을 각각 리턴
          */
          $group: {
                  "_id": "$year",
                  "price": {$avg: "$price"},
                  "variation": {$avg: "$variation"},
                  "variation_price": {$avg: "$variation_price"},
          }
          
      },
      // 날짜 내림차 순
      {'$sort': {'_id': -1}},
      {'$limit': 7}
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
              year: {$dateToString: {format: "%Y", date: "$datetime"}},
              "price": "$price",
              "variation": "$variation",
              "variation_price": "$variation_price",
              "stock": "$stock",
              "material_other": "$material_other",
              "material": "$material"
          }
      },
      {
        $match: {material: material, material_other: ''}
      },
      {
          /*
              -id(project의 yearMonth) 기준으로
              price, variation, variation_price, stock의 합을 각각 리턴
          */
          $group: {
                  "_id": "$year",
                  "price": {$avg: "$price"},
                  "variation": {$avg: "$variation"},
                  "variation_price": {$avg: "$variation_price"},
                  "stock": {$avg: "$stock"}
          }
          
      },
      // 날짜 내림차 순
      {'$sort': {'_id': -1}},
      {'$limit': 7}
    ]);
  }

  for (var i = 0; i<ret.length-1; i++) {
    // 변동가격 구하기
    ret[i].variation = ret[i].price - ret[i +1].price;
    // 변동율 구하기
    ret[i].variation_price = (ret[i].variation / ret[i +1].price) * 100;
  }

  res.send(ret);
});

/* xlsx to json -> json 
* 데이터 -> real_price_trend save
*/
router.get('/insert_real_trend', async function(req, res, next) {
  var xlsxToJson = require('../public/json/xlsxToJson');

  const data = await xlsxToJson.xlsxToJSON();
  await real_price_trend.insertMany(data)
  .then(/* console.log('===== insert data =====') */)
  .catch(console.error);

  res.send(data);
})

// 사용변수 시황 데이터 저장
router.get('/insert_price_trend', async function(req, res, next) {

  try {
    const csv_save = require("../csv_save")
    data = await csv_save.jsonSearch();
    
    await price_trend.insertMany(data);

    // console.log('데이터 저장 완료');
    // console.log(data);

    res.send({ 'result': '데이터 저장 완료' });
  } catch (e) {
      res.json({
          message: "데이터 저장 실패",
          'error': e
      });
  }
})

// 사용변수 시황 데이터 조회
router.get('/select_price_trend', async function(req, res, next) {

  try {
    let { material, material_other, startDate, endDate } = req.query;

    const data = await price_trend.aggregate([
      { $project: 
          { 
              datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
              price: 1,
              material: 1,
              material_other: 1
          }
      },
      { $match: { material : material, material_other : material_other, datetime: {$gte: startDate, $lte: endDate}} }
  ])

    res.send(data);
  } catch (e) {
      res.json({
          message: "데이터 조회 실패",
          'error': e
      });
  }
});

//모니터링지표 시황 가격, 거래량 차트
router.get('/price_volume_chart', async function(req, res, next) {

  try {
    let { material, startDate, endDate } = req.query;
    const data = await real_price_trend.find({datetime: { '$gte': new Date(startDate+'T00:00:00.000Z'), '$lte': new Date(endDate+'T23:59:59.999Z')},
                                              "material":material, "material_other":""}).sort({datetime: 1});
    res.send(data);
  } catch (e){
      res.json({
        message: "데이터 조회 실패",
        'error': e
      });
  }

});


//종합상황판 리스크
// router.get('/main_risk', async function(req, res, next) {
//   try{
//     let data = await risk.find({});
//     let result = [];
//     for await(let d of data){
//       var json = {};
//       console.log(dbConfig.dbName)
      
//       d.price_info[0] = d.price_info[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//       d.price_info[1] = d.price_info[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//       d.real_price[0] = d.real_price[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//       d.real_price[1] = d.real_price[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//       d.price_prediction[0] = d.price_prediction[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//       d.price_prediction[1] = d.price_prediction[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//       d.news[0] = d.news[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//       d.news[1] = d.news[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

//       json.material = d.material;
//       json.rank = d.rank;
//       json.pre_rank = d.pre_rank;

//       var symbol = ""
//       if(d.price_info[4][0] == "-"){
//         symbol = "▼";
//       }else if(d.price_info[0] == d.price_info[1]){
//         symbol = "-";
//       }else{
//         symbol = "▲";
//       }
      
//       json.price_info = d.price_info[0]+" → "+d.price_info[1]+"("+d.price_info[2]+symbol+")";
      
//       json.price_info_ago = d.price_info[5];
//       json.price_info_today = d.price_info[0];
//       json.price_info_unit = "(USD/ton)"
//       json.price_info_per = d.price_info[4];
//       json.price_info_symbol = symbol;
//       symbol = ""
//       if(d.real_price[2][0] == "-"){
//         symbol = "▼";
//       }else if(d.real_price[0] == d.real_price[1]){
//         symbol = "-";
//       }else{
//         symbol = "▲";
//       }
//       json.real_price = d.real_price[0]+" → "+d.real_price[1]+"("+d.real_price[2]+symbol+")";

//       symbol = ""
//       if(d.price_prediction[2][0] == "-"){
//         symbol = "▼";
//       }else if(d.price_prediction[0] == d.price_prediction[1]){
//         symbol = "-";
//       }else{
//         symbol = "▲";
//       }
//       json.price_prediction = d.price_prediction[0]+" → "+d.price_prediction[1]+"("+d.price_prediction[2]+symbol+")";

//       symbol = ""
//       if(d.news[2][0] == "-"){
//         symbol = "▼";
//       }else if(d.news[0] == d.news[1]){
//         symbol = "-";
//       }else{
//         symbol = "▲";
//       }
//       json.news = d.news[0]+" → "+d.news[1]+"("+d.news[2]+symbol+")";
//       json.report = d.report
      
//       if(d.material == "Cu"){
//         json.info = "(구리)";
        
//       }else if(d.material == "Al"){
//         json.info = "(알루미늄)";
        
//       }else if(d.material == "Ni"){
//         json.info = "(니켈)";
        
//       }else if(d.material == "HR"){
//         json.info = "(열연코일)";
        
//       }else if(d.material == "PP"){
//         json.info = "(폴리프로필렌)";
        
//       }else if(d.material == "PC"){
//         json.info = "(폴리카보네이트)";
        
//       }
//       result.push(json);
      
//     }
//     res.send(result);
//   }catch(e){
//     res.json({
//       message: "데이터 조회 실패",
//       'error': e
//     });
//   }
// });

/* 종합상황판:: 키워드뉴스 */
router.get('/main_keywordNews', async function(req, res, next) {
  try {
    let result = [];
    let materials = ["CU", "AL", "NI", "PP", "PC", "HR", "all"];
    let reg = /[\{\}\[\]\/?]/gi;

    let now = new Date();
    now.setHours(now.getHours()+9);

    // currentDate: DOCUMENT 테이블의 데이터 중 가장 최신데이터에 해당하는 날짜
    let currentDate = (await document.find({}, {_id: 0, datetime: 1}).sort({datetime:-1}).limit(1))[0].datetime;
    // 날짜 형식 맞춰주기(2022-12-16T00:00:00.000Z -> 2022-12-16)
    currentDate = currentDate.toISOString().slice(0, 10);

    for (let material of materials) {
      let ret = await document.aggregate([
        {
          $project:
          {
            _id: 0,
            material: 1,
            datetime: {$dateToString: {format: "%Y-%m-%d", date: "$datetime"}},
            doc_title: 1,
            doc_url: 1,
            topics: 1,
            prob: 1
          }
        },
        {
          $match: {
            datetime: currentDate, material: material
          }
        },
        { $sort: { prob: -1 }}
      ]);
  
      for (i in ret) {
        if(ret[i].doc_title.length > 20){
          // 원문의 title이 20자를 초과한다면 20자로 잘라주기
          ret[i].doc_title = ret[i].doc_title.substring(0, 20);
        }
        
        // topics 괄호 제거
        ret[i].topics = ret[i].topics.split(',', 5).toString().replace(reg, '');
  
        // 선택한 키워드가 다섯개 안에 없을 때 마지막 한개 삭제하고 맨 앞에 해당 키워드 추가
        // if (ret[i].topics.indexOf(topic) == -1) {
        //   ret[i].topics = ret[i].topics.split(',', 4);
        //   ret[i].topics = `\'${topic}\', ` + ret[i].topics;
        // }
        result.push(ret[i]);
      }
    }
    
    res.send(result);
  
  } catch(e) {
    res.json({
      message: "데이터 조회 실패",
      'error': e
    });
  }
});

//원자재별 시황 사용예측 리스크
router.get('/main_materialMarket_risk', async function(req, res, next) {
  try{

    let cu = await risk.find({material:"Cu"});
    let al = await risk.find({material:"Al"});
    let ni = await risk.find({material:"Ni"});
    let pp = await risk.find({material:"PP"});
    let pc = await risk.find({material:"PC"});
    let hr = await risk.find({material:"HR"});

    let material = [cu[0], al[0], ni[0], pp[0], pc[0], hr[0] ];
    let result = [];
    // var d = data[0];

    for (i of material) {
      var json = {};
      json.material = i.material

      json.real_price_per = parseFloat(i.real_price[2].slice(0,-1));
      if(json.real_price_per < 0){
        json.real_price_per = 0;
      }
      json.price_prediction_per = parseFloat(i.price_prediction[2].slice(0,-1));
      if(json.price_prediction_per < 0){
        json.price_prediction_per = 0;
      }
      json.news_per = parseFloat(i.news[2]);
      if(json.news_per < 0){
        json.news_per = 0;
      }
      json.report_per = parseFloat(i.report[0]);
      if(json.report_per < 0){
        json.report_per = 0;
      }
      result.push(json);
    }

     // json.price_info = d.price_info[0]+" → "+d.price_info[1]+"("+d.price_info[2]+symbol+")";
    // json.real_price = "실제가격 변동 : "+d.real_price[0]+"에서 "+d.real_price[1]+"로 "+d.real_price[2]+" "+(d.price_info[2][0] !="-" ? "증가":"감소");    
    // json.price_prediction = "예측가격 변동 : "+d.price_prediction[0]+"에서 "+d.price_prediction[1]+"로 "+d.price_prediction[2]+" "+(d.price_prediction[2][0] !="-" ? "증가":"감소");
    // json.news = "뉴스/미디어 변동 : "+d.news[0]+"에서 "+d.news[1]+"로 "+d.news[2]+" "+(d.news[2][0] !="-" ? "증가":"감소");
    // json.report_now = d.report[0];
    // json.report_rank = d.report[1];

    // result.push(json);
    // console.log(result);
    res.send(result);
  }catch(e){
    res.json({
      message: "데이터 조회 실패",
      'error': e
    });
  }
});

//원자재별 시황 사용예측 리스크
router.get('/materialMarket_risk', async function(req, res, next) {
  try{

    let { material } = req.query;

    if(material == "CU"){
      material = "Cu"
    }else if(material == "AL"){
      material = "Al"
    }else if(material == "NI"){
      material = "Ni"
    }
    const data = await risk.find({"material" : material});
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

    var symbol = ""
    if(d.price_info[4][0] == "-"){
      symbol = "▼";
    }else if(d.price_info[0] == d.price_info[1]){
      symbol = "-";
    }else{
      symbol = "▲";
    }


    json.price_info = d.price_info[0]+" → "+d.price_info[1]+"("+d.price_info[2]+symbol+")";
    json.price_info_ago = d.price_info[1];
    json.price_info_now = d.price_info[0];
    json.price_info_sd = d.price_info[2];
    json.price_info_ed = d.price_info[3];
    json.price_info_per = d.price_info[4];
    // json.price_info_sd = d.price_info[2]+ " 기준";
    // json.price_info_ed = d.price_info[3]+ " 기준 | USD/ton";
    // json.price_info_per = "("+d.price_info[4];
    json.price_info_symbol = symbol;
    // json.price_info = d.price_info[1]+" → "+d.price_info[0];
    // json.price_info_per = d.price_info[2];
    // json.price_info_symbol = symbol;

    if(d.real_price[2][0] == "-"){
      symbol = "▼";
    }else if(d.real_price[0] == d.real_price[1]){
      symbol = "-";
    }else{
      symbol = "▲";
    }
    
    // json.real_price = d.real_price[1]+" → "+d.real_price[0];
    // json.real_price_per = d.real_price[2]
    // json.real_price_symbol = symbol;
    json.real_price_ago = d.real_price[1];
    json.real_price_now = d.real_price[0];
    json.real_price_per = d.real_price[2];
    json.real_price_rank = d.real_price[3];
    json.real_price_symbol = symbol;

    if(d.price_prediction[2][0] == "-"){
      symbol = "▼";
    }else if(d.price_prediction[0] == d.price_prediction[1]){
      symbol = "-";
    }else{
      symbol = "▲";
    }
    // json.price_prediction = d.price_prediction[1]+" → "+d.price_prediction[0];
    // json.price_prediction_per = d.price_prediction[2];
    // json.price_prediction_symbol = symbol;
    json.price_prediction_ago = d.price_prediction[1];
    json.price_prediction_now = d.price_prediction[0];
    json.price_prediction_per = d.price_prediction[2];
    json.price_prediction_rank = d.price_prediction[3];
    json.price_prediction_symbol = symbol;
    
    if(d.news[2][0] == "-"){
      symbol = "▼";
    }else if(d.news[0] == d.news[1]){
      symbol = "-";
    }else{
      symbol = "▲";
    }
    // json.news = d.news[0]+" → "+d.news[1];
    // json.news_per = d.news[2];
    // json.news_symbol = symbol;
    // json.report = d.report;
    json.news_ago = d.news[0];
    json.news_now = d.news[1];
    json.news_per = d.news[2];
    json.news_rank = d.news[3];
    json.news_symbol = symbol;

     // json.price_info = d.price_info[0]+" → "+d.price_info[1]+"("+d.price_info[2]+symbol+")";
    // json.real_price = "실제가격 변동 : "+d.real_price[0]+"에서 "+d.real_price[1]+"로 "+d.real_price[2]+" "+(d.price_info[2][0] !="-" ? "증가":"감소");    
    // json.price_prediction = "예측가격 변동 : "+d.price_prediction[0]+"에서 "+d.price_prediction[1]+"로 "+d.price_prediction[2]+" "+(d.price_prediction[2][0] !="-" ? "증가":"감소");
    // json.news = "뉴스/미디어 변동 : "+d.news[0]+"에서 "+d.news[1]+"로 "+d.news[2]+" "+(d.news[2][0] !="-" ? "증가":"감소");
    json.report_now = d.report[0];
    json.report_rank = d.report[1];

    result.push(json);
    res.send(result);
  }catch(e){
    res.json({
      message: "데이터 조회 실패",
      'error': e
    });
  }
});

// 가격동향 실제 / 예측 데이터 조회
router.get('/select_real_prediction_price_trend', async function (req, res, next) {

  try {

    var dateArr = []
    var realArr = []
    var uNArr = []
    var uYArr = []
    var wNArr = []
    var wYArr = []

    let { material, real_startDate, real_endDate, predict_startDate, predict_endDate } = req.query;

    // 실제데이터 : 오늘 날짜 데이터 가져오기
    const real_data = await real_price_trend.aggregate([
      {
        $project:
        {
          _id: 0,
          datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
          price: 1,
          material: 1,
          material_other:1
        }
      },
      { $match: { material: material, material_other:"", datetime: { $gte: real_startDate, $lte: real_endDate } } },
      { $sort: { datetime: -1} },
      { $limit: 8 },
      { $sort: {datetime: 1}},
    ])

    for (i in real_data) {
      dateArr.push(real_data[i].datetime);
      realArr.push(real_data[i].price);
      uNArr.push(null);
      uYArr.push(null);
      wNArr.push(null);
      wYArr.push(null);
    }
    uNArr[uNArr.length - 1] = realArr[realArr.length - 1];
    uYArr[uYArr.length - 1] = realArr[realArr.length - 1];
    wNArr[wNArr.length - 1] = realArr[realArr.length - 1];
    wYArr[wYArr.length - 1] = realArr[realArr.length - 1];

    // 예측데이터 가져오기
    const predict_data = await price_prediction.aggregate([
      {
        $project:
        {
          _id: false,
          datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
          unstructured_N: 1,
          unstructured_Y: 1,
          weighted_N: 1,
          weighted_Y: 1,
          material: 1,
        }
      },
      { $match: { material: material, datetime: { $gt: predict_startDate, $lte: predict_endDate } } }
    ])

    let x = Math.floor(predict_data.length / 4);
    for (let i = 0; i < x*4; i += x) {
      let sum1 = 0;
      let sum2 = 0;
      let sum3 = 0;
      let sum4 = 0;
      
      for (let j = i; j< i+x; j++) {
        sum1 += predict_data[j].unstructured_N;
        sum2 += predict_data[j].unstructured_Y;
        sum3 += predict_data[j].weighted_N;
        sum4 += predict_data[j].weighted_Y;
      }
      dateArr.push(predict_data[i].datetime)
      uNArr.push(sum1/x);
      uYArr.push(sum2/x);
      wNArr.push(sum3/x);
      wYArr.push(sum4/x);
    }
    
    var array = [];
    var name = [];
    array = [realArr, uNArr, uYArr, wNArr, wYArr];
    name = ['실제 가격', '비정형(뉴스/보고서)제외', '비정형(뉴스/보고서)포함', '가중치(전문가예측)제외', '가중치(전문가예측)포함']
    
    var result = []
    for (i in array) {
      var obj = {}
      obj.name = name[i];
      obj.data = array[i];
      obj.date = dateArr;
      result.push(obj);
    }
    
    // console.log(result);

    res.send(result);
  } catch (e) {
    res.json({
      message: "데이터 조회 실패",
      'error': e
    });
  }
});

//종합상황판 종합가격 현황
router.get('/main_multi_price', async function(req, res, next) {
  try{
    let ret = [];
    let unit = ['LME', 'LME', 'LME', 'CFR FEA', 'CIF China', 'FOB China'];
    let frequency = ['(일간)', '(일간)', '(일간)', '(주간)', '(주간)', '(주간)'];
    let url = [
      'http://www.nonferrous.or.kr/stats/?act=sub3',
      'http://www.nonferrous.or.kr/stats/?act=sub3',
      'http://www.nonferrous.or.kr/stats/?act=sub3',
      '',
      '',
      ''
    ]

    // let cu = await real_price_trend.find({material:"CU",material_other:""}).sort({'datetime':-1}).limit(1);
    // let al = await real_price_trend.find({material:"AL",material_other:""}).sort({'datetime':-1}).limit(1);
    // let ni = await real_price_trend.find({material:"NI",material_other:""}).sort({'datetime':-1}).limit(1);
    // let hr = await real_price_trend.find({material:"HR",material_other:""}).sort({'datetime':-1}).limit(1);
    // let pp = await real_price_trend.find({material:"PP",material_other:""}).sort({'datetime':-1}).limit(1);
    // let pc = await real_price_trend.find({material:"PC",material_other:""}).sort({'datetime':-1}).limit(1);

    let cu = await getMultiPrice("CU");
    let al = await getMultiPrice("AL");
    let ni = await getMultiPrice("NI");
    let pp = await getMultiPrice("PP");
    let pc = await getMultiPrice("PC");
    let hr = await getMultiPrice("HR");

    let material_Arr = [
      ...cu,
      ...al,
      ...ni,
      ...pp,
      ...pc,
      ...hr
    ];

    const cu_scenario = await scenario.find({material:"CU"});
    const al_scenario = await scenario.find({material:"AL"});
    const ni_scenario = await scenario.find({material:"NI"});
    const pp_scenario = await scenario.find({material:"PP"});
    const pc_scenario = await scenario.find({material:"PC"});
    const hr_scenario = await scenario.find({material:"HR"});

    let pattern_arr = [cu_scenario[0], al_scenario[0], ni_scenario[0], pp_scenario[0], pc_scenario[0], hr_scenario[0]];
    let pattern_result = [];

    for(let i in material_Arr){
      let scenario_arr = [pattern_arr[i].climate, pattern_arr[i].disease, pattern_arr[i].war];
      let max = 0;

      for(let j in scenario_arr){
    
        if(max < scenario_arr[j]){
          max = scenario_arr[j];
        }
      }
      pattern_result.push(max);
    }
    
    //let risk_rank = await risk.find({});

    // const cu_secondRecent = await getVariance('CU', material_Arr[0].datetime);
    // const al_secondRecent = await getVariance('AL', material_Arr[1].datetime);
    // const ni_secondRecent = await getVariance('NI', material_Arr[2].datetime);
    // const pp_secondRecent = await getVariance('PP', material_Arr[3].datetime);
    // const pc_secondRecent = await getVariance('PC', material_Arr[4].datetime);
    // const hr_secondRecent = await getVariance('HR', material_Arr[5].datetime);
    // let secondRecent_arr = [cu_secondRecent[0], al_secondRecent[0], ni_secondRecent[0], pp_secondRecent[0], pc_secondRecent[0], hr_secondRecent[0]];
    // let variance_arr = [];
    // let varianceStatus_arr = [];
    // let varianceRate_arr = [];

    // for(var i in material_Arr) {
    //   if(material_Arr[i].price !== null && secondRecent_arr[i].price !== null) {
    //     let varianceRate = ((material_Arr[i].price/secondRecent_arr[i].price)-1)*100;
    //     variance_arr[i] = material_Arr[i].price - secondRecent_arr[i].price;
    //     varianceRate_arr[i] = `${varianceRate.toFixed(2)}%`;

    //     if(material_Arr[i].price > secondRecent_arr[i].price) {
    //       varianceStatus_arr[i] = '▲';
    //     } else if(material_Arr[i].price < secondRecent_arr[i].price) {
    //       varianceStatus_arr[i] = '▼';
    //     } else {
    //       // variance_arr[i] = '';
    //       varianceStatus_arr[i] = '-';
    //       // varianceRate_arr[i] = ''
    //     }
    //   } else {
    //     // variance_arr[i] = '';
    //     varianceStatus_arr[i] = '-';
    //     // varianceRate_arr[i] = '';
    //   }
    // }

    let variationStatus_arr = [];
    for(var i in material_Arr) {
      if (material_Arr[i].variation > 0) {
        variationStatus_arr[i] = '▲';
      } else if (material_Arr[i].variation < 0) {
        variationStatus_arr[i] = '▼';
      } else {
        variationStatus_arr[i] = '-';
      }
    }

    // update_time
    let update_time = await real_price_trend.find({}, {_id: 0, update_time: 1}).sort({update_time: -1}).limit(1);
    update_time = update_time[0].update_time.toISOString().slice(0, -5).replace("T", " ");

    for(var i in material_Arr){
      var json = {};
      json.material = material_Arr[i].material;
      json.price = material_Arr[i].price.toFixed(0);
      json.variation = material_Arr[i].variation;
      json.variation_price = `${material_Arr[i].variation_price.toFixed(2)}%`;
      json.variation_status = variationStatus_arr[i];
      json.update_time = update_time;
      // json.varianceRate = varianceRate_arr[i];
      //json.risk_rank = risk_rank[i].rank;
      json.pattern = pattern_result[i];
      json.datetime = material_Arr[i].datetime;
      // json.datetime = material_Arr[i].datetime.substring(2,);
      json.frequency = frequency[i];
      json.unit = unit[i];
      json.url = url[i];
      ret.push(json)

    }
    res.send(ret);

  }catch (e) {
    res.json({
      message: "데이터 조회 실패",
      'error': e
    });
  }
});

// 종합 상황판 - 영향 키워드 동향 테이블
router.get('/main_effect_keyword_rank', async function(req, res, next) {
  try {
    let datetime = new dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    let cu = await topic_main.find({material: 'CU', datetime: new Date(datetime)}).sort({rank:1});
    let al = await topic_main.find({material: 'AL', datetime: new Date(datetime)}).sort({rank:1});
    let ni = await topic_main.find({material: 'NI', datetime: new Date(datetime)}).sort({rank:1});
    let pp = await topic_main.find({material: 'PP', datetime: new Date(datetime)}).sort({rank:1});
    let pc = await topic_main.find({material: 'PC', datetime: new Date(datetime)}).sort({rank:1});
    let hr = await topic_main.find({material: 'HR', datetime: new Date(datetime)}).sort({rank:1});

    let data = []
    for (i in cu) {
      data.push([cu[i], al[i], ni[i], pp[i], pc[i], hr[i]])
    }

    res.send(data);

  } catch (e) {
      res.json({
          message: "데이터 조회 실패",
          'error': e
      });
  }
});

// 종합 상황판 - 영향 키워드 동향 테이블
router.get('/main_effect_keyword', async function(req, res, next) {

  try {

    // 오늘 날짜 구하기
    let today = await getToday()
    async function getToday() {
      let now = new dayjs().format('YYYY-MM-DD');
      return now;
    }

    // 키워드 데이터 최신 날짜 구하기
    let date = await topic_main.aggregate([
      { $project: 
          { 
            _id: 0,
            datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
          }
      },
      { $match: { datetime: {$lt: today}} },
      { $sort: {datetime: -1}},
      { $limit: 1}
  ]);

    // 최신 날짜 기준 키워드 데이터 구하기
    let data = await topic_main.aggregate([
      { $project: 
          { 
              datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
              topic: 1,
              tf: 1,
          }
      },
      { $match: { datetime: date[0].datetime } },
      { $group: {
        _id: "$topic",
        tf: {$sum: "$tf"},
        datetime: {$first: "$datetime"}
      } },
      { $sort: {datetime: -1, tf:-1}},
      { $limit: 5}
    ]);

    // 구한 키워드를 기준으로 사전에서 일치하는 카테고리를 찾는다.
    if(data.length > 0 ){
      readStream = fs.createReadStream('./public/knowledge/비고사전v2.0.csv');

      for await (const row of readStream.pipe(csv())){ //사전
        for await (let json of data){ //db조회 데이터

          if(Object.values(row)[0] == json._id){
            json.note = row.depth2;
          }
        }
      }
    }

    // 화제어 사전
    let a = 1;
    let b = 1;
    let c = 1;
    let d = 1;
    let e = 1;
    let dict = ['재해', '질병', '전쟁', '국가', '환경'];
    // 키워드 별 카테고리가 여러개인 경우, 카테고리 순위를 구한다.
    for (i of data) {
      if (i.note == dict[0]) {
        i.rank = a;
        a++;
      } else if (i.note == dict[1]) {
        i.rank = b;
        b++;
      } else if (i.note == dict[2]) {
        i.rank = c;
        c++;
      } else if (i.note == dict[3]) {
        i.rank = d;
        d++;
      } else if (i.note == dict[4]) {
        i.rank = e;
        e++;
      }
    }

    // 키워드의 빈도수 차이를 구하기 위해
    // 해당하는 키워드 전날의 tf 값을 구한다.
    let pre_data = []
    for (i of data) {
      let q1 = await topic_main.find({topic:i._id, datetime: {$lt: new Date(i.datetime)}}).sort({datetime: -1}).limit(1);
      pre_data.push(q1[0].tf);
    }

    // 오늘 날짜 기준 최신 키워드 빈도수(=a) - a날짜 기준 최신 키워드 빈도수
    for(i in data) {
      if (data[i].tf > pre_data[i]) {
        data[i].data = data[i].tf - pre_data[i];
        data[i].state = '▲';
      } else if(data[i].tf < pre_data[i]) {
        data[i].data = pre_data[i] - data[i].tf;
        data[i].state = '▼';
      } else {
        data[i].state = '-';
      }
    }
    
    res.send(data);

  } catch (e) {
      console.log(e);
      // res.json({
      //     message: "데이터 조회 실패",
      //     'error': e
      // });
  }
});

// 키워드 데이터 저장
router.get('/insert_topic', async function(req, res, next) {

  try {
    const topic_ctj = require("../topic_ctj")
    data = await topic_ctj.csvToJSON();
    
    await topic.insertMany(data);

    res.send({ 'result': '데이터 저장 완료' });
  } catch (e) {
      res.json({
          message: "데이터 저장 실패",
          'error': e
      });
  }
});

// 키워드 데이터 조회
router.get('/select_topic', async function(req, res, next) {

  try {
    let { material, startDate, endDate } = req.query;

    let frequency;
    let data;

    if (endDate == await getToday()) {
      if (startDate == await getF1()) {
        frequency = 1;
        data = await topicTodayData(frequency);
      } else if (startDate == await getF2()) {
        frequency = 3;
        data = await topicTodayData(frequency);
      } else if (startDate == await getF3()) {
        frequency = 6;
        data = await topicTodayData(frequency);
      } else {
        data = await topicData();
      }
    } else {
      data = await topicData();
    }

    // 오늘 날짜 가져오는 함수
    async function getToday() {
      let now = new dayjs().format('YYYY-MM-DD');
      return now;
    }
    // 1개월 전 날짜 가져오는 함수
    async function getF1() {
      let date = new dayjs();
      date = date.subtract(1, 'month').format('YYYY-MM-DD');
      return date;
    }
    // 3개월 전 날짜 가져오는 함수
    async function getF2() {
        let date = new dayjs();
        date = date.subtract(3, 'month').format('YYYY-MM-DD');
        return date;
    }
    // 6개월 전 날짜 가져오는 함수
    async function getF3() {
        let date = new dayjs();
        date = date.subtract(6, 'month').format('YYYY-MM-DD');
        return date;
    }

    // 단기, 중기, 장기 선택을 했을 경우
    async function topicTodayData(frequency) {
      let data = await topic_today_table.aggregate([
        { $project: 
          { 
            _id: '$topic',
            rank: 1,
            material: 1,
            tf: 1,
            frequency: 1,
            notice: 1
          }
        },
        { $match: { material : material, frequency: frequency} },
        { $sort: { rank: 1 }},
        { $limit: 10 }
      ])
      
      return data;
    }
    // 단기, 중기, 장기 선택을 안했을 경우
    async function topicData() {
      let data = await topic.aggregate([
        { $project: 
            { 
                datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
                material: 1,
                topic: 1,
                tf: 1,
                tf_idf: 1,
            }
        },
        { $match: { material : material, datetime: {$gte: startDate, $lte: endDate}} },
        { $group: {
          _id: "$topic",
          tf: {$sum: "$tf"},
          tf_idf: {$sum: "$tf_idf"},
        } },
        { $sort: {tf_idf: -1}},
        { $limit: 10 }
      ])
      return data;
    }
    if(data.length > 0 ){
      readStream = fs.createReadStream('./public/knowledge/비고사전v2.0.csv');
      for await (const row of readStream.pipe(csv())){ //사전
        for await (let json of data){ //db조회 데이터
          if(Object.values(row)[0] == json._id){
            json.note = row.depth2;
          }
        }
      }
    }

    res.send(data);

  } catch (e) {
      console.log(e);
      // res.json({
      //     message: "데이터 조회 실패",
      //     'error': e
      // });
  }
});

// 레포트 키워드 데이터 저장
router.get('/insert_topic_report', async function(req, res, next) {

  try {

      let data = [];
      readStream = fs.createReadStream('./public/knowledge/비고사전v2.0.csv');
      for await (const row of readStream.pipe(csv())){ //사전
        
        row['material'] = Object.values(row)[0];
        data.push(row)
      }
      await topic_report.insertMany(data);
    res.send({ 'result': '데이터 저장 완료' });
  } catch (e) {
      res.json({
          message: "데이터 저장 실패",
          'error': e
      });
  }
});

// 레포트 키워드 데이터 조회
router.get('/select_topic_report', async function(req, res, next) {

  try {
    let { material, startDate, endDate } = req.query;
    if (material == 'CU' || material == 'AL' || material == 'NI') {
      material = 'CAN';
    } else if (material == 'PP' || material == 'PC') {
      material = 'P2';
    }

    // note가 null 값일 때는 그대로 출력(나중에 사전에서 카테고리를 넣어줌)
    // note가 null이 아니고 '신규'일때 신규로 출력
    let data = await topic_report.aggregate([
      { $project: 
          { 
              d_datetime: { $dateToString: { format: "%Y-%m-%d", date: "$d_datetime" } },
              material: 1,
              topic: 1,
              tf: 1,
          }
      },
      { $match: { material : material, d_datetime: {$gte: startDate, $lte: endDate}} },
      { $group: {
        _id: "$topic",
        tf: {$sum: "$tf"},
      } },
      { $sort: {tf: -1}},
      { $limit: 10}
      
  ]);

  // note가 null이고 (신규/급등 아닐때) 
  // 사전에서 화제어와 일치하는 카테고리를 넣어준다.
  if(data.length > 0 ){
    readStream = fs.createReadStream('./public/knowledge/비고사전v2.0.csv');
    for await (const row of readStream.pipe(csv())){ //사전
      for await (let json of data){ //db조회 데이터
        if(Object.values(row)[0] == json._id){
          json.note = row.depth2;
        }
      }
    }

  }
  res.send(data);

  } catch (e) {
      console.log(e);
      // res.json({
      //     message: "데이터 조회 실패",
      //     'error': e
      // });
  }
});

// 협력사 키워드 데이터 저장
router.get('/insert_topic_company', async function(req, res, next) {

  try {
      readStream = fs.createReadStream('./public/knowledge/비고사전v2.0.csv');
      let data = [];
      for await (const row of readStream.pipe(csv())){ //사전
        
        row['material'] = Object.values(row)[0];
        data.push(row)
      }
      // console.log(data);
      await topic_company.insertMany(data);
    res.send({ 'result': '데이터 저장 완료' });
  } catch (e) {
      res.json({
          message: "데이터 저장 실패",
          'error': e
      });
  }
});

// 키워드 데이터 조회
router.get('/select_topic_company', async function(req, res, next) {

  try {
    let { material, startDate, endDate } = req.query;

    let frequency;
    let data;

    if (endDate == await getToday()) {
      if (startDate == await getF1()) {
        frequency = 1;
        data = await topicTodayData(frequency);
      } else if (startDate == await getF2()) {
        frequency = 3;
        data = await topicTodayData(frequency);
      } else if (startDate == await getF3()) {
        frequency = 6;
        data = await topicTodayData(frequency);
      } else {
        data = await topicData();
      }
    } else {
      data = await topicData();
    }

    // 오늘 날짜 가져오는 함수
    async function getToday() {
      let now = new dayjs().format('YYYY-MM-DD');
      return now;
    }
    // 1개월 전 날짜 가져오는 함수
    async function getF1() {
      let date = new dayjs();
      date = date.subtract(1, 'month').format('YYYY-MM-DD');
      return date;
    }
    // 3개월 전 날짜 가져오는 함수
    async function getF2() {
        let date = new dayjs();
        date = date.subtract(3, 'month').format('YYYY-MM-DD');
        return date;
    }
    // 6개월 전 날짜 가져오는 함수
    async function getF3() {
        let date = new dayjs();
        date = date.subtract(6, 'month').format('YYYY-MM-DD');
        return date;
    }

    // 단기, 중기, 장기 선택을 했을 경우
    async function topicTodayData(frequency) {
      let data = await topic_company_today_table.aggregate([
        { $project: 
          { 
            _id: '$topic',
            rank: 1,
            material: 1,
            tf: 1,
            frequency: 1
          }
        },
        { $match: { material : material, frequency: frequency} },
        { $sort: { rank: 1 }}
      ])
      
      return data;
    }
    // 단기, 중기, 장기 선택을 안했을 경우
    async function topicData() {
      let data = await topic_company.aggregate([
        { $project: 
            { 
                datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
                material: 1,
                topic: 1,
                tf: 1,
                tf_idf: 1,
            }
        },
        { $match: { material : material, datetime: {$gte: startDate, $lte: endDate}} },
        { $group: {
          _id: "$topic",
          tf: {$sum: "$tf"},
          tf_idf: {$sum: "$tf_idf"},
        } },
        { $sort: {tf_idf: -1}},
        { $limit: 10 }
      ])
      
      return data;
    }
    if(data.length > 0 ){
      readStream = fs.createReadStream('./public/knowledge/비고사전v2.0.csv');
      for await (const row of readStream.pipe(csv())){ //사전
        for await (let json of data){ //db조회 데이터
          if(Object.values(row)[0] == json._id){
            json.note = row.depth2;
          }
        }
      }
    }

    res.send(data);

  } catch (e) {
      console.log(e);
      // res.json({
      //     message: "데이터 조회 실패",
      //     'error': e
      // });
  }
});

// 네트워크 그래프 데이터 저장
router.get('/insert_network_graph', async function(req, res, next) {

  try {
    const csv_save = require("../network_graph_ctj")
    data = await csv_save.jsonSearch();
    
    await network_graph.insertMany(data);

    res.send({ 'result': '데이터 저장 완료' });
  } catch (e) {
      res.json({
          message: "데이터 저장 실패",
          'error': e
      });
  }
});

// 네트워크 그래프 데이터 조회
router.get('/select_network_graph', async function(req, res, next) {

  try {
    let { material, frequency } = req.query;
    
    let f;
    if (frequency == 'f1') {
      f= 1;
    } else if (frequency == 'f2') {
      f= 7;
    } else if(frequency == 'f3') {
      f= 30;
    } 

    let title = material;
    if(material == 'CU') {
      title = 'Cu';
    } else if (material == 'AL') {
      title = 'Al';
    } else if(material == 'NI') {
      title = 'Ni';
    }

    // 카테고리, 데이터, 링크 데이터 필요
    let categoryArr = [{name: '원자재'}, {name: '재해', itemStyle: {color: '#008FFB'}}, {name: '전쟁', itemStyle: {color: '#00E396'}}, {name: '국가', itemStyle: {color: '#FEB019'}}, 
                        {name: '질병', itemStyle: {color: '#FF4560'}}, {name: '환경', itemStyle: {color: '#775DD0'}}, {name: '없음', itemStyle: {color: 'lightgray'}}];
    let topicArr = [];
    // 원자재, 협력사의 데이터는 초기에 선언해준다.
    let dataArr = [{id: 0, name: title, symbolSize: 90, category: 0}];
    let linkArr = [];
    let result = [];

    // 화제어 추출
    const topicData = await network_graph.aggregate([
      { $project: 
          { 
            material: 1,
            topic: 1,
            tf: 1,
            frequency: 1,
          }
      },
      { $match: { material : material, frequency: f} },
      { $group: {
          _id: '$topic',
          material: {$first: '$material'},
          tf: {$first: '$tf'} 
      }}
  ]);

  for (i of topicData) {
    topicArr.push(i._id);
  }
  
  // 사전에서 화제어와 일치하는 카테고리를 찾아주는 함수
  async function dict(data) {
    if(data.length > 0 ){
      readStream = fs.createReadStream('./public/knowledge/비고사전v2.0.csv');
      for await (const row of readStream.pipe(csv())){ //사전
        for await (let json of data){ //db조회 데이터
          if(Object.values(row)[0] == json._id){
            json.note = row.depth2;
          }
        }
      }
    }
  }

  // 화제어가 사전에 있는 카테고리에 포함되면 추가해준다.
  await dict(topicData);

  // 화제어 데이터를 추가해준다.
  for (i in topicData) {
    let obj = {};

    // 화제어 데이터( 저장
    obj.id = parseInt(i)+1;
    obj.name = topicData[i]._id;
    obj.symbolSize = 60;
    obj.category = 6;

    // 화제어 카테고리 설정
    for (j in categoryArr) {
      if(topicData[i].note == categoryArr[j].name) {
        obj.category = parseInt(j);
      }
    }
    obj.value = topicData[i].tf;
    dataArr.push(obj)
  }

  // 원자재와 화제어 link 연결
  for (let i =1; i < dataArr.length; i++) {
    var l_obj = {};
    l_obj.source = 0;
    l_obj.target = i;
    linkArr.push(l_obj);
  }

  // 원자재와 화제어 link 연결
  // for (i in dataArr) {
  //   let obj = {};
  //   obj.source = 0;
  //   obj.target = parseInt(i);
  //   linkArr.push(obj);
  // }

  // 화제어의 연관어를 구한다.
  const data = await network_graph.aggregate([
    { $project: 
        { 
          _id: '$related',
          material: 1,
          topic: 1,
          tf: 1,
          frequency: 1
        }
    },
    { $match: { material : material, frequency : f} }
  ]);

  // 연관어가 사전에 있는 카테고리에 포함되면 추가해준다.
  await dict(data);

  // 데이터가 저장된 배열에서 마지막 id값 가져오기
  var index = dataArr[dataArr.length -1].id;

  for (i in data) {
    // 화제어와 연관어가 같지 않은 경우
    if(data[i].topic != data[i]._id) {
      for (j in topicArr) {
        // 화제어와 해당하는 연관어의 id link 연결
        if(data[i].topic == topicArr[j]) {
          let d_obj = {};
          let l_obj = {};

          index += 1;

          // 화제어에 해당하는 연관어를 연결해준다.
          l_obj.source = parseInt(j)+1; // 화제어 id
          l_obj.target = index; // 연관어 id
          
          // 연관어 데이터 저장
          d_obj.id = index;
          d_obj.name = data[i]._id;
          d_obj.symbolSize = 30;
          d_obj.category = 6;

          // 연관어 카테고리 설정
          for(k in categoryArr) {
            if(data[i].note == categoryArr[k].name) {
              d_obj.category = parseInt(k)
            }
          }
          d_obj.value = data[i].tf;
          dataArr.push(d_obj);
          linkArr.push(l_obj);
        }

      }
    }
  }
  // console.log(categoryArr);
  // console.log(dataArr);
  // console.log(linkArr);

  result.push(categoryArr);
  result.push(dataArr);
  result.push(linkArr);

  //console.log(result);

  res.send(result);
  } catch (e) {
      res.json({
          message: "데이터 조회 실패",
          'error': e
      });
  }
});

// 키워드 모니터링 - 카테고리별 화제어 빈도/발생추이 차트 : 화제어 클릭시 차트에 화제어 데이터 추가
router.get('/keyword_frequency', async function (req, res, next) {
  try {
    let { material, startDate, endDate, date, keyword, item } = req.query;
    let tf = [];
    let result = [];
    let collection;
    let datetime='$datetime';

    // 데이터를 조회하는 날짜가 단기, 중기, 장기인지
    // 사용자가 지정한 날짜인지 확인한다.
    if (item == 'news' || item == 'company') {
      if (endDate == await getToday()) {
        if (startDate == await getF1()) {
          frequency = 1;
          data = await topicTodayChart(frequency, item);
        } else if (startDate == await getF2()) {
          frequency = 3;
          data = await topicTodayChart(frequency, item);
        } else if (startDate == await getF3()) {
          frequency = 6;
          data = await topicTodayChart(frequency, item);
        } else {
          data = await topicChart();
        }
      } else {
        data = await topicChart();
      }
    } else {
      data = await topicChart();
    }

    // 오늘 날짜 가져오는 함수
    async function getToday() {
      let now = new dayjs().format('YYYY-MM-DD');
      return now;
    }
    // 1개월 전 날짜 가져오는 함수
    async function getF1() {
      let date = new dayjs();
      date = date.subtract(1, 'month').format('YYYY-MM-DD');
      return date;
    }
    // 3개월 전 날짜 가져오는 함수
    async function getF2() {
      let date = new dayjs();
      date = date.subtract(3, 'month').format('YYYY-MM-DD');
      return date;
    }
    // 6개월 전 날짜 가져오는 함수
    async function getF3() {
      let date = new dayjs();
      date = date.subtract(6, 'month').format('YYYY-MM-DD');
      return date;
    }

    // 뉴스와 협력사는 단기, 중기, 장기를 선택했을 경우 today 테이블에서 topic 정보를 가져온다.
    async function topicTodayChart(frequency, item) {
      if (item == 'news') {
        collection = topic_today_chart;
      } else if (item == 'company') {
        collection = topic_company_today_chart;
      }
      let data = await collection.aggregate([
        {
          $project:
          {
            _id: 0,
            material: 1,
            datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
            topic: 1,
            tf: 1,
            frequency: 1
          }
        },
        { $match: { material: material, topic: keyword, frequency: frequency } },
        { $sort: { datetime: 1 } }
      ]);
      return data;
    }

    // 단기, 중기, 장기를 선택하지 않았을 경우
    async function topicChart() {
      if (item == 'news') {
        collection =  topic;
      } else if (item == 'report') {
        datetime = '$d_datetime';

        if (material == 'CU' || material == 'AL' || material == 'NI') {
          material = 'CAN';
        } else if (material == 'PP' || material == 'PC') {
          material = 'P2';
        }
        
        collection = topic_report;

      } else if (item == 'company') {
        collection = topic_company;
      }

      let data = await collection.aggregate([
        {
          $project:
          {
            _id: 0,
            material: 1,
            datetime: { $dateToString: { format: "%Y-%m-%d", date: datetime } },
            topic: 1,
            tf: 1,
          }
        },
        { $match: { material: material, topic: keyword, datetime: { $gte: date[0], $lte: date[date.length-1] } } },
        { $sort: { datetime: 1 } }
      ]);
      return data;
    }

    // 기존에 있던 차트의 날짜 배열 데이터를 가져온 후
    // 배열의 날짜와 일치하는 키워드 tf 데이터를 배열에 넣는다.
    for (i of date) {
      let count = 0;
      for (j of data) {
        if (j.datetime == i) {
          tf.push(j.tf)
          count += 1;
        }
      }
      if (count == 0) {
        tf.push(0)
      }
    }
    let obj = {};
    obj.name = keyword + "(화제어)"
    obj.data = tf;

    result.push(obj)

    res.send(result);

  } catch (e) {
    console.log(e);
  }
});

// 키워드 모니터링 - 카테고리별 화제어 빈도 / 화제어 발생추이 : 화제어 클릭 x (default)
router.get('/select_keyword_topic', async function (req, res, next) {
  try {
    let { material, startDate, endDate } = req.query;
    let frequency;

    // 데이터를 조회하는 날짜가 단기, 중기, 장기인지
    // 사용자가 지정한 날짜인지 확인한다.
    if (endDate == await getToday()) {
      if (startDate == await getF1()) {
        frequency = 1;
        data = await topicTodayChart(frequency);
      } else if (startDate == await getF2()) {
        frequency = 3;
        data = await topicTodayChart(frequency);
      } else if (startDate == await getF3()) {
        frequency = 6;
        data = await topicTodayChart(frequency);
      } else {
        data = await topicChart();
      }
    } else {
      data = await topicChart();
    }

    // 오늘 날짜 가져오는 함수
    async function getToday() {
      let now = new dayjs().format('YYYY-MM-DD');
      return now;
    }
    // 1개월 전 날짜 가져오는 함수
    async function getF1() {
      let date = new dayjs();
      date = date.subtract(1, 'month').format('YYYY-MM-DD');
      return date;
    }
    // 3개월 전 날짜 가져오는 함수
    async function getF2() {
        let date = new dayjs();
        date = date.subtract(3, 'month').format('YYYY-MM-DD');
        return date;
    }
    // 6개월 전 날짜 가져오는 함수
    async function getF3() {
        let date = new dayjs();
        date = date.subtract(6, 'month').format('YYYY-MM-DD');
        return date;
    }

    // 단기, 중기, 장기를 선택했을 경우
    async function topicTodayChart(frequency) {
      let data = await topic_today_chart.aggregate([
        {
          $project:
          {
            _id: 0,
            datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
            material: 1,
            category: 1,
            tf: 1,
            price: 1,
            frequency: 1
          }
        },
        { $match: { material: material, frequency:frequency } },
        { $sort: {datetime: 1} }
      ]);
  
      let category = ['재해', '전쟁', '국가', '질병', '환경', '가격']
      let c1= [];
      let c2= [];
      let c3= [];
      let c4= [];
      let c5= [];
      let c6= [];
      let dateArr = [];
      let result=[];
      
      for (i of data) {
        // 카테고리 데이터가 있는 날짜만 날짜 배열에 넣어준다.
        if(i.category != '') {
          dateArr.push(i.datetime)
        }
        // 일치하는 카테고리 배열에 데이터를 넣어준다.
        if(i.category == category[0]) {
          c1.push(i.tf)
          c6.push(i.price)
        } else if(i.category == category[1]) {
          c2.push(i.tf)
        } else if(i.category == category[2]) {
          c3.push(i.tf)
        } else if(i.category == category[3]) {
          c4.push(i.tf)
        } else if(i.category == category[4]) {
          c5.push(i.tf)
        } 
      }
      let cArr = [c1, c2,c3,c4,c5,c6]

      for (i in category) {
        let obj = {};
        obj.name = category[i];
        obj.data = cArr[i];
        obj.datetime = [...new Set(dateArr)]
        result.push(obj)
      }

      return result;
    }

    // 단기, 중기, 장기를 선택하지 않았을 경우
    async function topicChart() {
      
      let data = await topic.aggregate([
        {
          $project:
          {
            _id: 0,
            datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
            material: 1,
            topic: 1,
            tf: 1,
          }
        },
        { $match: { material: material, datetime: { $gte: startDate, $lte: endDate } } },
      ]);
  
      let dateArr = [];
      let noteArr = [];
      let array = [];
      let result = [];
  
      if (data.length > 0) {
        readStream = fs.createReadStream('./public/knowledge/비고사전v2.0.csv');
        for await (const row of readStream.pipe(csv())) { //사전
          for await (let json of data) { //db조회 데이터
            if (Object.values(row)[0] == json.topic) {
              json.note = row.depth2;
              // dateArr.push(json.datetime);
              noteArr.push(json.note);
              array.push(json);
            }
          }
        }
      }

      // 날짜 오름차순으로 데이터 정렬
      const orderedDate = array.sort((a,b) => new Date(a.datetime)- new Date(b.datetime))

      for (i of orderedDate) {
        dateArr.push(i.datetime)
      }

      dateArr = [...new Set(dateArr)];
      noteArr = [...new Set(noteArr)];

      // 일치하는 비고 확인
      for (let note of noteArr) {
        let dataArr = [];
        // 날짜 별 비고 건수 합 구하기
        for (let date of dateArr) {
          var obj = {};
          var tf_sum = 0;
          for (let item of array) {
            // 비고와 날짜가 일치하면 tf 더하기
            if (item.datetime == date && item.note == note) {
              tf_sum += item.tf;
            }
          }
          // 날짜 별 tf 총합 배열에 넣기
          dataArr.push(tf_sum)
        }
          obj.name = note;
          obj.data = dataArr;
          obj.datetime = dateArr;
          result.push(obj);
      }

      if (result.length != 0) {
        let realData = {};
        realData.name = '가격';
        realData.data = await realPrice(dateArr, material);
        result.push(realData);
      }

      return result;
    }
    
    // 구한 날짜를 기준으로 실제가격 구하기 
    async function realPrice(dateArr, material) {
      let price = [];
      let data = await real_price_trend.aggregate([
        {
          $project:
          {
            _id: 0,
            price: 1,
            datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
            material: 1,
            material_other: 1
          }
        },
        { $match: { material: material, material_other: '', datetime: {$gte: dateArr[0], $lte: dateArr[dateArr.length-1]} } },
      ]);
      for (i of dateArr) {
        let count = 0;
        for (j of data) {
          if (j.datetime == i) {
            price.push(j.price)
            count += 1;
          }
        }
        if(count == 0) {
          price.push(0)
        }
      }
      return price;
    }

    res.send(data);
  } catch (e) {
    console.log(e);
    // res.json({
    //     message: "데이터 조회 실패",
    //     'error': e
    // });
  }
});

/* 데이터 -> DOCUMENT */
router.get('/insert_document', async function(req, res, next) {
  let data = [];
  readStream = fs.createReadStream('./public/knowledge/비고사전v2.0.csv');
  for await (const row of readStream.pipe(csv())) {

    // 'datetime' 이라는 key와 value 추가
    row['datetime'] = Object.values(row)[0];
    // delete row.datetime;

    data.push(row);
  }

  await document.insertMany(data)
    .then()
    .catch(console.error);

  res.send(data);
});

/* document_report insert */
router.get('/insert_document_report', async function (req, res, next) {
  let data = [];
  readStream = fs.createReadStream('./public/knowledge/비고사전v2.0.csv');
  for await (const row of readStream.pipe(csv())) {

    // 'datetime' 이라는 key와 value 추가
    // row['datetime'] = Object.values(row)[0];
    // delete row.datetime;

    data.push(row);
  }

  await document_report.insertMany(data)
    .then()
    .catch(console.error);

  res.send(data);
});

router.get('/insert_document_company', async function(req, res, next) {
  let data = [];
  readStream = fs.createReadStream('./public/knowledge/비고사전v2.0.csv');
  for await (const row of readStream.pipe(csv())) {

    // 'material' 이라는 key와 value 추가
    row['material'] = Object.values(row)[0];
    // delete row.datetime;

    if(row.material =="포스코"){
      data.push(row);
    }
    
  }

  await document_company.insertMany(data)
    .then()
    .catch(console.error);

  res.send(data);
});

/* 키워드 모니터링_원자재:: 원문보기_news */
router.get('/material_news_original_text', async function(req, res, next) {

  let {startDate, endDate, material, topic, checkedValue} = req.query;
  // let reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
  let reg = /[\{\}\[\]\/?]/gi;

  let ret;

  // if (checkedValue == 'material') {
  //   ret = await document.aggregate([
  //     {
  //       $project: {
  //         _id: 0,
  //           datetime: {$dateToString: {format: '%Y-%m-%d', date: '$datetime'}},
  //           doc_title: '$doc_title',
  //           doc_url: '$doc_url',
  //           source: '$source',
  //           topics: '$topics',
  //           material: '$material'
  //       }
  //     },
  //     {
  //       $match: {
  //         // material: {$in: [material, 'ALL']},
  //         material: material,
  //         datetime: {$gte: startDate, $lte: endDate},
  //         topics: {$regex: topic}
  //       }
  //     },
  //     {$sort: {datetime: -1}}
  //   ]);
  // } 
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
          // material: material,
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
          // material: {$in: [material, 'ALL']},
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
  for (i in ret) {
    ret[i].topics = ret[i].topics.split(',', 5).toString().replace(reg, '');

    // 선택한 키워드가 다섯개 안에 없을 때 마지막 한개 삭제하고 맨 앞에 해당 키워드 추가
    // if (ret[i].topics.indexOf(topic) == -1) {
    //   ret[i].topics = ret[i].topics.split(',', 4);
    //   ret[i].topics = `\'${topic}\', ` + ret[i].topics;
    // }
  }
  res.send(ret);
});

/* 키워드 모니터링_원자재:: 원문보기_report */
router.get('/material_report_original_text', async function(req, res, next) {

  let {startDate, endDate, material} = req.query;
  // let reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
  // let reg = /[\{\}\[\]\/?]/gi;
  let ret;

  if (material == 'CU' || material == 'AL' || material == 'NI') {
    // material이 CU 또는 AL 또는 NI일 경우
    ret = await document_report.aggregate([
      {
        $project: {
          _id: 0,
            datetime: {$dateToString: {format: '%Y-%m-%d', date: '$datetime'}},
            doc_title: '$doc_title',
            source: '$source',
            material: '$material'
        }
      },
      {
        $match: {
          material: 'CAN',
          datetime: {$gte: startDate, $lte: endDate},
        }
      },
      {$sort: {datetime: -1}}
    ])
    .then()
    .catch(console.error);
  } else if (material == 'PP' || material == 'PC') {
    // material이 PP 또는 PC일 경우
    ret = await document_report.aggregate([
      {
        $project: {
          _id: 0,
            datetime: {$dateToString: {format: '%Y-%m-%d', date: '$datetime'}},
            doc_title: '$doc_title',
            source: '$source',
            material: '$material'
        }
      },
      {
        $match: {
          material: 'P2',
          datetime: {$gte: startDate, $lte: endDate},
        }
      },
      {$sort: {datetime: -1}}
    ])
    .then()
    .catch(console.error);
  } else {
    // material이 HR일 경우
    ret = await document_report.aggregate([
      {
        $project: {
          _id: 0,
            datetime: {$dateToString: {format: '%Y-%m-%d', date: '$datetime'}},
            doc_title: '$doc_title',
            source: '$source',
            material: '$material'
        }
      },
      {
        $match: {
          material: 'HR',
          datetime: {$gte: startDate, $lte: endDate},
        }
      },
      {$sort: {datetime: -1}}
    ])
    .then()
    .catch(console.error);
  }

  res.send(ret);
});

/* 키워드 모니터링_협력사:: 원문보기 */
router.get('/company_original_text', async function(req, res, next) {

  let {startDate, endDate, material, topic} = req.query;

  // let reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
  let reg = /[\{\}\[\]\/?]/gi;

  let ret = await document_company.aggregate([
    {
      $project: {
        _id: 0,
          datetime: {$dateToString: {format: '%Y-%m-%d', date: '$datetime'}},
          doc_title: '$doc_title',
          doc_url: '$doc_url',
          topics: '$topics',
          material: '$material'
      }
    },
    {
      $match: {
        material: material,
        datetime: {$gte: startDate, $lte: endDate},
        topics: {$regex: topic}
      }
    },
    {$sort: {datetime: -1}}
  ])
  .then()
  .catch(console.error);

  // topics 괄호 제거, 다섯개만 가져옴
  for (i in ret) {
    ret[i].topics = ret[i].topics.split(',', 5).toString().replace(reg, '');

    // 선택한 키워드가 다섯개 안에 없을 때 마지막 한개 삭제하고 맨 앞에 해당 키워드 추가
    // if (ret[i].topics.indexOf(topic) == -1) {
    //   ret[i].topics = ret[i].topics.split(',', 4);
    //   ret[i].topics = `\'${topic}\', ` + ret[i].topics;
    // }
  }

  res.send(ret);
});

// 카테고리별 화제어 빈도 / 화제어 발생추이
router.get('/select_keyword_topic_report', async function (req, res, next) {
  try {
    let { material, startDate, endDate } = req.query;

    if (material == 'CU' || material == 'AL' || material == 'NI') {
      material = 'CAN';
    } else if (material == 'PP' || material == 'PC') {
      material = 'P2';
    }
    let data = await topic_report.aggregate([
      {
        $project:
        {
          _id: 0,
          datetime: { $dateToString: { format: "%Y-%m-%d", date: "$d_datetime" } },
          material: 1,
          topic: 1,
          tf: 1,
          tf_idf: 1,
        }
      },
      { $match: { material: material, datetime: { $gte: startDate, $lte: endDate } } },
    ]);

    let dateArr = [];
    let noteArr = [];
    let array = [];
    let result = [];

    if (data.length > 0) {
      readStream = fs.createReadStream('./public/knowledge/비고사전v2.0.csv');
      for await (const row of readStream.pipe(csv())) { //사전
        for await (let json of data) { //db조회 데이터
          if (Object.values(row)[0] == json.topic) {
            json.note = row.depth2;
            noteArr.push(json.note);
            array.push(json);

          }
        }
      }
    }

    // 날짜 오름차순으로 데이터 정렬
    const orderedDate = array.sort((a,b) => new Date(a.datetime)- new Date(b.datetime));
    for (i of orderedDate) {
      dateArr.push(i.datetime);
    }

    dateArr = [...new Set(dateArr)];
    noteArr = [...new Set(noteArr)];

    // 일치하는 비고 확인
    for (let note of noteArr) {
      let dataArr = [];
      // 날짜 별 비고 건수 합 구하기
      for (let date of dateArr) {
        var obj = {};
        var tf_sum = 0;
        for (let item of array) {
          // 비고와 날짜가 일치하면 tf 더하기
          if (item.datetime == date && item.note == note) {
            tf_sum += item.tf;
          }
        }
        // 날짜 별 tf 총합 배열에 넣기
        dataArr.push(tf_sum)
      }
        obj.name = note;
        obj.data = dataArr;
        obj.datetime = dateArr;
        result.push(obj);
        
    }
    
    let realData = {};
    realData.name = '가격';
    realData.data = await realPrice(dateArr, material);
    result.push(realData);

    // 구한 날짜를 기준으로 실제가격 구하기 
    async function realPrice(dateArr, material) {
      let price = [];
      let data = await real_price_trend.aggregate([
        {
          $project:
          {
            _id: 0,
            price: 1,
            datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
            material: 1,
            material_other: 1
          }
        },
        { $match: { material: material, material_other: '', datetime: {$gte: dateArr[0], $lte: dateArr[dateArr.length-1]} } },
      ]);
      for (i of dateArr) {
        let count = 0;
        for (j of data) {
          if (j.datetime == i) {
            price.push(j.price)
            count += 1;
          }
        }
        if(count == 0) {
          price.push(0)
        }
      }

      return price;
    }

    res.send(result);

  } catch (e) {
    console.log(e);
    // res.json({
    //     message: "데이터 조회 실패",
    //     'error': e
    // });
  }
});

// 협력사 카테고리별 화제어 빈도 / 화제어 발생추이 
router.get('/select_keyword_topic_company', async function (req, res, next) {
  try {
    let { material, startDate, endDate } = req.query;

    let data;

    if (endDate == await getToday()) {
      if (startDate == await getF1()) {
        frequency = 1;
        data = await topicTodayChart(frequency);
      } else if (startDate == await getF2()) {
        frequency = 3;
        data = await topicTodayChart(frequency);
      } else if (startDate == await getF3()) {
        frequency = 6;
        data = await topicTodayChart(frequency);
      } else {
        data = await topicChart();
      }
    } else {
      data = await topicChart();
    }

    // 오늘 날짜 가져오는 함수
    async function getToday() {
      let now = new dayjs().format('YYYY-MM-DD');
      return now;
    }

    // 1개월 전 날짜 가져오는 함수
    async function getF1() {
      let date = new dayjs();
      date = date.subtract(1, 'month').format('YYYY-MM-DD');
      return date;
    }

    // 3개월 전 날짜 가져오는 함수
    async function getF2() {
        let date = new dayjs();
        date = date.subtract(3, 'month').format('YYYY-MM-DD');
        return date;
    }

    // 6개월 전 날짜 가져오는 함수
    async function getF3() {
        let date = new dayjs();
        date = date.subtract(6, 'month').format('YYYY-MM-DD');
        return date;
    }

    async function topicTodayChart(frequency) {
      let data = await topic_company_today_chart.aggregate([
        {
          $project:
          {
            _id: 0,
            datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
            material: 1,
            category: 1,
            tf: 1,
            frequency: 1
          }
        },
        { $match: { material: material, frequency:frequency } },
      ]);
  
      let category = ['재해', '전쟁', '국가', '질병', '환경']
      let c1= [];
      let c2= [];
      let c3= [];
      let c4= [];
      let c5= [];
      let dateArr = [];
      
      for (i of data) {
        if(i.category != '') {
          dateArr.push(i.datetime)
        }
        if(i.category == category[0]) {
          c1.push(i.tf)
        } else if(i.category == category[1]) {
          c2.push(i.tf)
        } else if(i.category == category[2]) {
          c3.push(i.tf)
        } else if(i.category == category[3]) {
          c4.push(i.tf)
        } else if(i.category == category[4]) {
          c5.push(i.tf)
        } 
      }
      let cArr = [c1, c2,c3,c4,c5]
  
      let result=[];
      for (i in category) {
        let obj = {};
        obj.name = category[i];
        obj.data = cArr[i];
        obj.datetime = [...new Set(dateArr)]
        result.push(obj)
      }

      return result
    }

    async function topicChart() {

      let data = await topic_company.aggregate([
        {
          $project:
          {
            _id: 0,
            datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
            material: 1,
            topic: 1,
            tf: 1,
          }
        },
        { $match: { material: material, datetime: { $gte: startDate, $lte: endDate } } },
      ]);
  
      let dateArr = [];
      let noteArr = [];
      let array = [];
      let result = [];
  
      if (data.length > 0) {
        readStream = fs.createReadStream('./public/knowledge/비고사전v2.0.csv');
        for await (const row of readStream.pipe(csv())) { //사전
          for await (let json of data) { //db조회 데이터
            if (Object.values(row)[0] == json.topic) {
              json.note = row.depth2;
              noteArr.push(json.note);
              array.push(json);
  
            }
          }
        }
      }
  
      // 날짜 오름차순으로 데이터 정렬
      const orderedDate = array.sort((a,b) => new Date(a.datetime)- new Date(b.datetime))
  
      for (i of orderedDate) {
        dateArr.push(i.datetime)
      }
  
      dateArr = [...new Set(dateArr)];
      noteArr = [...new Set(noteArr)];

      // 일치하는 비고 확인
      for (let note of noteArr) {
        let dataArr = [];
        // 날짜 별 비고 건수 합 구하기
        for (let date of dateArr) {
          var obj = {};
          var tf_sum = 0;
          for (let item of array) {
            // 비고와 날짜가 일치하면 tf 더하기
            if (item.datetime == date && item.note == note) {
              tf_sum += item.tf;
            }
          }
          // 날짜 별 tf 총합 배열에 넣기
          dataArr.push(tf_sum)
        }
          obj.name = note;
          obj.data = dataArr;
          obj.datetime = dateArr;
          result.push(obj);
      }

      return result;
    }

    res.send(data);

  } catch (e) {
    console.log(e);
    // res.json({
    //     message: "데이터 조회 실패",
    //     'error': e
    // });
  }
});
//시나리오 유사도 메인리스크
router.get('/select_scenario_main_risk', async function(req, res, next) {
  //let ret = await scenario.find({});
  
  let cu = await scenario.find({material:"CU"});
  let al = await scenario.find({material:"AL"});
  let ni = await scenario.find({material:"NI"});
  let pp = await scenario.find({material:"PP"});
  let pc = await scenario.find({material:"PC"});
  let hr = await scenario.find({material:"HR"});

  let material_Arr = [
    ...cu,
    ...al,
    ...ni,
    ...pp,
    ...pc,
    ...hr
  ];
  res.send(material_Arr);
});

//시나리오 유사도 시황예측
router.get('/select_scenario_material', async function(req, res, next) {
  let { material } = req.query;

  let ret = await scenario.find({material : material});

  let data = ret[0];
  let scenario_arr = [data.climate, data.disease, data.war];
  let max = 0;
  let maxIndex;

  for(var i in scenario_arr){

    if(max < scenario_arr[i]){
      maxIndex = i;
      max = scenario_arr[i];
    }
  }

  var json = {};
  if(maxIndex == "0"){
    json.high = "climate";
  }else if(maxIndex == "1"){
    json.high = "disease";
  }else{
    json.high = "war"; 
  }

  json.material = data.material;
  json.disease = data.disease;
  json.climate = data.climate;
  json.war = data.war;

  res.send(json);
});

// 원자재 카테고리 데이터 가져오기
router.get('/select_real_price_trend_category', async function(req, res, next) {

  try {
    let { material, category, startDate, endDate } = req.query;

    const data = await real_price_trend_category.aggregate([
      { $project: 
          { 
              datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
              tf: 1,
              material: 1,
              category: 1
          }
      },
      { $match: { material : material, category : category, datetime: {$gte: startDate, $lte: endDate}} }
  ])

    res.send(data);
  } catch (e) {
      res.json({
          message: "데이터 조회 실패",
          'error': e
      });
  }
});

router.get('/select_real_trend', async function(req, res, next) {
  let ret = await select(dbConfig.real_trend)
  .then()
  .catch(console.error)
  .finally(() => client.close());

  res.send(ret);
});

router.get('/select_doc_keyword', async function(req, res, next) {
  let ret = await select(dbConfig.doc_keyword)
  .then()
  .catch(console.error)
  .finally(() => client.close());

  res.send(ret);
});

router.get('/select_topic_keyword', async function(req, res, next) {

  let ret = await select(dbConfig.topic_keyword)
  .then()
  .catch(console.error)
  .finally(() => client.close());

  res.send(ret);
});

const getMultiPrice = async function(material){
  let ret = await real_price_trend.aggregate([
    {
      $project: {
         _id:1,
         material:1,
         datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
         price:1,
         variation: 1,
         variation_price: 1,
         material_other:1      
      }
    },
    { $match:{ material: material, material_other:""}},
    { $sort: { datetime: -1}},
    { $limit: 1}
  ])
  return ret;
}


const getVariance = async function(material, datetime) {
  let ret = await real_price_trend.aggregate([
    {
      $project: {
         _id:1,
         material:1,
         datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
         price:1,
         material_other:1      
      }
    },
    { $match:{ material: material, material_other:"", datetime: {$lt: datetime}}},
    { $sort: { datetime: -1}},
    { $limit: 1}
  ]);

  return ret;
}

module.exports = router;