const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DataRate = mongoose.model('DataRate');

const LopyStatus = new Schema({
    name: String,
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
    time: String
});

const LopySchema = new Schema({
    mac: {
        type: String,
        trim: true,
        required: true,
    },
    status: [LopyStatus]
});

module.exports = mongoose.model('LopyStatus', LopyStatus);
module.exports = mongoose.model('Lopy', LopySchema);
