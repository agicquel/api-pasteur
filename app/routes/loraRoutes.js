const router = require('express').Router();
const mongoose = require('mongoose');
const Display = mongoose.model('Display');
const loraController = require('../middleware/loraMiddleware');
const log4js = require('log4js');
const logger = log4js.getLogger('console');
const DisplayModification = mongoose.model('DisplayModification');
const util = require('util');

async function handleRequest(req, res) {
    if (res.locals.lopy.currentSeq < res.locals.parsedData.s) {
        res.locals.lopy.currentSeq = res.locals.parsedData.s;
        res.locals.lopy.save();

        if (res.locals.parsedData.hasOwnProperty("d")) {
            await res.locals.parsedData.d.forEach(function (espId) {
                logger.debug("device disconnected = " + espId);

                Display.findOne({espId: espId}, function (err, display) {
                    if(!err && display) {
                        display.lastLopy = "null";
                        display.lopyMessageSync = false;
                        display.lopyMessageSeq = -1;
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
                        display.lastLopy = req.body.devEUI.toString();
                        display.lopyMessageSync = false;
                        display.lopyMessageSeq = res.locals.lopy.currentSeq + 2;
                        display.save();
                    }
                });
            });
        }

        // Sync messages if needed
        if (res.locals.parsedData.hasOwnProperty("m")) {
            logger.debug("has m property");
            await res.locals.parsedData.m.forEach(function (esp) {
                Display.findOne({espId: esp.id}, function (err, display) {
                    if (typeof err !== 'undefined' && err !== null) {
                        logger.debug("err = " + util.inspect(err, {showHidden: false, depth: null}));
                    }
                    else if (typeof display !== 'undefined' && display !== null) {
                        display.message = esp.mes.toString();
                        display.lopyMessageSeq = res.locals.lopy.currentSeq;
                        display.lopyMessageSync = true;
                        display.lopyMessageSendCounter = 0;
                        display.history.push(new DisplayModification({
                            modifierId: req.body.devEUI,
                            modifierType: "lopy",
                            message: esp.mes.toString(),
                            user: "lopy"
                        }));
                        logger.debug("save message : " + esp.mes.toString());
                        display.save(function (err) {
                            if (err) {
                                logger.debug("err = " + err);
                            }
                        });

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

        let response = [];
        if (!err && displays) {
            displays.forEach(d => {
                if(res.locals.lopy.currentSeq == d.lopyMessageSeq && d.lopyMessageSendCounter > 0) {
                    d.lopyMessageSync = true
                }
                else if((res.locals.lopy.currentSeq +1) == d.lopyMessageSeq) {
                        let message = "";
                        if (d.message != null) {
                            message = d.message;
                        }
                        let data = {
                            id: d.espId,
                            mes: message
                        };
                        d.lopyMessageSendCounter = d.lopyMessageSendCounter + 1;
                        logger.debug("send message = " + d.message);
                        response.push(data);
                }
                else {
                    logger.debug("d = " + d._id + "Save new seq = " + (res.locals.lopy.currentSeq + 2));
                    d.lopyMessageSeq = res.locals.lopy.currentSeq + 2;
                }
                d.save(function (err) {
                    if (err) {
                        logger.debug("err = " + err);
                    }
                });
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
                d.lopyMessageSeq = -1;
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
