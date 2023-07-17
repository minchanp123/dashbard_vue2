const div = require('./monitoring_conditions_toCSV');
const real_price_trend =  require("../../model/REAL_PRICE_TREND");

// 전분기 평균
async function getLastQuarterAvg(quarter) {

    console.log('전분기 평균 ', quarter);

    // 석유화학
    for (var i=0; i<div.division1.length; i++) {
        if (i < 2) {
            // material: PP, PC
            // material: material, material_other: ''
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
                    $match: {material: div.division1[i], material_other: '', yearQuarter: quarter}
                },
                {
                    $group: {
                        "_id": "$yearQuarter",
                        "price": {$avg: "$price"}
                    }
                }
            ]);
  
            if (ret[0] != undefined && ret[0].price != null) {
                div.seok[i][div.header[1]] = ret[0].price;
            } else {
                // 찾고자 하는 데이터가 없을 경우 빈 값으로 채워줌
                div.seok[i][div.header[1]] = '';
            }

        } else {
            // material: bpa, dubai, brent, wti, naphtha
            // material: material, material_other: ''
            let ret = await real_price_trend.aggregate([
                {
                    $project: {
                        "yearQuarter": {$concat: [{$dateToString: {format: "%Y", date: "$datetime"}}, "-", {$substr: [{$add: [{$divide: [{$subtract: [{$month: "$datetime"}, 1]}, 3]}, 1]}, 0, 1]}]},
                        "price": "$price",
                        "material_other": "$material_other",
                    }
                },
                {
                    $match: {material_other: div.division1[i], yearQuarter: quarter}
                },
                {
                    $group: {
                        "_id": "$yearQuarter",
                        "price": {$avg: "$price"}
                    }
                }
            ]);
  
            if (ret[0] != undefined && ret[0].price != null) {
                div.seok[i][div.header[1]] = ret[0].price;
            } else {
                // 찾고자 하는 데이터가 없을 경우 빈 값으로 채워줌
                div.seok[i][div.header[1]] = '';
            }
        }
    }

    // 강재
    for (var i=0; i<div.division2.length; i++) {
        if (i < 1) {
            // material: HR
            // material: material, material_other: ''
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
                    $match: {material: div.division2[i], material_other: '', yearQuarter: quarter}
                },
                {
                    $group: {
                        "_id": "$yearQuarter",
                        "price": {$avg: "$price"}
                    }
                }
            ]);
  
            if (ret[0] != undefined && ret[0].price != null) {
                div.kang[i][div.header[1]] = ret[0].price;
            } else {
                // 찾고자 하는 데이터가 없을 경우 빈 값으로 채워줌
                div.kang[i][div.header[1]] = '';
            }

        } else {
            // material: iron_ore china, bituminous_coal
            // material_other: material
            let ret = await real_price_trend.aggregate([
                {
                    $project: {
                        "yearQuarter": {$concat: [{$dateToString: {format: "%Y", date: "$datetime"}}, "-", {$substr: [{$add: [{$divide: [{$subtract: [{$month: "$datetime"}, 1]}, 3]}, 1]}, 0, 1]}]},
                        "price": "$price",
                        "material_other": "$material_other",
                    }
                },
                {
                    $match: {material_other: div.division2[i], yearQuarter: quarter}
                },
                {
                    $group: {
                        "_id": "$yearQuarter",
                        "price": {$avg: "$price"}
                    }
                }
            ]);
  
            if (ret[0] != undefined && ret[0].price != null) {
                div.kang[i][div.header[1]] = ret[0].price;
            } else {
                // 찾고자 하는 데이터가 없을 경우 빈 값으로 채워줌
                div.kang[i][div.header[1]] = '';
            }
        }
    }

    // 비철금속
    for (var i=0; i<div.division3.length; i++) {
        // material: NI, AL, CU
        // material: material, material_other: ''
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
                $match: {material: div.division3[i], material_other: '', yearQuarter: quarter}
            },
            {
                $group: {
                    "_id": "$yearQuarter",
                    "price": {$avg: "$price"}
                }
            }
        ]);

        if (ret[0] != undefined && ret[0].price != null) {
            div.bicheol[i][div.header[1]] = ret[0].price;
        } else {
            // 찾고자 하는 데이터가 없을 경우 빈 값으로 채워줌
            div.bicheol[i][div.header[1]] = '';
        }
    }

    // 경제지표
    for (var i=0; i<div.division4.length; i++) {
        // material: usd, eur, cny, scfi
        // material: main, material_other: ''
        let ret = await real_price_trend.aggregate([
            {
                $project: {
                    "yearQuarter": {$concat: [{$dateToString: {format: "%Y", date: "$datetime"}}, "-", {$substr: [{$add: [{$divide: [{$subtract: [{$month: "$datetime"}, 1]}, 3]}, 1]}, 0, 1]}]},
                    "price": "$price",
                    "material": "$material",
                    "material_other": "$material_other",
                }
            },
            {
                $match: {material: 'main', material_other: div.division4[i], yearQuarter: quarter}
            },
            {
                $group: {
                    "_id": "$yearQuarter",
                    "price": {$avg: "$price"}
                }
            }
        ]);

        if (ret[0] != undefined && ret[0].price != null) {
            div.gyeong[i][div.header[1]] = ret[0].price;
        } else {
            // 찾고자 하는 데이터가 없을 경우 빈 값으로 채워줌
            div.gyeong[i][div.header[1]] = '';
        }
    }
}

module.exports.getLastQuarterAvg = getLastQuarterAvg;