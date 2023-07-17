const mongoose = require('mongoose');
mongoose.pluralize(null);
const Schema = mongoose.Schema;

const RealTrendSchema = new Schema({
    datetime: {
        type: Date,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    variation: {
        type: Number,
        required: true
    },
    variation_price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    }
});

const real_trend = mongoose.model("REAL_TREND", RealTrendSchema);
module.exports = real_trend;