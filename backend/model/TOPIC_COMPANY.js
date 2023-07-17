const mongoose = require('mongoose');
mongoose.pluralize(null);

const TopicCompanySchema = new mongoose.Schema({
    material: {
        type: String
    },
    topic: {
        type: String
    },
    datetime: {
        type: Date
    },
    tf: {
        type: Number,
    },
    tf_idf: {
        type: Number,
    },
});

const topic_company = mongoose.model("TOPIC_COMPANY", TopicCompanySchema);
module.exports = topic_company;