const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var ObjectId = mongoose.Schema.Types.ObjectId;

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
    }
});

const DisplaySchema = new Schema({
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
});

module.exports = mongoose.model('DisplayModification', DisplaySchema);
module.exports = mongoose.model('Display', DisplaySchema);