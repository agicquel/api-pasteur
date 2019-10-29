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
        Display.find({owners: {"$in" : res.locals.userId}}, function(err, display) {
            if (err)
                res.send(err);
            else
                res.json(display);
        });
    }
};

exports.add = function(req, res) {
    var newDisplay = new Display({name : req.body.name, message: req.body.message, espId : req.body.espId});
    newDisplay.owners.push(res.locals.userId);
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
                if(!display.owners || !display.owners.includes(res.locals.userId)) {
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
            owners: {"$in" : res.locals.userId}
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
            owners: {"$in" : res.locals.userId}
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

exports.addOwner = function(req, res) {
    if(!req.body.ownerId || !mongoose.Types.ObjectId.isValid(req.body.ownerId)) {
        res.send("Bad owner id.");
    }
    else {
        Display.findById(req.params.id, function(err, display) {
            if (err)
                res.send(err);
            else {
                if(req.body.role == "user" && (!display.owners || !display.owners.includes(res.locals.userId))) {
                    res.send("You do not have permission to access.");
                }
                else {
                    if(!display.owners) {
                        display.owners = [];
                    }
                    if (display.owners.indexOf(req.body.ownerId) === -1){
                        display.owners.push(req.body.ownerId);
                    }
                    display.save();
                    res.send("Owner added.");
                }
            }
        });
    }
};

exports.deleteOwner = function(req, res) {
    if(!req.body.ownerId || !mongoose.Types.ObjectId.isValid(req.body.ownerId)) {
        res.send("Bad owner id.");
    }
    else {
        Display.findById(req.params.id, function(err, display) {
            if (err)
                res.send(err);
            else {
                if(req.body.role == "user" && (!display.owners || !display.owners.includes(res.locals.userId))) {
                    res.send("You do not have permission to access.");
                }
                else {
                    if(!display.owners) {
                        display.owners = [];
                    }
                    var index = display.owners.indexOf(req.body.ownerId);
                    if (index !== -1){
                        display.owners.splice(index, 1);
                    }
                    display.save();
                    res.send("Owner deleted.");
                }
            }
        });
    }
};

exports.declare = function(req, res) {
    Display.findOne({ espId: { "$in" : req.params.espid} }, function(err, display) {
        if (err || !display) {
            var newDisplay = new Display({name : 'ESP-' + req.params.espid, espId : req.params.espid});
            newDisplay.owners.push(res.locals.userId);
            newDisplay.save(function(err, display) {
                if (err)
                    res.send(err);
                else
                    res.json(display);
            });
        }
        else {
            if(!display.owners) {
                display.owners = [];
            }
            if (display.owners.indexOf(res.locals.userId) === -1){
                display.owners.push(res.locals.userId);
            }
            display.save(function(err, display) {
                if (err)
                    res.send(err);
                else
                    res.json(display);
            });
        }
    });
};