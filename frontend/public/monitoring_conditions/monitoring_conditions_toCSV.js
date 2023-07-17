const dbConfig = require('../../lib/db_config');
const mongoose = require('mongoose');
const real_price_trend =  require("../../model/REAL_PRICE_TREND");
const real_price_trend_today = require("../../model/REAL_PRICE_TREND_TODAY");
const xlsx = require('xlsx');
const fs = require('fs');

const getLastYearAvg = require('./getLastYearAvg');
const getLastQuarterAvg = require('./getLastQuarterAvg');
const getLastMonthAvg = require('./getLastMonthAvg');
const getCurrentAvg = require('./getCurrentAvg');
const getRate = require('./getRate');
// material_list: 석유화학, 강재, 비철금속, 경제지표
// index: 표기순서 / material: 품목 / source: 출처 / unit: 단위
// last_[year/quarter/month]_avg: 전[년/분기/월] 평균
// last_[year/quarter/month]_rate: 전[년/분기/월] 대비
// current_rate: 현황

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

let dateArray = [];
let dataArray = [];
let jsonArray = [];

// 현재 날짜
let now = new Date();
now.setHours(now.getHours() + 9);
let nowMonth = now.getMonth()+1;
let nowYear = now.getFullYear();

const header = ['last_year_avg', 'last_quarter_avg', 'last_month_avg', 'last_year_rate', 'last_quarter_rate', 'last_month_rate', 'current', "ref_date"];
exports.header = header;

const division1 = ['PP', 'PC', 'bpa', 'dubai', 'brent', 'wti', 'naphtha'];  // 석유화학
const division2 = ['HR', 'iron_ore china', 'bituminous_coal'];  // 강재
const division3 = ['NI', 'AL', 'CU'];  // 비철금속
const division4 = ['usd', 'eur', 'cny', 'scfi'];  // 경제지표

exports.division1 = division1;
exports.division2 = division2;
exports.division3 = division3;
exports.division4 = division4;

// 석유화학
let seok = [
    {'material_list': '석유화학', 'index': 1, 'material': 'PP', 'source': 'CFR FEA', 'unit': 'USD/ton', 'frequency':'(주간)'},
    {'material_list': '석유화학', 'index': 2, 'material': 'PC', 'source': 'CIF China', 'unit': 'USD/ton', 'frequency':'(주간)'},
    {'material_list': '석유화학', 'index': 3, 'material': 'BPA', 'source': 'CIF China', 'unit': 'USD/ton', 'frequency':'(주간)'},
    {'material_list': '석유화학', 'index': 4, 'material': '두바이유', 'source': '싱가포르 현물', 'unit': 'USD/bbl', 'frequency':'(일간)'},
    {'material_list': '석유화학', 'index': 5, 'material': '브렌트유', 'source': '영국 ICE 선물', 'unit': 'USD/bbl', 'frequency':'(일간)'},
    {'material_list': '석유화학', 'index': 6, 'material': 'WTI유', 'source': '미국 Nymex 선물', 'unit': 'USD/bbl', 'frequency':'(일간)'},
    {'material_list': '석유화학', 'index': 7, 'material': '나프타', 'source': '싱가포르', 'unit': 'USD/bbl', 'frequency':'(일간)'}
];

// 강재
let kang = [
    {'material_list': '강재', 'index': 1, 'material': '열연코일', 'source': '중국 현물', 'unit': 'USD/ton', 'frequency':'(주간)'},
    {'material_list': '강재', 'index': 2, 'material': '중국철광석', 'source': '중국 현물', 'unit': 'USD/ton', 'frequency':'(주간)'},
    {'material_list': '강재', 'index': 3, 'material': '유연탄현물', 'source': '동호주 현물', 'unit': 'USD/ton', 'frequency':'(주간)'}
];

// 비철금속
let bicheol = [
    {'material_list': '비철금속', 'index': 1, 'material': '니켈', 'source': 'LME', 'unit': 'USD/ton', 'frequency':'(일간)'},
    {'material_list': '비철금속', 'index': 2, 'material': '알루미늄', 'source': 'LME', 'unit': 'USD/ton', 'frequency':'(일간)'},
    {'material_list': '비철금속', 'index': 3, 'material': '구리', 'source': 'LME', 'unit': 'USD/ton', 'frequency':'(일간)'}
];

// 경제지표
let gyeong = [
    {'material_list': '경제지표', 'index': 1, 'material': 'USD', 'source': '하나은행', 'unit': 'KRW/USD', 'frequency':'(일간)'},
    {'material_list': '경제지표', 'index': 2, 'material': 'EUR', 'source': '하나은행', 'unit': 'KRW/EUR', 'frequency':'(일간)'},
    {'material_list': '경제지표', 'index': 3, 'material': 'CNY', 'source': '하나은행', 'unit': 'KRW/CNY', 'frequency':'(일간)'},
    {'material_list': '경제지표', 'index': 4, 'material': 'SCFI', 'source': '상하이운임지수', 'unit': 'index', 'frequency':'(주간)'}
]; 

exports.seok = seok;
exports.kang = kang;
exports.bicheol = bicheol;
exports.gyeong = gyeong;

main();
async function main() {
    getDateArray();

    await getPrice();

    // 현황 기준으로 상승/하락 비율 구하기
    await getRate.getRate();
    await setNumDigits();
    
    //await jsonToCSV();
    await insertData();
}

// 전년, 전분기, 전월, 현월이 담긴 날짜배열
function getDateArray() {
    getPrevYear(nowYear);
    getPrevQuarter(nowMonth);
    getPrevMonth(nowMonth); 
    getNowMonth(nowMonth);
}


// 전년 구하기
function getPrevYear(nowYear) {
    let prevYear = nowYear - 1;
    dateArray[0] = prevYear;
}

