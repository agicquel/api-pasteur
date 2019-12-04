const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const DisplayModification = require("./displaymodifications").schema;

let DisplaySchema = new Schema({
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
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    history: [DisplayModification],
    lastLopy: {
        type: String
    },
    lopyMessageSeq: {
        type: Number,
        default: 0
    },
    lopyMessageSync : {
        type: Boolean,
        default: false
    }
});

DisplaySchema.pre('save', function(next) {
    var self = this;
    self.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Display', DisplaySchema);