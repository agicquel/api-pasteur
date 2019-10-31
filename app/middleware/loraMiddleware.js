const auth = require('./authUserMiddleware');
const log4js = require('log4js');
const logger = log4js.getLogger('console');
const util = require('util');
const mongoose = require('mongoose');
const Lopy = mongoose.model('Lopy');
const LopyStatus = mongoose.model('LopyStatus');
const DataRate = mongoose.model('DataRate');
const Gateway = mongoose.model('Gateway');

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

                // save Lopy status
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

                    req.body.gateways.forEach(g => {
                        status.gateways.push(new Gateway({
                            mac: g.mac,
                            time: g.time,
                            timestamp: g.timestamp,
                            frequency: g.frequency,
                            channel: g.channel,
                            rfChain: g.rfChain,
                            crcStatus: g.crcStatus,
                            codeRate: g.codeRate,
                            rssi: g.rssi,
                            loRaSNR: g.loRaSNR,
                            size: g.size,
                            dataRate: new DataRate(g.dataRate)
                        }));
                    });

                    lopy.status.push(status);

                    // Keep only the 100st status
                    while(lopy.status.length > 100) {
                        lopy.status.shift();
                    }

                    lopy.save(function (err, savedLopy) {
                        if (err) {
                            logger.debug("failed to save lopy : " + err);
                            res.send(err);
                        }
                        else {
                            res.locals.lopy = savedLopy;
                            let buff = Buffer.from(req.body.data, 'base64');
                            let data_buff = buff.toString('ascii');
                            res.locals.parsedData = JSON.parse(data_buff);
                            next();
                        }
                    });
                });
            }
        }
        catch (error) {
            logger.debug(error);
            res.status(400).send("Error while processing");
        }
    });
};


