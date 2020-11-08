const router = require('express').Router();
const mongoose = require('mongoose');
const Display = mongoose.model('Display');
const loraController = require('../middleware/loraMiddleware');
const log4js = require('log4js');
const logger = log4js.getLogger('console');
const DisplayModification = mongoose.model('DisplayModification');
const util = require('util');
const RESPONSE_LIMIT = 20;

async function handleRequest(req, res) {
    let num = res.locals.lora_request.readInt8(0);
    let displayRequest;
    if ((res.locals.lopy.currentReqNum + 1) === num) {
        res.locals.lopy.currentReqNum = num;
        let order = 0;
        let length = res.locals.lora_request.length;
        if(length > 1) {
            order = res.locals.lora_request.readInt8(1);
        }

        logger.debug("num = " + num);
        logger.debug("order = " + order);

        let proceed = false;
        if([2, 6, 10].includes(order)) {
            res.locals.lopy.request = res.locals.lora_request.slice(2, length).toString();
            proceed = true;
        }
        else if([3, 7, 11].includes(order)) {
            res.locals.lopy.request = res.locals.lora_request.slice(2, length).toString();
        }
        else if([4, 8, 12].includes(order)) {
            res.locals.lopy.request += res.locals.lora_request.slice(2, length).toString();
        }
        else if([4, 8, 12].includes(order)) {
            res.locals.lopy.request += res.locals.lora_request.slice(2, length).toString();
            proceed = true;
        }

        if(proceed === true) {
            logger.debug("Can analyze the request");
            logger.debug("request = " + res.locals.lopy.request);

            if([2, 5].includes(order)) {
                let conType = res.locals.lopy.request[0];
                let espId = res.locals.lopy.request.substr(1);
                logger.debug("conType = " + conType);
                logger.debug("espId = " + espId);
                if(conType === 'c') {
                    await Display.findOne({espId: espId}, function (err, display) {
                        logger.debug("Display connection.");
                        if(!err && display) {
                            display.lastLopy = req.body.devEUI.toString();
                            display.lopyMessageSync = false;
                            //display.lopyMessageSeq = res.locals.lopy.currentSeq + 2;
                            display.save();
                        }
                    });
                }
                else if(conType === 'd') {
                    Display.findOne({espId: espId}, function (err, display) {
                        logger.debug("Display disconnection.");
                        if(!err && display) {
                            display.lastLopy = "null";
                            display.lopyMessageSync = false;
                            //display.lopyMessageSeq = -1;
                            display.save();
                        }
                    });
                }
            }
            else if([6, 9].includes(order)) {
                logger.debug("Store selection.");
                res.locals.lopy.currentReqExtraData = res.locals.lopy.request;
            }
            else if([10, 13].includes(order)) {
                let espId = res.locals.lopy.currentReqExtraData;
                let message = res.locals.lopy.request;
                logger.debug("message = " + message);
                logger.debug("espId = " + espId);

                await Display.findOne({espId: espId}, function (err, display) {
                    if (typeof err !== 'undefined' && err !== null) {
                        logger.debug("err = " + util.inspect(err, {showHidden: false, depth: null}));
                    }
                    else if (typeof display !== 'undefined' && display !== null) {
                        display.message = message;
                        //display.lopyMessageSeq = res.locals.lopy.currentSeq;
                        display.lopyMessageSync = true;
                        display.lopyMessageSendCounter = 0;
                        display.history.push(new DisplayModification({
                            modifierId: req.body.devEUI,
                            modifierType: "lopy",
                            message: message,
                            user: "lopy"
                        }));
                        logger.debug("save message : " + message);
                        console.log("save message : " + message);
                        display.save(function (err) {
                            if (err) {
                                console.log("err = " + err);
                                logger.debug("err = " + err);
                            }
                        });
                    }
                });

                res.locals.lopy.currentReqExtraData = "";
            }

            res.locals.lopy.request = "";
        }

        if(order === 0) {
            let display;
            if(res.locals.lopy.currentSynching && res.locals.lopy.currentSynching !== "") {
                display = await Display.findOne({espId: res.locals.lopy.currentSynching});
            }
            else {
                let displays = await Display.find({
                    lastLopy: req.body.devEUI,
                    lopyMessageSync: false
                });
                if (displays && displays.length > 0) {
                    display = displays[0];
                }
            }

            if(display) {
                if(display.lopyMessageSynching === false) {
                    logger.debug("create requests...");
                    display.lopyMessageSynching = true;
                    res.locals.lopy.currentSynching = display.espId;
                    // clear request, just in case
                    while(display.lopyRequest.length > 0) {
                        display.lopyRequest.pop();
                    }
                    const selection = splitRequest(display.espId, [6, 7, 8, 9]);
                    const message = splitRequest(display.message, [10, 11, 12, 13]);
                    Array.prototype.push.apply(display.lopyRequest, selection);
                    Array.prototype.push.apply(display.lopyRequest, message);
                    logger.debug("done. requests saved. : " + display.lopyRequest.toString());
                }
                if(display.lopyRequest.length === 0) {
                    logger.debug("all requests sent, sync done");
                    display.lopyMessageSynching = false;
                    display.lopyMessageSync = true;
                    res.locals.lopy.currentSynching = "";
                }
                else {
                    displayRequest = display.lopyRequest[0];
                    display.lopyRequest.shift();
                }
                await display.save();
                await res.locals.lopy.save();
            }
        }


        await res.locals.lopy.save();
    }
    else {
        num = res.locals.lopy.currentReqNum;
    }

    logger.debug("num = " + num);
    let data = Buffer.of(Uint8Array.of(num));
    if(displayRequest) {
        let buf_arr = [data , Buffer.from(displayRequest, 'hex')];
        data = Buffer.concat(buf_arr);
    }

    logger.debug(data);

    let responseStruct = {
        'fPort': req.body.fPort,
        'data': data.toString("base64"),
        'devEUI': req.body.devEUI
    };

    logger.debug("lopy response : " + JSON.stringify(responseStruct));
    console.log("lopy response : " + JSON.stringify(responseStruct));
    res.end(JSON.stringify(responseStruct));
    res.end();
}

