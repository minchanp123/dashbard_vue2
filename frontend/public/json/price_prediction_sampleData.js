/**/
const fs = require('fs');
const dir = __dirname + '/../price_prediction_sampleData/';
const files = fs.readdirSync(dir);
const header = ['datetime', 'unstructured_N', 'unstructured_Y', 'weighted_N', 'weighted_Y', 'material']; 
var jsonArray = [];


// 파일 확장자 확인
function checkFileName(fileName) {
    var fileLen = fileName.length;
    var fileLastDot = fileName.lastIndexOf('.');
    var fileExt = fileName.substring(fileLastDot, fileLen).toLowerCase();

    return fileExt; 
}

async function csvToJSON() {
    for(var file of files) {
        let string_csv = (fs.readFileSync(dir + file)).toString();
        fileExt = checkFileName(file);

        let rows = string_csv.split('\r\n');

        if (fileExt == '.csv') {
            for(var i = 1; i < rows.length - 1; i++) {
                let obj = {};

                // 각 행의 내용을 ','로 구분
                let row = rows[i].split(",");

                for (var j = 0; j < header.length; j++) {
                    obj[header[j]] = row[j];
                }
                jsonArray.push(obj);
            }
        }
    }
    console.log("sample_price_prediction: ", jsonArray);
    return jsonArray;
}

async function writeJSON() {
    fs.writeFile(__dirname + '/sample_price_prediction.json', 
        JSON.stringify(await csvToJSON()), 'utf-8', function(error) {
        console.log("write end");
    });
}

// writeJSON();

module.exports.csvToJSON = csvToJSON;



