const mongoose = require('mongoose');
mongoose.pluralize(null);

const TopicMainSchema = new mongoose.Schema({
    rank: {
        type: Number,
    },
    material: {
        type: String
    },
    topic: {
        type: String
    },
    datetime: {
        type: Date
    },
});

const topic_main = mongoose.model("TOPIC_MAIN", TopicMainSchema);
module.exports = topic_main;