const router = require('express').Router();
var mongoose = require('mongoose');
var Display = mongoose.model('Display');
const auth = require('../controllers/auth');
const util = require('util')
var log4js = require('log4js');
var logger = log4js.getLogger('console');

router.post('/', auth.validateUser, async (req, res) => {
    try {
        if (!req && !req.body.data) {
            logger.debug("Request missing");
            res.status(400).send("Request missing");
        } else if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
            logger.debug("Request empty");
            res.status(400).send("Request empty");
        } else {
            logger.debug(util.inspect(req.body, {showHidden: false, depth: null}))

            logger.debug("req.body = " + req.body)
            logger.debug("req = " + req.body.data)
            let buff = Buffer.from(req.body.data, 'base64');
            logger.debug("buff = " + buff);
            let lopy_req = buff.toString('ascii');
            logger.debug("lopy_req = " + lopy_req);
            const lopy_req_json = JSON.parse(lopy_req);

            if(typeof lopy_req_json.esp_subscribed === 'undefined' || typeof lopy_req_json.esp_not_sync === 'undefined') {
                logger.debug("Bad parameters");
                res.status(400).send("Bad parameters");
            }
            else {
                // Sync messages if needed
                lopy_req_json.esp_not_sync.forEach(function(esp) {
                    Display.findOneAndUpdate(
                        { espId: { "$in" : esp.espid} },
                        { $set : {"message" : esp.message}}
                    );
                });

                // Then send the response
                let displays = await Display.find({
                    espId: { "$in" : lopy_req_json.esp_subscribed}
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
        }
    } catch (error) {
        console.error(error);
        res.status(400).send("Error while processing");
    }
})

module.exports = router