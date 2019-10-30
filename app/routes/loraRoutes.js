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

router.post('/', loraController.loraValidate, async function (req, res) {
    try {
        // Sync messages if needed
        res.locals.parsedData.esp_not_sync.forEach(function(esp) {
            Display.findOneAndUpdate(
                { espId: { "$in" : esp.espid} },
                { $set : {"message" : esp.message}}
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
        });

        let devEUI = req.body.devEUI;
        let fport = req.body.fPort;
        let responseStruct = {
            'fPort': fport,
            'data': new Buffer(JSON.stringify(response)).toString("base64"),
            'devEUI': devEUI
        };

        // save Lopy Data //
        Lopy.findOne({ mac: { "$in" : req.body.devEUI} }, function(err, lopy) {
            if (err || !lopy) {
                lopy = new Lopy({mac: req.body.devEUI});
            }

            let status = new LopyStatus({
                mac: lopy.mac,
                devEUI: req.body.devEUI,
                appEUI: req.body.appEUI ,
                fPort: req.body.fPort ,
                gatewayCount: req.body.gatewayCount,
                rssi: req.body.rssi,
                loRaSNR: req.body.loRaSNR,
                frequency: req.body.frequency,
                dataRate: new DataRate(req.body.dataRate),
                devAddr: req.body.devAddr,
                fCntUp: req.body.fCntUp,
                time: req.body.time,
            });

            /*req.body.gateways.forEach(g => {
                status.gateways.push(new DataRate(g));
            });*/
            lopy.status.push(status);
            lopy.status.slice(-50);
            
            lopy.save(function(err, lora) {
                if (err)
                    logger.debug("Lopy update failed : " + err);
                else
                    logger.debug("Lopy updated successfully");
            })

        });
        ////////////////////


        res.end(JSON.stringify(responseStruct));
        res.end();
    } catch (error) {
        console.error(error);
        res.status(400).send("Error while processing");
    }
});

module.exports = router;
