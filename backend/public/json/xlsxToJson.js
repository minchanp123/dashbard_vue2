/**/
const fs = require('fs');
const xlsx = require('xlsx');
const filePath = __dirname;

async function xlsxToJSON() {
    const workbook = xlsx.readFile(__dirname + '/../xlsx/원자재 샘플.xlsx', 
        {type: 'binary', cellDates: true, dateNF: 'yyyy-mm-dd'});
    const sheetName = workbook.SheetNames[0];
    const result = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    return result;
}

async function writeJSON() {
    fs.writeFile(filePath + '/sample_price_trend.json', 
        JSON.stringify(await xlsxToJSON()), 'utf-8', function(error) {
        console.log("write end");
    });
}

// writeJSON();

module.exports.xlsxToJSON = xlsxToJSON;



