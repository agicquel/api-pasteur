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

exports.getAll = function(req, res) {
    if(res.locals.userRole == "admin") {
        User.find({}, function(err, user) {
            if (err)
                res.send(err);
            else
                res.json(user);
        });
    }
    else {
        res.send("You are not adminstrator.");
    }
};

exports.get = function(req, res) {
    if(res.locals.userRole == "admin" || res.locals.userId == req.params.id) {
        User.findById(req.params.id, function(err, user) {
            if (err)
                res.send(err);
            else {  
                res.json(user);
            }
        });
    }
    else {
        res.send("You do not have permission to access.")
    }
};

exports.update = function(req, res) {
    if(res.locals.userRole == "admin" || res.locals.userId == req.params.id) {
        User.findOneAndUpdate({
            _id: req.params.id,
        }, req.body, {
            new: true
        }, function(err, user) {
            if (err)
                res.send(err);
            else
                res.json(user);
        });
    }
    else {
        res.send("You do not have permission to access.")
    }
};

exports.delete = function(req, res) {
    if(res.locals.userRole == "admin" || res.locals.userId == req.params.id) {
        User.deleteOne({
            _id: req.params.id,
        }, function(err, user) {
            if (err)
                res.send(err);
            else
                res.json({
                    message: 'User successfully deleted'
                });
        });
    }
    else {
        res.send("You do not have permission to access.")
    }
};