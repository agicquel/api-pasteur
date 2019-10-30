const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const DisplayModification = require("./displaymodifications").schema;

const DisplaySchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    message: {
        type: String,
        trim: true,
        default: "..."
    },
    espId: {
        type: String,
        trim: true,
        unique : true,
        dropDups: true
    },
    owners : [ObjectId],
    lastLopy: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    history: [DisplayModification],
});

module.exports = mongoose.model('Display', DisplaySchema);
