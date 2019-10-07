const router = require('express').Router();
const auth = require('../controllers/auth');
const glob = require("glob");
const fs = require('fs');
var log4js = require('log4js');
var logger = log4js.getLogger('console');

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

router.get('/console/log', auth.validateUser, async (req, res) => {
    if(req.body.role == "admin") {
        var dir = process.env.DIR_LOG[process.env.DIR_LOG - 1] == '/' ? process.env.DIR_LOG.substr(0, process.env.DIR_LOG.length -1) : process.env.DIR_LOG;
        var filename = dir + "/console.log";
        logger.debug("filename = " + filename);
        fs.readFile(filename, 'utf8', function(err, data) {
            if (err) res.send(err);
            else res.send(data)
          });
    }
    else {
        res.send("You are not authorized to consult the logs.")
    }
});

router.delete('/console/log', auth.validateUser, async (req, res) => {
    if(req.body.role == "admin") {
        var dir = process.env.DIR_LOG[process.env.DIR_LOG - 1] == '/' ? process.env.DIR_LOG.substr(0, process.env.DIR_LOG.length -1) : process.env.DIR_LOG;
        var filename = dir + "/console.log";
        fs.writeFile(filename, '', function(){res.send('Cleared')})
    }
    else {
        res.send("You are not authorized to consult the logs.")
    }
});

module.exports = router