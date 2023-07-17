const express = require('express');
var router = express.Router();

const pricePredictionDao = require('../dao/materialMarket1/pricePredictionDao');
const realPriceTrendCategoryDao = require('../dao/materialMarket1/realPriceTrendCategoryDao');
const realPriceTrendDao = require('../dao/materialMarket1/realPriceTrendDao');
const riskDao = require('../dao/materialMarket1/riskDao');
const scenarioDao = require('../dao/materialMarket1/scenarioDao');

router.use('/price_prediction', pricePredictionDao);
router.use('/real_price_trend_category', realPriceTrendCategoryDao);
router.use('/real_price_trend', realPriceTrendDao);
router.use('/risk', riskDao);
router.use('/scenario', scenarioDao);

module.exports = router;