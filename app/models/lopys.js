const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LopyStatus = require("./lopystatus").schema;

const Lopy = new Schema({
    mac: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    status: [LopyStatus],
    //esp: [String],
    currentSeq: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Lopy', Lopy);
