const mongoose = require('mongoose');
mongoose.pluralize(null);

const TopicSchema = new mongoose.Schema({
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

const topic = mongoose.model("TOPIC", TopicSchema);
module.exports = topic;