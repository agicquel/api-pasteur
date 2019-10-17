var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
const auth = require('./auth');

exports.loraValidate = function(req, res, next) {
    auth.validateUser(req, res, function(req, res, next) {
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
                    req.body.data.parsedData = lopy_req_json;
                    next();
                }
            }
        }
        catch (error) {
            console.error(error);
            res.status(400).send("Error while processing");
        }
    });
}

