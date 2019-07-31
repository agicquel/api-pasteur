const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Display', DisplaySchema);