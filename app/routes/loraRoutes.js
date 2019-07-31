const router = require('express').Router()
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
            let esp_sub = buff.toString('ascii');
            console.log("esp_sub = " + esp_sub);
            const esp_sub_json = JSON.parse(esp_sub);

            let displays = await Display.find({
                espId: { "$in" : esp_sub_json.esp_subscribed}
            })

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
            })

            var devEUI = req.body.devEUI;
            var fport = req.body.fPort;
            var responseStruct = {
                'fPort': fport,
                'data': new Buffer(JSON.stringify(response)).toString("base64"),
                'devEUI': devEUI
            };

            console.log(responseStruct)
            res.end(JSON.stringify(responseStruct));
            res.end();
        }
    } catch (error) {
        console.error(error);
        res.status(400).send("Error while processing");
    }
})

module.exports = router