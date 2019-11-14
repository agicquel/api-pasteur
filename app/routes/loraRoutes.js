const router = require('express').Router();
const mongoose = require('mongoose');
const Display = mongoose.model('Display');
const Lopy = mongoose.model('Lopy');
const LopyStatus = mongoose.model('LopyStatus');
const DataRate = mongoose.model('DataRate');
const Gateway = mongoose.model('Gateway');
const loraController = require('../middleware/loraMiddleware');
const log4js = require('log4js');
const logger = log4js.getLogger('console');
const DisplayModification = mongoose.model('DisplayModification');
const util = require('util');

async function handleRequest(req, res) {
    if (res.locals.lopy.currentSeq < res.locals.parsedData.s) {
        res.locals.lopy.currentSeq = res.locals.parsedData.s;
        res.locals.lopy.save();

        // Sync messages if needed
        if (res.locals.parsedData.hasOwnProperty("m")) {
            await res.locals.parsedData.m.forEach(function (esp) {
                Display.findOneAndUpdate(
                    {espId: {"$in": esp.id}},
                    {
                        $set: {
                            message: esp.mes,
                            lopyMessageSync: true,
                            lopyMessageSeq: res.locals.lopy.currentSeq
                        },
                        $push: {
                            history: new DisplayModification({
                                modifierId: req.body.devEUI,
                                modifierType: "lopy"
                            })
                        }
                    }
                );
            });
        }

        if (res.locals.parsedData.hasOwnProperty("d")) {
            await res.locals.parsedData.d.forEach(function (espId) {
                logger.debug("device disconnected = " + espId);

                Display.findOne({espId: espId}, function (err, display) {
                    if(!err && display) {
                        display.lastLopy = "null";
                        display.lopyMessageSync = false;
                        display.lopyMessageSeq = 0;
                        display.save();
                    }
                });
            });
        }

        if (res.locals.parsedData.hasOwnProperty("c")) {
            await res.locals.parsedData.c.forEach(function (espId) {
                logger.debug("device connected = " + espId);
                Display.findOne({espId: espId}, function (err, display) {
                    if(!err && display) {
                        display.lastLopy = req.body.devEUI;
                        display.lopyMessageSync = false;
                        display.lopyMessageSeq = res.locals.lopy.currentSeq;
                        display.save();
                    }
                });
            });
        }
    }

    Display.find({
        lastLopy: req.body.devEUI,
        lopyMessageSync: false
    }, function (err, displays) {

        if (err) {
            logger.debug("err in Display.find = " + err);
        }

        Display.updateMany({
            lastLopy: req.body.devEUI,
            lopyMessageSeq: (res.locals.parsedData.s - 1)
        }, {
            lopyMessageSync: true,
            lopyMessageSeq: res.locals.lopy.currentSeq
        });

        let response = [];
        if (!err && displays) {
            displays.forEach(d => {
                let message = "";
                if (d.message != null) {
                    message = d.message;
                }
                let data = {
                    id: d.espId,
                    mes: message
                };
                logger.debug("send message = " + d.message);
                Display.findOneAndUpdate({espId: d.espId}, {$set:{lopyMessageSeq : res.locals.lopy.currentSeq}});
                response.push(data);
            });

            let data = {};
            if(response.length > 0) {
                data = {
                    's': res.locals.lopy.currentSeq,
                    'm': response
                };
            }
            else {
                data = {
                    's': res.locals.lopy.currentSeq
                };
            }

            let responseStruct = {
                'fPort': req.body.fPort,
                'data': new Buffer(JSON.stringify(data)).toString("base64"),
                'devEUI': req.body.devEUI
            };

            logger.debug("lopy response : " + JSON.stringify(responseStruct));

            res.end(JSON.stringify(responseStruct));
            res.end();
        }
    });
}

async function handleRequestReset(req, res) {
    res.locals.lopy.currentSeq = 0;
    res.locals.lopy.save();

    Display.find({lastLopy: req.body.devEUI}, function (err, displays) {
        if(!err && displays) {
            displays.forEach(d => {
                d.lastLopy = "null";
                d.lopyMessageSync = false;
                d.lopyMessageSeq = 0;
                d.save();
            });
        }
    });

    let responseStruct = {
        'fPort': req.body.fPort,
        'data': new Buffer(JSON.stringify({
            's': 0
        })).toString("base64"),
        'devEUI': req.body.devEUI
    };

    logger.debug("lopy response : " + JSON.stringify(responseStruct));
    res.end(JSON.stringify(responseStruct));
    res.end();
}

router.post('/', loraController.loraValidate, async function (req, res) {
    try {
        logger.debug("parsed data = " + util.inspect(res.locals.parsedData, {showHidden: false, depth: null}));
        if (res.locals.parsedData.s === 0) {
            logger.debug("call handleRequestReset");
            await handleRequestReset(req, res);
        }
        else {
            logger.debug("call handleRequest");
            await handleRequest(req, res);
        }

        } catch (error) {
        logger.debug("erreur processing : " + error);
        res.status(400).send("Error while processing");
    }
});

module.exports = router;
