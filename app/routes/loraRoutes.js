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

router.post('/', loraController.loraValidate, async function (req, res) {
    try {
        logger.debug("parsed data = " + util.inspect(res.locals.parsedData, {showHidden: false, depth: null}));

        if (res.locals.lopy.currentSeq < res.locals.parsedData.s) {
            res.locals.lopy.currentSeq = res.locals.parsedData.s;
            res.locals.lopy.save();

            // Sync messages if needed
            if (res.locals.parsedData.m) {
                res.locals.parsedData.m.forEach(function (esp) {
                    Display.findOneAndUpdate(
                        {espId: {"$in": esp.id}},
                        {
                            $set: {
                                message: esp.mes,
                                lopyMessageSync: true,
                                lopyMessageSeq : res.locals.parsedData.s
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

            if (res.locals.parsedData.d) {
                res.locals.parsedData.d.forEach(function (espId) {
                    Display.findOneAndUpdate({espId: espId}, {
                        $set: {
                            lastLopy: "null",
                            lopyMessageSync: false,
                            lopyMessageSeq : 0
                        }
                    });
                });
            }

            if (res.locals.parsedData.c) {
                res.locals.parsedData.c.forEach(function (espId) {
                    Display.findOneAndUpdate({espId: espId}, {
                        $set: {
                            lastLopy: req.body.devEUI,
                            lopyMessageSync: false,
                            lopyMessageSeq : res.locals.parsedData.s
                        }
                    });
                });
            }

            await Display.updateMany(
                {lastLopy: req.body.devEUI},
                {lopyMessageSync: true, lopyMessageSeq: res.locals.parsedData.s}
            );
        }

        Display.find({
            espId: req.body.devEUI,
            lopyMessageSync: false
        }, function (err, displays) {
            let seq = Number(res.locals.parsedData.s) + 1;
            let devEUI = req.body.devEUI;
            let fport = req.body.fPort;
            let response = [];

            if(!err && displays) {
                displays.forEach(e => {
                    let message = "";
                    if (e.message != null) {
                        message = e.message;
                    }
                    let data = {
                        id: e.espId,
                        mes: message
                    };
                    logger.debug("send message = " + e.message);
                    response.push(data);
                });

                let responseStruct = {
                    'fPort': fport,
                    'data': new Buffer(JSON.stringify({'s': seq, 'm': response})).toString("base64"),
                    'devEUI': devEUI
                };

                logger.debug("lopy response : " + JSON.stringify(responseStruct));

                res.end(JSON.stringify(responseStruct));
                res.end();
            }
        });
    } catch (error) {
        logger.debug("erreur processing : " + error);
        res.status(400).send("Error while processing");
    }
});

module.exports = router;
