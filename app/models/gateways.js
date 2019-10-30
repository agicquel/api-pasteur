const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DataRate = require("./datarates").schema;

const GatewaySchema = new Schema({
    mac: {
        type: String,
        required: true
    },
    time: String,
    timestamp: String,
    frequency: Number,
    channel: Number,
    rfChain: Number,
    crcStatus: Number,
    codeRate: String,
    rssi: Number,
    loRaSNR: Number,
    size: Number,
    dataRate: DataRate
});

module.exports = mongoose.model('Gateway', GatewaySchema);
