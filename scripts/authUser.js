#!/usr/bin/env node

require('dotenv').config({path:__dirname+'/./../.env'})
const commander = require('commander');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

commander
  .usage('[OPTIONS]...')
  .option('-l, --login <login>', 'user login')
  .option('-p, --password <password>', 'user password')
  .on('--help', function(){
    console.log('')
    console.log('Examples:');
    console.log('  $ authUser --login user123 --password pwd123');
    console.log('')
  })
  .parse(process.argv);

if(!commander.login || !commander.password) {
    console.log("Invalid options. Use '--help' for more information.");
    process.exit(1);
}

const params = new URLSearchParams();
params.append('login', commander.login);
params.append('password', commander.password);
var requestOptions = {
    method: 'post',
    body:    params
};
fetch("http://localhost:8080/users/authenticate", requestOptions)
    .then(response => response.json())
    .then(result => {
        if(result.status) console.log('\x1b[1m\x1b[36m%s\x1b[32m%s\x1b[0m', "Status = ", result.status);
        if(result.message) console.log('\x1b[1m\x1b[36m%s\x1b[32m%s\x1b[0m', "Message = ", result.message);
        if(result.data && result.data.token) console.log('\x1b[1m\x1b[36m%s\x1b[32m%s\x1b[0m', "Token = ", result.data.token);
        process.exit(0);
    })
    .catch(error => console.log('error', error));
