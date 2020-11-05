const router = require('express').Router();
const mongoose = require('mongoose');
const Display = mongoose.model('Display');
const loraController = require('../middleware/loraMiddleware');
const log4js = require('log4js');
const logger = log4js.getLogger('console');
const DisplayModification = mongoose.model('DisplayModification');
const util = require('util');

async function handleRequest(req, res) {
    let num = res.locals.lora_request.readInt8(0);
    if (res.locals.lopy.currentReqNum < num) {
        let order = 0;
        let length = res.locals.lora_request.length;
        if(length > 1) {
            order = res.locals.lora_request.readInt8(1);
        }

        console.log("num = " + num);
        console.log("order = " + order);

        let proceed = false;
        if(order in [2, 6, 10]) {
            res.locals.lopy.request = res.locals.lora_request.slice(2, length).toString();
            proceed = true;
        }
        else if(order in [3, 7, 11]) {
            res.locals.lopy.request = res.locals.lora_request.slice(2, length).toString();
        }
        else if(order in [4, 8, 12]) {
            res.locals.lopy.request += res.locals.lora_request.slice(2, length).toString();
        }
        else if(order in [4, 8, 12]) {
            res.locals.lopy.request += res.locals.lora_request.slice(2, length).toString();
            proceed = true;
        }

        if(proceed === true) {
            console.log("Can analyze the request");
            console.log("request = " + res.locals.lopy.request);

            if(order in [2, 5]) {
                let conType = res.locals.lopy.request[0];
                let espId = res.locals.lopy.request.substr(1);
                if(conType === 'c') {
                    await Display.findOne({espId: espId}, function (err, display) {
                        if(!err && display) {
                            display.lastLopy = req.body.devEUI.toString();
                            display.lopyMessageSync = false;
                            display.lopyMessageSeq = res.locals.lopy.currentSeq + 2;
                            display.save();
                        }
                    });
                }
                else if(conType === 'd') {
                    await Display.findOne({espId: espId}, function (err, display) {
                        if(!err && display) {
                            display.lastLopy = "null";
                            display.lopyMessageSync = false;
                            display.lopyMessageSeq = -1;
                            display.save();
                        }
                    });
                }
            }
            else if(order in [6, 9]) {
                res.locals.lopy.currentReqExtraData = res.locals.lopy.request;
            }
            else if(order in [10, 13]) {
                let espId = res.locals.lopy.currentReqExtraData;
                let message = res.locals.lopy.request;

                await Display.findOne({espId: espId}, function (err, display) {
                    if (typeof err !== 'undefined' && err !== null) {
                        logger.debug("err = " + util.inspect(err, {showHidden: false, depth: null}));
                    }
                    else if (typeof display !== 'undefined' && display !== null) {
                        display.message = message;
                        display.lopyMessageSeq = res.locals.lopy.currentSeq;
                        display.lopyMessageSync = true;
                        display.lopyMessageSendCounter = 0;
                        display.history.push(new DisplayModification({
                            modifierId: req.body.devEUI,
                            modifierType: "lopy",
                            message: message,
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

                res.locals.lopy.currentReqExtraData = "";
            }

            res.locals.lopy.request = "";
        }

        res.locals.lopy.save();
    }
    else {
        num = res.locals.lopy.currentReqNum;
    }

    let responseStruct = {
        'fPort': req.body.fPort,
        'data': new Buffer(JSON.stringify(num)).toString("base64"), //String(res.locals.lora_request.readInt8(0)), //new Buffer(res.locals.lora_request.readInt8(0)).toString("base64"),
        'devEUI': req.body.devEUI
    };

    logger.debug("lopy response : " + JSON.stringify(responseStruct));
    console.log("lopy response : " + JSON.stringify(responseStruct));
    res.end(JSON.stringify(responseStruct));
    res.end();


    // if (res.locals.lopy.currentSeq < res.locals.parsedData.s) {
    //     res.locals.lopy.currentSeq = res.locals.parsedData.s;
    //     res.locals.lopy.save();
    //
    //     if (res.locals.parsedData.hasOwnProperty("d")) {
    //         await res.locals.parsedData.d.forEach(function (espId) {
    //             logger.debug("device disconnected = " + espId);
    //
    //             Display.findOne({espId: espId}, function (err, display) {
    //                 if(!err && display) {
    //                     display.lastLopy = "null";
    //                     display.lopyMessageSync = false;
    //                     display.lopyMessageSeq = -1;
    //                     display.save();
    //                 }
    //             });
    //         });
    //     }
    //
    //     if (res.locals.parsedData.hasOwnProperty("c")) {
    //         await res.locals.parsedData.c.forEach(function (espId) {
    //             logger.debug("device connected = " + espId);
    //             Display.findOne({espId: espId}, function (err, display) {
    //                 if(!err && display) {
    //                     display.lastLopy = req.body.devEUI.toString();
    //                     display.lopyMessageSync = false;
    //                     display.lopyMessageSeq = res.locals.lopy.currentSeq + 2;
    //                     display.save();
    //                 }
    //             });
    //         });
    //     }
    //
    //     // Sync messages if needed
    //     if (res.locals.parsedData.hasOwnProperty("m")) {
    //         logger.debug("has m property");
    //         await res.locals.parsedData.m.forEach(function (esp) {
    //             Display.findOne({espId: esp.id}, function (err, display) {
    //                 if (typeof err !== 'undefined' && err !== null) {
    //                     logger.debug("err = " + util.inspect(err, {showHidden: false, depth: null}));
    //                 }
    //                 else if (typeof display !== 'undefined' && display !== null) {
    //                     display.message = esp.mes.toString();
    //                     display.lopyMessageSeq = res.locals.lopy.currentSeq;
    //                     display.lopyMessageSync = true;
    //                     display.lopyMessageSendCounter = 0;
    //                     display.history.push(new DisplayModification({
    //                         modifierId: req.body.devEUI,
    //                         modifierType: "lopy",
    //                         message: esp.mes.toString(),
    //                         user: "lopy"
    //                     }));
    //                     logger.debug("save message : " + esp.mes.toString());
    //                     display.save(function (err) {
    //                         if (err) {
    //                             logger.debug("err = " + err);
    //                         }
    //                     });
    //
    //                 }
    //             });
    //         });
    //     }
    // }
    //
    // Display.find({
    //     lastLopy: req.body.devEUI,
    //     lopyMessageSync: false
    // }, function (err, displays) {
    //
    //     if (err) {
    //         logger.debug("err in Display.find = " + err);
    //     }
    //
    //     let response = [];
    //     if (!err && displays) {
    //         displays.forEach(d => {
    //             if(res.locals.lopy.currentSeq == d.lopyMessageSeq && d.lopyMessageSendCounter > 0) {
    //                 d.lopyMessageSync = true
    //             }
    //             else if((res.locals.lopy.currentSeq +1) == d.lopyMessageSeq) {
    //                     let message = "";
    //                     if (d.message != null) {
    //                         message = d.message;
    //                     }
    //                     let data = {
    //                         id: d.espId,
    //                         mes: message
    //                     };
    //                     d.lopyMessageSendCounter = d.lopyMessageSendCounter + 1;
    //                     logger.debug("send message = " + d.message);
    //                     response.push(data);
    //             }
    //             else {
    //                 logger.debug("d = " + d._id + "Save new seq = " + (res.locals.lopy.currentSeq + 2));
    //                 d.lopyMessageSeq = res.locals.lopy.currentSeq + 2;
    //             }
    //             d.save(function (err) {
    //                 if (err) {
    //                     logger.debug("err = " + err);
    //                 }
    //             });
    //         });
    //
    //         let data = {};
    //         if(response.length > 0) {
    //             data = {
    //                 's': res.locals.lopy.currentSeq,
    //                 'm': response
    //             };
    //         }
    //         else {
    //             data = {
    //                 's': res.locals.lopy.currentSeq
    //             };
    //         }
    //
    //         let responseStruct = {
    //             'fPort': req.body.fPort,
    //             'data': new Buffer(JSON.stringify(data)).toString("base64"),
    //             'devEUI': req.body.devEUI
    //         };
    //
    //         logger.debug("lopy response : " + JSON.stringify(responseStruct));
    //
    //         res.end(JSON.stringify(responseStruct));
    //         res.end();
    //     }
    // });
}

async function handleRequestReset(req, res) {
    res.locals.lopy.currentSeq = 0;
    res.locals.lopy.save();

    Display.find({lastLopy: req.body.devEUI}, function (err, displays) {
        if(!err && displays) {
            displays.forEach(d => {
                d.lastLopy = "null";
                d.lopyMessageSync = false;
                d.currentReqNum = -1;
                d.currentReqData = "";
                d.currentReqExtraData = "";
                d.save();
            });
        }
    });

    let responseStruct = {
        'fPort': req.body.fPort,
        'data': new Buffer(JSON.stringify(res.locals.lora_request.readInt8(0))).toString("base64"), //String(res.locals.lora_request.readInt8(0)), //new Buffer(res.locals.lora_request.readInt8(0)).toString("base64"),
        'devEUI': req.body.devEUI
    };

    logger.debug("lopy response : " + JSON.stringify(responseStruct));
    console.log("lopy response : " + JSON.stringify(responseStruct));
    res.end(JSON.stringify(responseStruct));
    res.end();
}

router.post('/', loraController.loraValidate, async function (req, res) {
    console.log("start router lora");
    try {
        console.log("parsedData = " + util.inspect(res.locals.parsedData));
        res.locals.lora_request = Buffer.from(res.locals.parsedData, 'binary');
        console.log("res.locals.lora_request created : " + util.inspect(res.locals.lora_request));
        //logger.debug("lora_request = " + util.inspect(res.locals.lora_request));

        if (res.locals.lora_request.readInt8(0) === 0) {
            console.log("call handleRequestReset");
            logger.debug("call handleRequestReset");
            await handleRequestReset(req, res);
        }
        else {
            console.log("call handleRequest");
            logger.debug("call handleRequest");
            await handleRequest(req, res);
        }

    } catch (error) {
        console.log(error);
        logger.debug("erreur processing : " + error);
        res.status(400).send("Error while processing");
    }
});

module.exports = router;
