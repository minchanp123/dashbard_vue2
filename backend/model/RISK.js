const mongoose = require('mongoose');
mongoose.pluralize(null);
const Schema = mongoose.Schema;

const RiskSchema = new Schema({
    material: {
        type: String
    },
    rank: {
        type: String
    },
    real_price: [],
    price_info: [],
    price_prediction: [],
    news: [],
    report: [],
    pre_rank: {
        type: String
    }
});

const risk = mongoose.model("RISK", RiskSchema);
module.exports = risk;