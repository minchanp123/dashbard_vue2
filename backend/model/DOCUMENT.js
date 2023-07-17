const mongoose = require('mongoose');
mongoose.pluralize(null);

const DocumentSchema = new mongoose.Schema({
    datetime: {
        type: Date,
    },
    doc_title: {
        type: String
    },
    material: {
        type: String
    },
    doc_url: {
        type: String
    },
    source: {
        type: String
    },
    topics: {
        type: String
    },
    prob: {
        type: Number
    }
});

const document = mongoose.model("DOCUMENT", DocumentSchema);
module.exports = document;