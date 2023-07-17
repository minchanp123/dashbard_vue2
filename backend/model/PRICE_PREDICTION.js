const mongoose = require('mongoose');
mongoose.pluralize(null);
const Schema = mongoose.Schema;

const PricePredictionSchema = new Schema({
    datetime: {
        type: Date,
    },
    material: {
        type: String,
    },
    unstructured_1N: {
        type: Number,
    },
    unstructured_3N: {
        type: Number,
    },
    unstructured_6N: {
        type: Number,
    },
    weighted_N: {
        type: Number,
    },
    unstructured_1Y: {
        type: Number,
    },
    unstructured_3Y: {
        type: Number,
    },
    unstructured_6Y: {
        type: Number,
    },
    weighted_Y: {
        type: Number,
    },
    hyundai_1: {
        type: Number,
    },
    hyundai_3: {
        type: Number,
    },
    hyundai_6: {
        type: Number,
    },
    sarimax_1: {
        type: Number,
    },
    sarimax_3: {
        type: Number,
    },
    sarimax_6: {
        type: Number,
    },
    ensemble_1: {
        type: Number,
    },
    ensemble_3: {
        type: Number,
    },
    ensemble_6: {
        type: Number,
    },
    default: {
        type: String,
    },
});

const price_prediction = mongoose.model("PRICE_PREDICTION", PricePredictionSchema);
module.exports = price_prediction;