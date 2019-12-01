const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const DisplayModification = require("./displaymodifications").schema;

const log4js = require('log4js');
const logger = log4js.getLogger('console');

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

const updateTimestamps = function (next, done) {
    let self = this;
    if (!self.createdAt) {
        self.createdAt = new Date();
    }
    self.updatedAt = new Date();
    logger.debug("time update triggered");
    next();
};

DisplaySchema.pre('save', true, updateTimestamps );
DisplaySchema.pre('update', true, updateTimestamps );
DisplaySchema.pre('findOneAndUpdate', true, updateTimestamps);

module.exports = mongoose.model('Display', DisplaySchema);
