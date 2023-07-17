const mongoose = require('mongoose');
mongoose.pluralize(null);

const TopicTodayTableSchema = new mongoose.Schema({
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
    notice: {
        type: String
    }
});

const topic_today_table = mongoose.model("TOPIC_TODAY_TABLE", TopicTodayTableSchema);
module.exports = topic_today_table;