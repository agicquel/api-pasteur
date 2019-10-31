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
        res.locals.parsedData.esp_not_sync.forEach(function(esp) {
            Display.findOneAndUpdate(
                { espId: { "$in" : esp.espid} },
                {
                    $set : {"message" : esp.message},
                    $push: { history : new DisplayModification({modifierId:req.body.devEUI, modifierType:"lopy"})}
                }
            );
        });
        
        // Then send the response
        let displays = await Display.find({
            espId: { "$in" : res.locals.parsedData.esp_subscribed}
        });

        let response = [];
        displays.forEach(e => {
            let message = "";
            if (e.message != null) {
                message = e.message;
            }
            let data = {
                espId: e.espId,
                message: message
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
            'data': new Buffer(JSON.stringify(response)).toString("base64"),
            'devEUI': devEUI
        };

        logger.debug("lopy response : " + JSON.stringify(responseStruct));

        res.end(JSON.stringify(responseStruct));
        res.end();
    } catch (error) {
        console.error(error);
        res.status(400).send("Error while processing");
    }
});

module.exports = router;
