const mongoose = require('mongoose');
mongoose.pluralize(null);

const RealPriceTrendTodaySchema = new mongoose.Schema({
    material_list: {
        type: String,
    },
    index: {
        type: Number,
    },
    material: {
        type: String
    },
    source: {
        type: String
    },
    unit: {
        type: String
    },
    last_year_avg: {
        type: Number
    },
    last_quarter_avg: {
        type: Number
    },
    last_month_avg: {
        type: Number
    },
    current: {
        type: Number
    },
    last_year_rate: {
        type: Number
    },
    last_quarter_rate: {
        type: Number
    },
    last_month_rate: {
        type: Number
    },
    ref_date:{
        type: Date
    },
    frequency: {
        type: String
    },
});

const real_price_trend_today = mongoose.model("REAL_PRICE_TREND_TODAY", RealPriceTrendTodaySchema);
module.exports = real_price_trend_today;