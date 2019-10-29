var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var Lopy = mongoose.model('Lopy');
var LopyStatus = mongoose.model('LopyStatus');
var User = mongoose.model('User');


exports.getAll = function(req, res) {
    if(res.locals.userRole == "admin") {
        Lopy.find({}, function(err, lopys) {
            if (err)
                res.send(err);
            else
                res.json(lopys);
        });
    }
    else if(res.locals.userRole == "user") {
        res.send("You do not have permission to access.");
    }
};