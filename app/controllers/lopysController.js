const mongoose = require('mongoose');
const Lopy = mongoose.model('Lopy');

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
