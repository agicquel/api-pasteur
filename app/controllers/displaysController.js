var mongoose = require('mongoose');
var Display = mongoose.model('Display');

exports.getAll = function(req, res) {
    Display.find({}, function(err, task) {
        if (err)
            res.send(err);
        res.json(task);
    });
};

exports.add = function(req, res) {
    var newDisplay = new Display(req.body);
    newDisplay.save(function(err, task) {
        if (err)
            res.send(err);
        res.json(task);
    });
};

exports.get = function(req, res) {
    Display.findById(req.params.id, function(err, task) {
        if (err)
            res.send(err);
        res.json(task);
    });
};

exports.update = function(req, res) {
    Display.findOneAndUpdate({
        _id: req.params.id
    }, req.body, {
        new: true
    }, function(err, task) {
        if (err)
            res.send(err);
        res.json(task);
    });
};

exports.delete = function(req, res) {
    Display.remove({
        _id: req.params.id
    }, function(err, task) {
        if (err)
            res.send(err);
        res.json({
            message: 'Display successfully deleted'
        });
    });
};