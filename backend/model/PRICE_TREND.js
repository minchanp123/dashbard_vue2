const mongoose = require('mongoose');
mongoose.pluralize(null);

const PriceTrendSchema = new mongoose.Schema({
    datetime: {
        type: Date
    },
    price: {
        type: Number
    },
    material: {
        type: String
    },
    material_other: {
        type: String
    },
});

const price_trend = mongoose.model("PRICE_TREND", PriceTrendSchema);
module.exports = price_trend;