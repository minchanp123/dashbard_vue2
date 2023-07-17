const express = require('express');
var router = express.Router();

const documentDao = require('../dao/keywordMonitoring1/documentDao');
const documentReportDao = require('../dao/keywordMonitoring1/documentReportDao');
const networkGraphDao = require('../dao/keywordMonitoring1/networkGraphDao');
const topicDao = require('../dao/keywordMonitoring1/topicDao');
const topicReportDao = require('../dao/keywordMonitoring1/topicReportDao');

router.use('/document', documentDao);
router.use('/document_report', documentReportDao);
router.use('/network_graph', networkGraphDao);
router.use('/topic', topicDao);
router.use('/topic_report', topicReportDao);

module.exports = router;