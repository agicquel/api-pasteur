const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LopyStatus = require("./lopystatus").schema;
const timestamps = require('mongoose-timestamp');

const Lopy = new Schema({
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
    }
});

Lopy.plugin(timestamps);

module.exports = mongoose.model('Lopy', Lopy);
