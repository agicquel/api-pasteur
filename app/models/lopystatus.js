const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DataRate = require("./datarates").schema;
const Gateway = require("./gateways").schema;

const LopyStatus = new Schema({
    devEUI: String,
    appEUI: String ,
    fPort: Number ,
    gatewayCount: Number,
    rssi: Number,
    loRaSNR: Number,
    frequency: Number,
    dataRate: DataRate,
    devAddr: String,
    fCntUp: Number,
    time: String,
    gateways: [Gateway]
});

module.exports = mongoose.model('LopyStatus', LopyStatus);
