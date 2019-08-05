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