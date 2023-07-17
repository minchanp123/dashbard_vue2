const mongoose = require('mongoose');
mongoose.pluralize(null);

const NetworkGraphSchema = new mongoose.Schema({
    _id:{
        type: String
    },
    material: {
        type: String
    },
    topic: {
        type: String
    },
    related: {
        type: String
    },
    tf: {
        type: Number
    },
    tf_idf:{
        type: Number
    },
    frequency:{
        type: Number
    }
});

const network_graph = mongoose.model("NETWORK_GRAPH", NetworkGraphSchema);
module.exports = network_graph;