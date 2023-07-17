const mongoose = require('mongoose');
mongoose.pluralize(null);

const TopicReportSchema = new mongoose.Schema({
    material: {
        type: String
    },
    d_name: {
        type: String
    },
    d_datetime: {
        type: Date
    },
    topic: {
        type: String
    },
    first_datetime: {
        type: Date
    },
    tf: {
        type: Number
    },
    note: {
        type: String
    },
    before_datetime: {
        type: String
    },
    new: {
        type: String
    },
});

const topic_report = mongoose.model("TOPIC_REPORT", TopicReportSchema);
module.exports = topic_report;