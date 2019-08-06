require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const port = process.env.PORT || 1337;
const mongoose = require('mongoose');
const path = require('path')
const rfs = require('rotating-file-stream')


// jwt secret token
app.set('secretKey', process.env.JWT_KEY || 'nodeRestApi');

// load models
var Display = require('./app/models/displays');
var User = require('./app/models/users');

// connection to mongodb server
mongoose.Promise = global.Promise;
if(!process.env.MONGO_USERNAME || !process.env.MONGO_PASSWORD || (process.env.MONGO_USERNAME = "" && process.env.MONGO_PASSWORD=="")) {
    mongoose.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DATABASE, {
        useNewUrlParser: true
    });
}
else {
    mongoose.connect('mongodb://' + process.env.MONGO_USERNAME + ':' + process.env.MONGO_PASSWORD + '@' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DATABASE , {
        useNewUrlParser: true
    });
}

// create a rotating write stream
function pad(num) {
    return (num > 9 ? "" : "0") + num;
}
var accessLogStream = rfs(function(time, index) {
    if (!time) return "access.log";
    var year = time.getFullYear();
    var month = pad(time.getMonth() + 1);
    var day = pad(time.getDate());
    return year + month + day + "-" + index + ".log";
}, {
    interval: '1d', // rotate daily
    immutable: true,
    path: path.join(__dirname, process.env.DIR_LOG)
});

//import routes
var displaysRoute = require('./app/routes/displaysRoutes');
var usersRoute = require('./app/routes/usersRoutes');
var loraRoute = require('./app/routes/loraRoutes');
var logsRoute = require('./app/routes/logsRoutes');

// load configs and routes
app.use(morgan('combined', { stream: accessLogStream }))
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(usersRoute);
app.use(displaysRoute);
app.use(loraRoute);
app.use(logsRoute);

app.listen(port, () => {
    console.log(`API server started on port : ${port}`);
});
