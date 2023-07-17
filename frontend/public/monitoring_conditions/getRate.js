const div = require('./monitoring_conditions_toCSV');

// 전(년/분기/월) 대비
async function getRate() {
    // 석유화학
    for (i in div.division1) {
        for (var j=3; j<6; j++) {
            if (div.seok[i][div.header[j-3]] != '' && div.seok[i][div.header[6]] != '') {
                div.seok[i][div.header[j]] = (((div.seok[i][div.header[6]] / div.seok[i][div.header[j-3]]) - 1) * 100).toFixed(0);
            } else {
                div.seok[i][div.header[j]] = '';
            }
        }
    }

    // 강재
    for (i in div.division2) {
        for (var j=3; j<6; j++) {
            if (div.kang[i][div.header[j-3]] != '' && div.kang[i][div.header[6]] != '') {
                div.kang[i][div.header[j]] = (((div.kang[i][div.header[6]] / div.kang[i][div.header[j-3]]) - 1) * 100).toFixed(0);
            } else {
                div.kang[i][div.header[j]] = '';
            }
        }
    }

    // 비철금속
    for (i in div.division3) {
        for (var j=3; j<6; j++) {
            if (div.bicheol[i][div.header[j-3]] != '' && div.bicheol[i][div.header[6]] != '') {
                div.bicheol[i][div.header[j]] = (((div.bicheol[i][div.header[6]] / div.bicheol[i][div.header[j-3]]) - 1) * 100).toFixed(0);
            } else {
                div.bicheol[i][div.header[j]] = '';
            }
        }
    }

    // 경제지표
    for (i in div.division4) {
        for (var j=3; j<6; j++) {
            if (div.gyeong[i][div.header[j-3]] != '' && div.gyeong[i][div.header[6]] != '') {
                div.gyeong[i][div.header[j]] = (((div.gyeong[i][div.header[6]] / div.gyeong[i][div.header[j-3]]) - 1) * 100).toFixed(0);
            } else {
                div.gyeong[i][div.header[j]] = '';
            }
        }
    }
}

module.exports.getRate = getRate;