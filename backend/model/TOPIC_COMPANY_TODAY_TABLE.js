const mongoose = require('mongoose');
mongoose.pluralize(null);

const TopicCompanyTodayTableSchema = new mongoose.Schema({
    rank: {
        type: Number,
    },
    topic: {
        type: String
    },
    tf: {
        type: Number,
    },
    material: {
        type: String
    },
    frequency: {
        type: Number,
    },
});

const topic_company_today_table = mongoose.model("TOPIC_COMPANY_TODAY_TABLE", TopicCompanyTodayTableSchema);
module.exports = topic_company_today_table;