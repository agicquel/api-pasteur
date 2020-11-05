#!/usr/bin/env node

require('dotenv').config({path:__dirname+'/./../.env'})
const mongoose = require('mongoose');
const commander = require('commander');
var User = require('../app/models/users');

commander
  .usage('[OPTIONS]...')
  .option('-l, --login <login>', 'user login')
  .option('-e, --email <email>', 'user email')
  .option('-p, --password <password>', 'user password')
  .on('--help', function(){
    console.log('')
    console.log('Examples:');
    console.log('  $ createAdmin --login user123 --email user123@mail.com --password pwd123');
    console.log('')
  })
  .parse(process.argv);

if(!commander.login || !commander.email || !commander.password) {
    console.log("Invalid options. Use '--help' for more information.");
    process.exit(1);
}

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

User.create({
    login: commander.login,
    email: commander.email,
    password: commander.password,
    role: "admin" 
}, function(err, result) {
    if (err) {
        console.log(err);
    }
    else {
        console.log(result);
    }
    process.exit(0);
});
