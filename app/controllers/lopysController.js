var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var Lopy = mongoose.model('Lopy');
var LopyStatus = mongoose.model('LopyStatus');

exports.addStatus = function(req, res) {
    User.create({
        login: req.body.login,
        email: req.body.email,
        password: req.body.password
    }, function(err, result) {
        if (err) {
            next(err);
        } else {
            res.json({
                status: "success",
                message: "User successfully created.",
                data: result
            });
        }
    });
}
