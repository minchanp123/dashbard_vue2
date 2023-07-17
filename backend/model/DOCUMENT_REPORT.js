const mongoose = require('mongoose');
mongoose.pluralize(null);

const DocumentReportSchema = new mongoose.Schema({
    material: {
        type: String
    },
    doc_title: {
        type: String
    },
    datetime: {
        type: Date
    },
    source: {
        type: String
    }
});

const document_report = mongoose.model("DOCUMENT_REPORT", DocumentReportSchema);
module.exports = document_report;