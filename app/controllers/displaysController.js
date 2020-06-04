const mongoose = require('mongoose');
const Display = mongoose.model('Display');
const DisplayModification = mongoose.model('DisplayModification');

exports.getAll = function(req, res) {
    let findOption = {};
    if(res.locals.userRole === "user") {
        findOption.owners = {"$in" : res.locals.userId};
    }

    Display.find(findOption, function(err, displays) {
        if (err) {
            res.status(400).send(err);
        }
        else {
            res.status(200).json(displays);
        }
    });
};

exports.add = function(req, res) {
    let newDisplay = new Display({name : req.body.name, message: req.body.message, espId : req.body.espId});
    newDisplay.owners.push(res.locals.userId);
    let modHist = new DisplayModification({
        modifierId:res.locals.userId,
        modifierType:res.locals.userRole,
        message:newDisplay.message,
        user:res.locals.userLogin
    });
    newDisplay.history.push(modHist);
    newDisplay.save(function (err, display) {
        if (err) {
            res.status(405).send("Invalid input.");
        } else {
            res.status(200).json(display);
        }
    });
};

exports.get = function(req, res) {
    Display.findById(req.params.id, function(err, display) {
        if (err) {
            res.status(400).send(err);
        }
        else if(display == null) {
            res.status(404).send("Display not found");
        }
        else {
            if(res.locals.userRole === "admin") {
                res.status(200).json(display);
            }
            else if(res.locals.userRole === "user") {
                if(!display.owners || !display.owners.includes(res.locals.userId)) {
                    res.status(403).send("You do not have permission to access.")
                }
                else {
                    res.status(200).json(display);
                }
            }
        }
    });
};

exports.update = function(req, res) {
    let findOption = {_id: req.params.id};
    if(res.locals.userRole === "user") {
        findOption.owners = {"$in" : res.locals.userId};
    }

    Display.findOneAndUpdate(findOption, {
        $set: {
            name: req.body.name,
            message: req.body.message,
            espId: req.body.espId,
            lopyMessageSync: false,
            lopyMessageSendCounter: 0
        },
        $push: {
            history: new DisplayModification({
                modifierId: res.locals.userId,
                modifierType: res.locals.userRole,
                message:req.body.message,
                user:res.locals.userLogin
            })
        }
    }, {
        new: true
    }, function (err, display) {
        if (err) {
            res.status(405).send(err);
        }
        else if(display === null) {
            res.status(404).send("Display not found");
        }
        else {
            res.status(200).json(display);
        }
    });
}

exports.delete = function(req, res) {
    let findOption = {_id: req.params.id};
    if(res.locals.userRole === "user") {
        findOption.owners = {"$in" : res.locals.userId};
    }

    Display.deleteOne(findOption, function(err, doc) {
        if (err || doc.ok !== 1) {
            res.status(400).send("Invalid ID supplied");
        }
        else if(doc.deletedCount === 0) {
            res.status(404).send("Display not found");
        }
        else {
            res.status(200).send("Display deleted");
        }
    });
};

exports.addOwner = function(req, res) {
    if(!req.body.ownerId || !mongoose.Types.ObjectId.isValid(req.body.ownerId)) {
        res.status(400).send("Invalid owner ID supplied.");
    }
    else {
        Display.findById(req.params.id, function(err, display) {
            if (err) {
                res.status(405).send(err);
            }
            else if(res.locals.userRole === "user" && (!display.owners || !display.owners.includes(res.locals.userId))) {
                res.status(403).send("You do not have permission to access.");
            }
            else {
                if(!display.owners) {
                    display.owners = [];
                }
                if (display.owners.indexOf(req.body.ownerId) === -1){
                    display.owners.push(req.body.ownerId);
                }
                display.save();
                res.status(200).send("Owner added.");
            }
        });
    }
};

exports.deleteOwner = function(req, res) {
    if(!req.body.ownerId || !mongoose.Types.ObjectId.isValid(req.body.ownerId)) {
        res.status(400).send("Invalid owner ID supplied.");
    }
    else {
        Display.findById(req.params.id, function(err, display) {
            if (err) {
                res.status(405).send(err);
            }
            else if(res.locals.userRole === "user" && (!display.owners || !display.owners.includes(res.locals.userId))) {
                res.status(403).send("You do not have permission to access.");
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
                res.status(200).send("Owner deleted.");
            }
        });
    }
};

exports.declare = function(req, res) {
    const saveCallback = function(err, display) {
        if (err) {
            res.status(400).send(err);
        }
        else {
            res.status(200).json(display);
        }
    };

    Display.findOne({ espId: { "$in" : req.params.espid} }, function(err, display) {
        if (err || !display) {
            var newDisplay = new Display({name : 'ESP-' + req.params.espid, espId : req.params.espid});
            newDisplay.owners.push(res.locals.userId);
            newDisplay.history.push(new DisplayModification({
                modifierId:res.locals.userId,
                modifierType:res.locals.userRole,
                message:newDisplay.message,
                user:res.locals.userLogin
            }));
            newDisplay.save(saveCallback);
        }
        else {
            if(!display.owners) {
                display.owners = [];
            }
            if (display.owners.indexOf(res.locals.userId) === -1){
                display.owners.push(res.locals.userId);
            }
            display.save(saveCallback);
        }
    });
};
