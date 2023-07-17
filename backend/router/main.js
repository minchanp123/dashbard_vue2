const express = require('express');
var router = express.Router();

const documentDao = require('../dao/main/documentDao');
const pricePredictionDao = require('../dao/main/pricePredictionDao');
const realPriceTrendDao = require('../dao/main/realPriceTrendDao');
const riskDao = require('../dao/main/riskDao');
const scenarioDao = require('../dao/main/scenarioDao');
const topicMainDao = require('../dao/main/topicMainDao');

router.use('/document', documentDao);
router.use('/price_prediction', pricePredictionDao);
router.use('/real_price_trend', realPriceTrendDao);
router.use('/risk', riskDao);
router.use('/scenario', scenarioDao);
router.use('/topic_main', topicMainDao);

module.exports = router;