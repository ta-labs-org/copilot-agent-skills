#!/usr/bin/env node
const path = require('path');
const { runCli } = require(path.join('..', 'src', 'cli'));

// pass process.argv and default streams
runCli(process.argv.slice(2), { stdin: process.stdin, stdout: process.stdout }).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
