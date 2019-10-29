const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DataRateSchema = new Schema({
    modulation: {
        type: String,
        required: true
    },
    spreadFactor: {
        type: Number,
        required: true
    },
    bandwidth: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('DataRate', DataRateSchema);
