const mongoose = require('mongoose');
mongoose.pluralize(null);

const DocumentCompanySchema = new mongoose.Schema({
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
    topics: {
        type: String
    }
});

const document_company = mongoose.model("DOCUMENT_COMPANY", DocumentCompanySchema);
module.exports = document_company;