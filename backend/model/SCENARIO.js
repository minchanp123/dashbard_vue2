const mongoose = require('mongoose');
mongoose.pluralize(null);

const ScenarioSchema = new mongoose.Schema({
    material: {
        type: String
    },
    disease: {
        type: Number
    },
    climate: {
        type: Number
    },
    war: {
        type: Number
    }
});

const scenario = mongoose.model("SCENARIO", ScenarioSchema);
module.exports = scenario;