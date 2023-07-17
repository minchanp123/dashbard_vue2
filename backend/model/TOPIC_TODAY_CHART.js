const mongoose = require('mongoose');
mongoose.pluralize(null);

const TopicTodayChartSchema = new mongoose.Schema({
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
    price: {
        type: Number,
    },
});

const topic_today_chart = mongoose.model("TOPIC_TODAY_CHART", TopicTodayChartSchema);
module.exports = topic_today_chart;