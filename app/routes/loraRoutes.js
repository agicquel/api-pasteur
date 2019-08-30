const router = require('express').Router();
var mongoose = require('mongoose');
var Display = mongoose.model('Display');
const auth = require('../controllers/auth');

router.post('/', auth.validateUser, async (req, res) => {

    try {
        if (!req && !req.body.data) {
            console.log("Request missing");
            res.status(400).send("Request missing");
        } else if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
            console.log("Request empty");
            res.status(400).send("Request empty");
        } else {
            console.log("req = " + req.body.data)
            let buff = Buffer.from(req.body.data, 'base64');
            console.log("buff = " + buff);
            let lopy_req = buff.toString('ascii');
            console.log("lopy_req = " + lopy_req);
            const lopy_req_json = JSON.parse(lopy_req);

            if(typeof lopy_req_json.esp_subscribed === 'undefined' || typeof lopy_req_json.esp_not_sync === 'undefined') {
                console.log("Bad parameters");
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
                
                console.log("date = " + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''))
                console.log("req.body : ");
                console.log(req.body);
                
                var responseStruct = {
                    'fPort': fport,
                    'data': new Buffer(JSON.stringify(response)).toString("base64"),
                    'devEUI': devEUI
                };
    
                console.log(responseStruct)
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