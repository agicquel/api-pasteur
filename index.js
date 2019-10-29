require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const port = process.env.PORT || 1337;
const mongoose = require('mongoose');
const path = require('path');
const rfs = require('rotating-file-stream');
const log4js = require('log4js');


// jwt secret token
app.set('secretKey', process.env.JWT_KEY || 'nodeRestApi');

// load models
require('./app/models/displaymodifications');
require('./app/models/displays');
require('./app/models/users');
require('./app/models/datarates');
require('./app/models/gateways');
require('./app/models/lopystatus');
require('./app/models/lopys');

// connection to mongodb server
mongoose.Promise = global.Promise;
if(!process.env.MONGO_USERNAME || !process.env.MONGO_PASSWORD || (process.env.MONGO_USERNAME = "" && process.env.MONGO_PASSWORD=="")) {
    mongoose.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DATABASE, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    });
}
else {
    mongoose.connect('mongodb://' + process.env.MONGO_USERNAME + ':' + process.env.MONGO_PASSWORD + '@' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DATABASE , {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
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

log4js.configure({
    appenders: { console: { type: 'file', filename: 'logs/console.log' } },
    categories: { default: { appenders: ['console'], level: 'all' } }
  });

var logger = log4js.getLogger('console');
logger.debug("testtesttest");

//import routes
var displaysRoute = require('./app/routes/displaysRoutes');
var usersRoute = require('./app/routes/usersRoutes');
var loraRoute = require('./app/routes/loraRoutes');
var lopysRoute = require('./app/routes/lopysRoutes');
var logsRoute = require('./app/routes/logsRoutes');

// load configs and routes
app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(usersRoute);
app.use(displaysRoute);
app.use(loraRoute);
app.use(lopysRoute);
app.use(logsRoute);

app.listen(port, () => {
    console.log(`API server started on port : ${port}`);
    logger.debug("ze parti");
});
