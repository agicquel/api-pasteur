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
const optionMongo = {
    user: process.env.MONGO_USERNAME,
    pass: process.env.MONGO_PASSWORD,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
};
const urlMongo = 'mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DATABASE + "?authSource=admin"

const connectWithRetry = function() {
    return mongoose.connect(urlMongo , optionMongo, function(err) {
        if (err) {
            console.error('Failed to connect to mongo on startup - retrying in 1 sec', err);
            setTimeout(connectWithRetry, 1000);
        }
    });
};
connectWithRetry();

// create a rotating write stream
function pad(num) {
    return (num > 9 ? "" : "0") + num;
}

let accessLogStream = rfs.createStream(function (time, index) {
    if (!time) return "access.log";
    const year = time.getFullYear();
    const month = pad(time.getMonth() + 1);
    const day = pad(time.getDate());
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

let logger = log4js.getLogger('console');

//import routes
let displaysRoute = require('./app/routes/displaysRoutes');
let usersRoute = require('./app/routes/usersRoutes');
let loraRoute = require('./app/routes/loraRoutes');
let lopysRoute = require('./app/routes/lopysRoutes');
let logsRoute = require('./app/routes/logsRoutes');

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
    logger.debug(`API server started on port : ${port}`);
});
