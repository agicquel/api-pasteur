var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var Lopy = mongoose.model('Lopy');
var LopyStatus = mongoose.model('LopyStatus');
var User = mongoose.model('User');


exports.getAll = function(req, res) {
    Lopy.find({}, function(err, lopys) {
        if (err)
            res.send(err);
        else
            res.json(lopys);
    });
};

exports.get = function(req, res) {
    Lopy.findOne({mac: req.params.mac}, function(err, lopy) {
        if (err)
            res.send(err);
        else {
            res.json(lopy);
        }
    });
};

exports.delete = function(req, res) {
    if(res.locals.userRole == "admin") {
        Lopy.deleteOne({
            mac: req.params.mac,
        }, function(err, lopy) {
            if (err) {
                res.send(err);
            }
            else {
                res.json({
                    message: 'Lopy successfully deleted'
                });
            }
        });
    }
    else if(res.locals.userRole == "user") {
        res.send("You do not have permission to access.");
    }
};