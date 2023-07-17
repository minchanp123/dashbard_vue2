const mongoose = require('mongoose');
mongoose.pluralize(null);

const RealPriceTrendCategorySchema = new mongoose.Schema({
    datetime: {
        type: Date
    },
    material: {
        type: String
    },
    category: {
        type: String
    },
    tf: {
        type: Number
    },
});

const real_price_trend_category = mongoose.model("REAL_PRICE_TREND_CATEGORY", RealPriceTrendCategorySchema);
module.exports = real_price_trend_category;