const auth = require('./authUserMiddleware');
const log4js = require('log4js');
const logger = log4js.getLogger('console');
const util = require('util');

exports.loraValidate = function(req, res, next) {
    auth.validateUser(req, res, function() {
        try {
            if (!req || !'body' in req) {
                res.status(400).send("Request missing");
            } else if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
                res.status(400).send("Request empty");
            } else if (!req.body.data) {
                res.status(400).send("Data missing");
            } else {
                logger.debug("req = " + util.inspect(req.body, {showHidden: false, depth: null}));

                let buff = Buffer.from(req.body.data, 'base64');
                let lopy_req = buff.toString('ascii');
                const lopy_req_json = JSON.parse(lopy_req);

                if(typeof lopy_req_json.esp_subscribed === 'undefined' || typeof lopy_req_json.esp_not_sync === 'undefined') {
                    res.status(400).send("Bad parameters");
                }
                else {
                    res.locals.parsedData = lopy_req_json;
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


