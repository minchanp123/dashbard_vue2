const mongoose = require('mongoose');
mongoose.pluralize(null);

const RealPriceTrendSchema = new mongoose.Schema({
    datetime: {
        type: Date
    },
    update_time: {
        type: Date
    },
    price: {
        type: Number
    },
    variation: {
        type: Number,
    },
    variation_price: {
        type: Number,
    },
    stock: {
        type: Number,
    },
    material: {
        type: String
    },
    material_other: {
        type: String
    },
});

const real_price_trend = mongoose.model("REAL_PRICE_TREND", RealPriceTrendSchema);
module.exports = real_price_trend;