// 전분기 구하기
function getPrevQuarter(month) {

    let prevQuarter;

    if (month > 0 && month < 4) {
        // 현재: 1분기 -> (nowYear -1)-12-31
        prevQuarter = `${nowYear-1}-4`;
        dateArray[1] = prevQuarter;

    } else if (month > 3 && month < 7) {
        // 현재: 2분기 -> nowYear-3-31
        prevQuarter = `${nowYear}-1`;
        dateArray[1] = prevQuarter;
    } else if (month > 6 && month < 10) {
        // 현재: 3분기 -> nowYear-6-30
        prevQuarter = `${nowYear}-2`;
        dateArray[1] = prevQuarter;
    } else {
        // 현재: 4분기 -> nowYear-9-30
        prevQuarter = `${nowYear}-3`;
        dateArray[1] = prevQuarter;
    }
}

// 전월
function getPrevMonth(month) {
    let prevMonth;
    
    if (month == 1) {
        prevMonth = `${nowYear-1}-12`;
    } else {
        if (month.toString().length == 1) {
            prevMonth = `${nowYear}-0${month-1}`;
        } else {
            prevMonth = `${nowYear}-${month-1}`;
        }
    }
    dateArray[2] = prevMonth;
}

// 현월
function getNowMonth(month) {
    let nowMonth = `${nowYear}-${month}`;

    dateArray[3] = nowMonth;
}

async function  getPrice() {
    // getLastYearAvg(dateArray[0].toString());
    // getLastQuarterAvg(dateArray[1]);
    // getLastMonthAvg(dateArray[2]);
    // getCurrentAvg();

    // 전년 평균
    let lastYear = new Promise(async (resolve, reject) => {
        await getLastYearAvg.getLastYearAvg(dateArray[0].toString());

        if (Object.keys(seok[0]).includes('last_year_avg') == true) {
            resolve('success get last_year_avg');
        } else {
            reject('failed get last_year_avg');
        }
    });
    
    // 전분기 평균
    let lastQuarter = new Promise(async (resolve, reject) => {
        await getLastQuarterAvg.getLastQuarterAvg(dateArray[1]);
        
        if (Object.keys(seok[0]).includes('last_quarter_avg') == true) {
            resolve('success get last_quarter_avg');
        } else {
            reject('failed get last_quarter_avg');
        }
    });
    
    // 전월 평균
    let lastMonth = new Promise(async (resolve, reject) => {
        await getLastMonthAvg.getLastMonthAvg(dateArray[2]);
        
        if (Object.keys(seok[0]).includes('last_month_avg') == true) {
            resolve('success get last_month_avg');
        } else {
            reject('failed get last_month_avg');
        }
    });
    
    // 현황
    let current = new Promise(async (resolve, reject) => {
        await getCurrentAvg.getCurrentAvg();
        
        if (Object.keys(seok[0]).includes('current') == true) {
            resolve('success get current');
        } else {
            reject('failed get current');
        }
    });

    await Promise.all([lastYear, lastQuarter, lastMonth, current])
    .then((value) => {
        if (Object.keys(seok[0]).length == 11) {
            console.log(value);
        }
    }).catch((error) => {
        console.error(error);
    });
}

// 전년 평균, 전분기 평균, 전월 평균, 현황
// 소수점 이하 두자리까지 표현
async function setNumDigits() {
    dataArray.push(seok, kang, bicheol, gyeong);

    for (i in dataArray) {
        for (j in dataArray[i]) {
            for (k in header) {
                if (dataArray[i][j][header[k]] != '' && (k < 3 || k == 6)) {
                    dataArray[i][j][header[k]] = dataArray[i][j][header[k]].toFixed(2);
                    // console.log(header[k], ",", dataArray[i][j][header[k]]);
                }
            }
            jsonArray.push(dataArray[i][j]);
        }
    }

    // await dataRefine();
}

// async function getDate(){

// }

// async function dataRefine() {
//     for (i in dataArray) {
//         for (j in dataArray[i]) {
//             jsonArray.push(dataArray[i][j]);
//         }
//     }
// }

// async function jsonToCSV(json_data) {

//     let json_array = json_data;
//     let csv_string = '';

//     const titles = Object.keys(jsonArray[0]);

//     // csv_string에 제목 삽입: 각 제목은 (,)로 구분, 마지막 제목은 줄바꿈 추가
//     titles.forEach((title, index) => {
//         csv_string += (index !== titles.length-1 ? `${title},` : `${title}\r\n`);
//     });

//     json_array.forEach((content, index) => {
//         let row = '';

//         for (let title in content) {
//             // 행에 내용 할당: 첫 번째 행_열을 제외한 모든 열 앞에 (,) 삽입
//             row += (row === '' ? `${content[title]}` : `,${content[title]}`);
//         }

//         // csv_string에 row 삽입: 마지막 행을 제외한 모든 행 뒤에 줄바꿈 추가
//         csv_string += (index !== json_array.length-1 ? `${row}\r\n` : `${row}`);
//     });

//     await writeCSV(csv_string);
// }

async function jsonToCSV() { 
    
    try {
        const workSheet = xlsx.utils.json_to_sheet(jsonArray);
        const stream = xlsx.stream.to_csv(workSheet);

        stream.pipe(fs.createWriteStream('시황모니터링.csv'));
        console.log('생성완료:: 시황모니터링.csv');
    } catch (e) {
        console.error(e);
    }
}

async function insertData() {
    // console.log(jsonArray);
    try {
        await real_price_trend_today.deleteMany();
        await real_price_trend_today.insertMany(jsonArray);
        console.log('success insert data');

        mongoose.connection.close();
        console.log('close mongoose');
    } catch(e) {
        console.error(e);
    }

}