const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DisplayModification = new Schema({
    modifierId: {
        type: String,
        required: true
    },
    modifierType: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        default: Date.now
    },
    message: {
        type: String,
        required: true
    },
    user: {
        type: String
    },
});

module.exports = mongoose.model('DisplayModification', DisplayModification);
