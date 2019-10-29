const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LopyStatus = require("./lopystatus").schema;

const Lopy = new Schema({
    mac: {
        type: String,
        trim: true,
        required: true,
    },
    status: [LopyStatus]
});

module.exports = mongoose.model('Lopy', Lopy);
