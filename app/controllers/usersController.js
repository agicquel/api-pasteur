var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var User = mongoose.model('User');

exports.create = function(req, res, next) {
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

exports.authenticate = function(req, res, next) {
    User.findOne({
        login: req.body.login
    }, function(err, userInfo) {
        if (err) {
            next(err);
        } else {
            if (userInfo && bcrypt.compareSync(req.body.password, userInfo.password)) {
                const token = jwt.sign({
                    id: userInfo._id
                }, req.app.get('secretKey'), {
                    /*expiresIn: '1h'*/ });
                res.json({
                    status: "success",
                    message: "user found",
                    data: {
                        user: userInfo,
                        token: token
                    }
                });
            } else {
                res.json({
                    status: "error",
                    message: "Invalid login",
                    data: null
                });
            }
        }
    });
}
