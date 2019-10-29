var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var User = mongoose.model('User');

exports.validateUser = function(req, res, next) {
    jwt.verify(req.headers['x-access-token'], req.app.get('secretKey'), function(err, decoded) {
        if (err) {
            res.json({
                status: "error",
                message: err.message,
                data: null
            });
        } else {
            // add user id to request
            res.locals.userId = decoded.id;
            User.findById(res.locals.userId, function(err, user) {
                if(!err && user && user.role) {
                    res.locals.userRole = user.role;
                }
                next();
            });
        }
    });
};