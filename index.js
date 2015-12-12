'use strict';

var cluster = require('cluster');
var chalk = require('chalk');
var os = require('os');

var CPUsNum = os.cpus().length;


if (cluster.isMaster) {
  console.log('Number of CPU cores', chalk.blue(CPUsNum));
  console.log('starting', chalk.green('master'));
  for (var i = 0; i < CPUsNum; i += 1) {
    cluster.fork();
  }

} else {
  console.log('starting', chalk.blue('child'));
  require('babel-core/register');
  require('./app');
}
