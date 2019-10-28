const auth = require('./auth');
const log4js = require('log4js');
const logger = log4js.getLogger('console');
const util = require('util');

exports.loraValidate = function(req, res, next) {
    auth.validateUser(req, res, function() {
        try {
            if (!req || !'body' in req) {
                logger.debug("Request missing");
                res.status(400).send("Request missing");
            } else if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
                logger.debug("Request empty");
                res.status(400).send("Request empty");
            } else if (!req.body.data) {
                logger.debug("Data missing");
                res.status(400).send("Data missing");
            } else {
                logger.debug("req = " + util.inspect(req.body, {showHidden: false, depth: null}));
        
                logger.debug("req data = " + req.body.data);
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
                    delete(req.body.parsedData);
                    req.body.parsedData = lopy_req_json;
                    logger.debug("parsedData before = " + util.inspect(req.data.parsedData, {showHidden: false, depth: null}));

                    next();
                }
            }
        }
        catch (error) {
            logger.debug(error);
            res.status(400).send("Error while processing");
        }
    });
};


