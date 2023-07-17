var fs = require("fs-extra");
var csv = require("csv-parser");
var dayjs = require("dayjs");

// 오늘 날짜 가져오는 함수
async function getToday() {
  let now = new dayjs().format("YYYY-MM-DD");
  return now;
}
// 1개월 전 날짜 가져오는 함수
async function getF1() {
  let date = new dayjs();
  date = date.subtract(1, "month").format("YYYY-MM-DD");
  return date;
}
// 3개월 전 날짜 가져오는 함수
async function getF2() {
  let date = new dayjs();
  date = date.subtract(3, "month").format("YYYY-MM-DD");
  return date;
}
// 6개월 전 날짜 가져오는 함수
async function getF3() {
  let date = new dayjs();
  date = date.subtract(6, "month").format("YYYY-MM-DD");
  return date;
}

// 사전에서 화제어와 일치하는 카테고리를 찾아주는 함수
async function dictId(data) {
  if (data.length > 0) {
    var readStream = fs.createReadStream("./public/knowledge/비고사전v2.0.csv");
    for await (const row of readStream.pipe(csv())) {
      //사전
      for await (let json of data) {
        //db조회 데이터
        if (Object.values(row)[0] == json._id) {
          json.note = row.depth2;
        }
      }
    }
  }
}

async function dictTopic(data, noteArr, array) {
  if (data.length > 0) {
    var readStream = fs.createReadStream("./public/knowledge/비고사전v2.0.csv");
    for await (const row of readStream.pipe(csv())) {
      //사전
      for await (let json of data) {
        //db조회 데이터
        if (Object.values(row)[0] == json.topic) {
          json.note = row.depth2;
          noteArr.push(json.note);
          array.push(json);
        }
      }
    }
  }
}

module.exports = {
  getToday: getToday,
  getF1: getF1,
  getF2: getF2,
  getF3: getF3,
  dictId: dictId,
  dictTopic: dictTopic,
};
