#!/usr/bin/env node

require('dotenv').config({path:__dirname+'/./../.env'})
const commander = require('commander');
var request = require("request");

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
var options = { method: 'POST',
  url: 'http://localhost/users/authenticate',
  headers: 
   { 'cache-control': 'no-cache',
     Connection: 'keep-alive',
     'Accept-Encoding': 'gzip, deflate',
     Host: 'localhost:' + process.env.PORT,
     'Cache-Control': 'no-cache',
     Accept: '*/*',
     'Content-Type': 'application/x-www-form-urlencoded' },
  form: { login: commander.login, password: commander.password } };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  var res = JSON.parse(body);
  if(res.status) console.log('\x1b[1m\x1b[36m%s\x1b[32m%s\x1b[0m', "Status = ", res.status);
  if(res.message) console.log('\x1b[1m\x1b[36m%s\x1b[32m%s\x1b[0m', "Message = ", res.message);
  if(res.data && res.data.token) console.log('\x1b[1m\x1b[36m%s\x1b[32m%s\x1b[0m', "Token = ", res.data.token);
  process.exit(0);
});
