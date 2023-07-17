const express = require('express');
var router = express.Router();

const realPriceTrendDao = require('../dao/materialMarket2/realPriceTrendDao');
const realPriceTrendTodayDao = require('../dao/materialMarket2/realPriceTrendTodayDao');

router.use('/real_price_trend', realPriceTrendDao);
router.use('/real_price_trend_today', realPriceTrendTodayDao);

module.exports = router;