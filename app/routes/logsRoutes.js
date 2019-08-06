const router = require('express').Router();
const auth = require('../controllers/auth');
const glob = require("glob");
const fs = require('fs');

router.get('/logs/:date', auth.validateUser, async (req, res) => {
    if(req.body.role == "admin") {
        var dir = process.env.DIR_LOG[process.env.DIR_LOG - 1] == '/' ? process.env.DIR_LOG.substr(0, process.env.DIR_LOG.length -1) : process.env.DIR_LOG;
        glob("**/" + dir + "/" + req.params.date + "-*.log", function (er, files) {
            var log = "";
            files.forEach(function(file) {
                log += fs.readFileSync(file, 'utf8');
            });
            res.send(log);
        });
    }
    else {
        res.send("You are not authorized to consult the logs.")
    }
});

module.exports = router