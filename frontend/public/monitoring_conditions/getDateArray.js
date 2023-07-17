// 현재 날짜를 기준으로 전년, 전분기, 전월 날짜 구함

// 전년: (nowYear -1)-12-31
function getPrevYear(nowYear) {
    let prevYear = nowYear - 1;
    dateArray[0] = prevYear;
}

// 전분기  
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
        prevMonth = `${nowYear}-${month-1}`;
    }
    dateArray[2] = prevMonth;
}

// 현월
function getNowMonth(month) {
    let nowMonth = `${nowYear}-${month}`;

    dateArray[3] = nowMonth;
}

module.exports.getPrevYear = getPrevYear;
module.exports.getPrevQuarter = getPrevQuarter;
module.exports.getPrevMonth = getPrevMonth;
module.exports.getNowMonth = getNowMonth;
