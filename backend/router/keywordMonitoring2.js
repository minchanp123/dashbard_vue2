const express = require('express');
var router = express.Router();

const documentCompanyDao = require('../dao/keywordMonitoring2/documentCompanyDao');
const topicCompanyDao = require('../dao/keywordMonitoring2/topicCompanyDao');

router.use('/document_company', documentCompanyDao);
router.use('/topic_company', topicCompanyDao);

module.exports = router;