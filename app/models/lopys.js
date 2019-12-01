const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LopyStatus = require("./lopystatus").schema;

let Lopy = new Schema({
    mac: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    status: [LopyStatus],
    currentSeq: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

Lopy.pre('save', function(next) {
    let self = this;
    if (!self.createdAt) {
        self.createdAt = new Date();
    }
    self.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Lopy', Lopy);
