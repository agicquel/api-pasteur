const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const DisplayModification = require("./displaymodifications").schema;
const timestamps = require('mongoose-timestamp');

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
    history: [DisplayModification],
    lastLopy: {
        type: String
    },
    lopyMessageSeq: {
        type: Number,
        default: 0
    },
    lopyMessageSync : {
        type: Boolean,
        default: false
    }
});

<<<<<<< HEAD
DisplaySchema.plugin(timestamps, {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

=======
>>>>>>> parent of 15e603f... update timestamp
module.exports = mongoose.model('Display', DisplaySchema);
