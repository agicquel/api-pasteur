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
        // Sync messages if needed
        res.locals.parsedData.m.forEach(function(esp) {
            Display.findOneAndUpdate(
                { espId: { "$in" : esp.espid} },
                {
                    $set : {"message" : esp.message},
                    $push: { history : new DisplayModification({modifierId:req.body.devEUI, modifierType:"lopy"})}
                }
            );
        });

        res.locals.parsedData.d.forEach(function (espId) {
            if(res.locals.lopy.esp.contains(espId)) {
                res.locals.lopy.esp.splice(res.locals.lopy.esp.splice.indexOf(espId), 1);
            }
        });

        res.locals.parsedData.c.forEach(function (espId) {
            if(!res.locals.lopy.esp.contains(espId)) {
                res.locals.lopy.esp.push(espId);
            }
        });

        res.locals.lopy.save();
        
        // Then send the response
        let displays = await Display.find({
            espId: { "$in" : res.locals.parsedData.c}
        });

        let seq = Number(res.locals.parsedData.s) + 1;
        let response = [];
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
            e.lastLopy = req.body.devEUI;
            e.save();
        });

        let devEUI = req.body.devEUI;
        let fport = req.body.fPort;
        let responseStruct = {
            'fPort': fport,
            'data': new Buffer(JSON.stringify({'s' : seq, 'm' : response})).toString("base64"),
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
