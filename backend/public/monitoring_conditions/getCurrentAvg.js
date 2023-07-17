const div = require('./monitoring_conditions_toCSV');
const real_price_trend =  require("../../model/REAL_PRICE_TREND");

// 현황
// 가장 최신 데이터 가져옴
async function getCurrentAvg() {

    console.log("현황");
    
    // 석유화학
    for (var i=0; i<div.division1.length; i++) {

        // let ret = await real_price_trend.find({material_other:division1[i]}).sort({datetime:-1}).limit(1);

        // if (ret[0] != undefined && ret[0].price != null) {
        //     석유화학[i][div.header[6]] = ret[0].price;
        // }else{
        //     석유화학[i][div.header[6]] = '';
        // }
        
        // if(ret[0] != undefined && ret[0].datetime !=null){
        //     석유화학[i][div.header[7]] = ret[0].datetime;
        // }else{
        //     석유화학[i][div.header[7]] = '';
        // }
        if (i < 2) {
            // material: PP, PC
            // material: material, material_other = ''
            let ret = await real_price_trend.aggregate([
                {
                    $project: {
                        datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
                        price: '$price',
                        material: '$material',
                        material_other: '$material_other'
                    }
                },
                { $match: {material: div.division1[i], material_other: ''}},
                { 
                    $group: {
                        _id: '$datetime',
                        price: {$avg: '$price'},
                    }
                },
                {$sort: {_id: -1}},
                {$limit: 1}
            ])

            if (ret[0] != undefined && ret[0].price != null) {
                div.seok[i][div.header[6]] = ret[0].price;
                div.seok[i][div.header[7]] = ret[0]._id;
            } else {
                // 찾고자 하는 데이터가 없을 경우 빈 값으로 채워줌
                div.seok[i][div.header[6]] = '';
                div.seok[i][div.header[7]] = '';
            }
        } else {
            // material: bpa, dubai, brent, wti, naphtha
            // material_other: material
            let ret = await real_price_trend.aggregate([
                {
                    $project: {
                        datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
                        price: '$price',
                        material: '$material',
                        material_other: '$material_other'
                    }
                },
                { $match: {material_other: div.division1[i]}},
                {
                    $group: {
                        _id: '$datetime',
                        price: {$avg: '$price'}
                    }
                },
                {$sort: {_id: -1}},
                {$limit: 1}
            ])

            if (ret[0] != undefined && ret[0].price != null) {
                div.seok[i][div.header[6]] = ret[0].price;
                div.seok[i][div.header[7]] = ret[0]._id;
            } else {
                // 찾고자 하는 데이터가 없을 경우 빈 값으로 채워줌
                div.seok[i][div.header[6]] = '';
                div.seok[i][div.header[7]] = '';
            }
        }
    }

    // 강재
    for (var i=0; i<div.division2.length; i++) {

        // let ret = await real_price_trend.find({material_other:division2[i]}).sort({datetime:-1});

        // if (ret[0] != undefined && ret[0].price != null) {
        //     강재[i][div.header[6]] = ret[0].price;
        // }else{
        //     강재[i][div.header[6]] = '';
        // }
        
        // if(ret[0] != undefined && ret[0].datetime !=null){
        //     강재[i][div.header[7]] = ret[0].datetime;
        // }else{
        //     강재[i][div.header[7]] = '';
        // }
        if (i < 1) {
            // 열연코일(HR)
            let ret = await real_price_trend.aggregate([
                {
                    $project: {
                        datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
                        price: '$price',
                        material: '$material',
                        material_other: '$material_other'
                    }
                },
                { $match: {material: div.division2[i], material_other: ''}},
                {
                    $group: {
                        _id: '$datetime',
                        price: {$avg: '$price'}
                    }
                },
                {$sort: {_id: -1}},
                {$limit: 1}
            ])
  
            if (ret[0] != undefined && ret[0].price != null) {
                div.kang[i][div.header[6]] = ret[0].price;
                div.kang[i][div.header[7]] = ret[0]._id;
            } else {
                // 찾고자 하는 데이터가 없을 경우 빈 값으로 채워줌
                div.kang[i][div.header[6]] = '';
                div.kang[i][div.header[7]] = '';
            }
        } else {
            // material: iron_ore china, bituminous_coal
            // material_other: material
            let ret = await real_price_trend.aggregate([
                {
                    $project: {
                        datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
                        price: '$price',
                        material_other: '$material_other'
                    }
                },
                { $match: {material_other: div.division2[i]}},
                {
                    $group: {
                        _id: '$datetime',
                        price: {$avg: '$price'}
                    }
                },
                {$sort: {_id: -1}},
                {$limit: 1}
            ])
    
            if (ret[0] != undefined && ret[0].price != null) {
                div.kang[i][div.header[6]] = ret[0].price;
                div.kang[i][div.header[7]] = ret[0]._id;
            } else {
                // 찾고자 하는 데이터가 없을 경우 빈 값으로 채워줌
                div.kang[i][div.header[6]] = '';
                div.kang[i][div.header[7]] = '';
            }
        }
    }

    // 비철금속
    for (var i=0; i<div.division3.length; i++) {
        // material: NI, AL, CU
        // material: material, material_other: ''

        // let ret = await real_price_trend.find({material_other:division3[i]}).sort({datetime:-1});

        // if (ret[0] != undefined && ret[0].price != null) {
        //     비철금속[i][div.header[6]] = ret[0].price;
        // }else{
        //     비철금속[i][div.header[6]] = '';
        // }
        
        // if(ret[0] != undefined && ret[0].datetime !=null){
        //     비철금속[i][div.header[7]] = ret[0].datetime;
        // }else{
        //     비철금속[i][div.header[7]] = '';
        // }
        let ret = await real_price_trend.aggregate([
            {
                $project: {
                    datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
                    price: '$price',
                    material: '$material',
                    material_other: '$material_other'
                }
            },
            { $match: {material: div.division3[i], material_other: ''}},
            {
                $group: {
                    _id: '$datetime',
                    price: {$avg: '$price'}
                }
            },
            {$sort: {_id: -1}},
            {$limit: 1}
        ])

        if (ret[0] != undefined && ret[0].price != null) {
            div.bicheol[i][div.header[6]] = ret[0].price;
            div.bicheol[i][div.header[7]] = ret[0]._id;
        } else {
            // 찾고자 하는 데이터가 없을 경우 빈 값으로 채워줌
            div.bicheol[i][div.header[6]] = '';
            div.bicheol[i][div.header[7]] = '';
        }
    }

    // 경제지표
    for (var i=0; i<div.division4.length; i++) {
        // material: usd, eur, cny, scfi
        // material: main, material_other: material

        // let ret = await real_price_trend.find({material_other:division4[i]}).sort({datetime:-1});

        // if (ret[0] != undefined && ret[0].price != null) {
        //     경제지표[i][div.header[6]] = ret[0].price;
        // }else{
        //     경제지표[i][div.header[6]] = '';
        // }
        
        // if(ret[0] != undefined && ret[0].datetime !=null){
        //     경제지표[i][div.header[7]] = ret[0].datetime;
        // }else{
        //     경제지표[i][div.header[7]] = '';
        // }
        let ret = await real_price_trend.aggregate([
            {
                $project: {
                    datetime: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
                    price: '$price',
                    material: '$material',
                    material_other: '$material_other'
                }
            },
            { $match: {material: 'main', material_other: div.division4[i]}},
            {
                $group: {
                    _id: '$datetime',
                    price: {$avg: '$price'}
                }
            },
            {$sort: {_id: -1}},
            {$limit: 1}
        ]);

        if (ret[0] != undefined && ret[0].price != null) {
            div.gyeong[i][div.header[6]] = ret[0].price;
            div.gyeong[i][div.header[7]] = ret[0]._id;
        } else {
            // 찾고자 하는 데이터가 없을 경우 빈 값으로 채워줌
            div.gyeong[i][div.header[6]] = '';
            div.gyeong[i][div.header[7]] = '';
        }

        // if(ret.length < 0){
        //     if (ret[0] != undefined && ret[0].price != null) {
        //         경제지표[i][div.header[6]] = ret[0].price;
        //     } else {
        //         경제지표[i][div.header[6]] = '';
        //     }
        // }else{
        //     경제지표[i][div.header[6]] = await real_price_trend.find({material_other:division4[i], datetime: {$gte: new Date(month+"-01T00:00:00.000Z")}})[0].price;
        // }

    }
}

module.exports.getCurrentAvg = getCurrentAvg;