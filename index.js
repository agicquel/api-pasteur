require('dotenv').config();
const express = require('express');
const app = express();
const logger = require('morgan');
const bodyParser = require('body-parser');
const port = process.env.PORT || 1337;
const mongoose = require('mongoose');

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


//import routes
var displaysRoute = require('./app/routes/displaysRoutes');
var usersRoute = require('./app/routes/usersRoutes');
var loraRoute = require('./app/routes/loraRoutes');

// load configs and routes
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(usersRoute);
app.use(displaysRoute);
app.use(loraRoute);

app.listen(port, () => {
    console.log(`API server started on port : ${port}`);
});
