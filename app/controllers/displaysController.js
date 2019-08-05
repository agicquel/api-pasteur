var mongoose = require('mongoose');
var Display = mongoose.model('Display');

exports.getAll = function(req, res) {
    if(req.body.role == "admin") {
        Display.find({}, function(err, display) {
            if (err)
                res.send(err);
            else
                res.json(display);
        });
    }
    else if(req.body.role == "user") {
        Display.find({owners: {"$in" : req.body.userId}}, function(err, display) {
            if (err)
                res.send(err);
            else
                res.json(display);
        });
    }
};

exports.add = function(req, res) {
    var newDisplay = new Display({name : req.body.name, message: req.body.message, espId : req.body.espId});
    newDisplay.owners.push(req.body.userId);
    newDisplay.save(function(err, display) {
        if (err)
            res.send(err);
        else
            res.json(display);
    });
};

exports.get = function(req, res) {
    Display.findById(req.params.id, function(err, display) {
        if (err)
            res.send(err);
        else {
            if(req.body.role == "admin") {
                res.json(display);
            }
            else if(req.body.role == "user") {
                if(!display.owners || !display.owners.includes(req.body.userId)) {
                    res.send("You do not have permission to access.")
                }
                else
                    res.json(display);
            }
        }
    });
};

exports.update = function(req, res) {
    if(req.body.role == "admin") {
        Display.findOneAndUpdate({
            _id: req.params.id,
        }, req.body, {
            new: true
        }, function(err, display) {
            if (err)
                res.send(err);
            else
                res.json(display);
        });
    }
    else if(req.body.role == "user") {
        Display.findOneAndUpdate({
            _id: req.params.id,
            owners: {"$in" : req.body.userId}
        }, req.body, {
            new: true
        }, function(err, display) {
            if (err)
                res.send(err);
            else
                res.json(display);
        });
    }
};

exports.delete = function(req, res) {
    if(req.body.role == "admin") {
        Display.deleteOne({
            _id: req.params.id,
        }, function(err, display) {
            
            if (err)
                res.send(err);
            else
                res.json({
                    message: 'Display successfully deleted'
                });
        });
    }
    else if(req.body.role == "user") {
        Display.deleteOne({
            _id: req.params.id,
            owners: {"$in" : req.body.userId}
        }, function(err, display) {
            
            if (err)
                res.send(err);
            else
                res.json({
                    message: 'Display successfully deleted'
                });
        });
    }
};