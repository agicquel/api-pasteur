const router = require('express').Router();
var mongoose = require('mongoose');
var Display = mongoose.model('Display');
const loraController = require('../controllers/loraController');
const auth = require('../controllers/auth');
const util = require('util')
var log4js = require('log4js');
var logger = log4js.getLogger('console');

router.post('/', auth.validateUser, async (req, res) => {}
/*
    try {
        if(typeof req.body.data.parsedData.esp_subscribed === 'undefined' || typeof req.body.data.parsedData.esp_not_sync === 'undefined') {
            logger.debug("Bad parameters");
            res.status(400).send("Bad parameters");
        }
        else {
            // Sync messages if needed
            req.body.data.parsedData.esp_not_sync.forEach(function(esp) {
                Display.findOneAndUpdate(
                    { espId: { "$in" : esp.espid} },
                    { $set : {"message" : esp.message}}
                );
            });

            // Then send the response
            let displays = await Display.find({
                espId: { "$in" : req.body.data.parsedData.esp_subscribed}
            });

            let response = [];
            displays.forEach(e => {
                let message = ""
                if (e.message != null) {
                    message = e.message;
                }
                let data = {
                    espId: e.espId,
                    message: message
                }
                response.push(data)
            });

            var devEUI = req.body.devEUI;
            var fport = req.body.fPort;
            
            logger.debug("date = " + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''))
            logger.debug("req.body : ");
            logger.debug(req.body);
            
            var responseStruct = {
                'fPort': fport,
                'data': new Buffer(JSON.stringify(response)).toString("base64"),
                'devEUI': devEUI
            };

            logger.debug(responseStruct)
            res.end(JSON.stringify(responseStruct));
            res.end();
        }
    } catch (error) {
        console.error(error);
        res.status(400).send("Error while processing");
    }
})*/



module.exports = router