const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.create = function(req, res, next) {
    let reqData = {
        login: req.body.login,
        email: req.body.email,
        password: req.body.password
    };

    if(res.locals.userRole === "admin" && req.body.role !== undefined) {
        reqData.role = req.body.role;
    }

    User.create(reqData, function(err, result) {
        if (err) {
            res.status(405).send("Invalid input.");
        } else {
            res.status(200).json({
                status: "success",
                message: "User successfully created.",
                data: result
            });
        }
    });
};

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
                res.status(200).json({
                    status: "success",
                    message: "user found",
                    data: {
                        user: userInfo,
                        token: token
                    }
                });
            } else {
                res.status(400).json({
                    status: "error",
                    message: "Invalid login",
                    data: null
                });
            }
        }
    });
};

exports.getAll = function(req, res) {
    if(res.locals.userRole === "admin") {
        User.find({}, function(err, users) {
            if (err) {
                res.status(400).send(err);
            }
            else {
                res.status(200).json(users);
            }
        });
    }
    else {
        res.status(403).send("You are not administrator.");
    }
};

exports.get = function(req, res) {
    if(res.locals.userRole === "admin" || res.locals.userId === req.params.id) {
        User.findById(req.params.id, function(err, user) {
            if (err) {
                res.status(400).send(err);
            }
            else if(user == null) {
                res.status(404).send("User not found");
            }
            else {
                res.status(200).json(user);
            }
        });
    }
    else {
        res.status(403).send("You do not have permission to access.")
    }
};

exports.update = function(req, res) {
    if(res.locals.userRole === "admin" || res.locals.userId === req.params.id) {
        User.findOneAndUpdate({
            _id: req.params.id,
        }, req.body, {
            new: true
        }, function(err, user) {
            if (err) {
                res.status(405).send(err);
            }
            else if(user === null) {
                res.status(404).send("User not found");
            }
            else {
                res.status(200).json(user);
            }
        });
    }
    else {
        res.status(403).send("You do not have permission to access.")
    }
};

exports.delete = function(req, res) {
    if(res.locals.userRole === "admin" || res.locals.userId === req.params.id) {
        User.deleteOne({
            _id: req.params.id,
        }, function(err, doc) {
            if (err || doc.ok !== 1) {
                res.status(400).send("Invalid ID supplied");
            }
            else if(doc.deletedCount === 0) {
                res.status(404).send("User not found");
            }
            else {
                res.status(200).send("User deleted");
            }
        });
    }
    else {
        res.status(403).send("You do not have permission to access.")
    }
};
