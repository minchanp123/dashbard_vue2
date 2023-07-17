const mongoose = require('mongoose');
mongoose.pluralize(null);

const TopicCompanyTodayChartSchema = new mongoose.Schema({
    datetime: {
        type: Date
    },
    material: {
        type: String
    },
    topic: {
        type: String
    },
    frequency: {
        type: Number,
    },
    category: {
        type: String
    },
    tf: {
        type: Number,
    },
});

const topic_company_today_chart = mongoose.model("TOPIC_COMPANY_TODAY_CHART", TopicCompanyTodayChartSchema);
module.exports = topic_company_today_chart;