async function handleRequestReset(req, res) {
    res.locals.lopy.currentReqNum = 0;
    res.locals.lopy.currentReqData = "";
    res.locals.lopy.currentReqExtraData = "";
    res.locals.lopy.currentSynching = "";
    await res.locals.lopy.save();

    Display.find({lastLopy: req.body.devEUI}, function (err, displays) {
        if(!err && displays) {
            displays.forEach(d => {
                d.lastLopy = "null";
                d.lopyMessageSync = false;
                d.lopyMessageSynching = false;
                while(d.lopyRequest.length > 0) {
                    d.lopyRequest.pop();
                }
                d.save();
            });
        }
    });

    let responseStruct = {
        'fPort': req.body.fPort,
        'data': Buffer.of(Uint8Array.of(res.locals.lora_request.readInt8(0))).toString("base64"),
        'devEUI': req.body.devEUI
    };

    logger.debug("lopy response : " + JSON.stringify(responseStruct));
    console.log("lopy response : " + JSON.stringify(responseStruct));
    res.end(JSON.stringify(responseStruct));
    res.end();
}

function splitRequest(data, orders) {
    let reqs = []
    let offset = 0;
    while(offset < data.length) {
        let subset = data.substr(offset, offset + RESPONSE_LIMIT);
        let req_order;
        if(reqs.length === 0) {
            if(subset.length === data.length) {
                req_order = orders[0];
            }
            else {
                req_order = orders[1];
            }
        }
        else {
            if(subset.length > RESPONSE_LIMIT) {
                req_order = orders[2];
            }
            else {
                req_order = orders[3];
            }
        }

        let uint8 = new Int8Array(1 + subset.length);
        uint8[0] = req_order;
        for(let i = 0; i < subset.length; i++) {
            uint8[i+1] = subset.charCodeAt(i);
        }
        reqs.push(Buffer.from(uint8, 'utf8').toString('hex'));
        offset += RESPONSE_LIMIT;
    }
    return reqs;
}

router.post('/', loraController.loraValidate, async function (req, res) {
    logger.debug("router lora");
    try {
        logger.debug("parsedData = " + util.inspect(res.locals.parsedData));
        res.locals.lora_request = Buffer.from(res.locals.parsedData, 'binary');
        logger.debug("res.locals.lora_request created : " + util.inspect(res.locals.lora_request));

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
