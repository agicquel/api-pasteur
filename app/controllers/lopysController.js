const mongoose = require('mongoose');
const Lopy = mongoose.model('Lopy');

exports.getAll = function(req, res) {
    Lopy.find({}, function(err, lopys) {
        if (err) {
            res.status(400).send(err);
        }
        else {
            res.status(200).json(lopys);
        }
    });
};

exports.get = function(req, res) {
    Lopy.findOne({mac: req.params.mac}, function(err, lopy) {
        if (err) {
            res.status(400).send(err);
        }
        else if(lopy == null) {
            res.status(404).send("Lopy not found");
        }
        else {
            res.status(200).json(lopy);
        }
    });
};

exports.delete = function(req, res) {
    if(res.locals.userRole === "admin") {
        Lopy.deleteOne({
            mac: req.params.mac,
        }, function(err, doc) {
            if (err || doc.ok !== 1) {
                res.status(400).send("Invalid ID supplied");
            }
            else if(doc.deletedCount === 0) {
                res.status(404).send("Lopy not found");
            }
            else {
                res.status(200).send("Lopy deleted");
            }
        });
    }
    else if(res.locals.userRole === "user") {
        res.status(403).send("You do not have permission to access.");
    }
};
