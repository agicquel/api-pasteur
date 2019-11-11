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

router.post('/', loraController.loraValidate, async function (req, res) {
    try {
        logger.debug("res locals = " + util.inspect(res.locals, {showHidden: false, depth: null}));

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

        let response = [];
        if (res.locals.parsedData.c) {
            // Then send the response
            let displays = await Display.find({
                espId: {"$in": res.locals.parsedData.c},
                lopyMessageSync: false
            });

            displays.forEach(e => {
                let message = "";
                if (e.message != null) {
                    message = e.message;
                }
                let data = {
                    id: e.espId,
                    mes: message
                };
                response.push(data);

                // update last lopy attribute
                //e.lastLopy = req.body.devEUI;
                //e.save();
            });
        }

        let seq = Number(res.locals.parsedData.s) + 1;

        let devEUI = req.body.devEUI;
        let fport = req.body.fPort;
        let responseStruct = {
            'fPort': fport,
            'data': new Buffer(JSON.stringify({'s': seq, 'm': response})).toString("base64"),
            'devEUI': devEUI
        };

        logger.debug("lopy response : " + JSON.stringify(responseStruct));

        res.end(JSON.stringify(responseStruct));
        res.end();
    } catch (error) {
        logger.debug("erreur processing : " + error);
        res.status(400).send("Error while processing");
    }
});

module.exports = router;
