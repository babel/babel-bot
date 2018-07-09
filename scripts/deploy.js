#!/usr/bin/env node

const fs = require('fs');

const AWS = require('aws-sdk');
AWS.config.update({region: process.env.AWS_REGION || 'us-east-1'});

let file;
try {
  file = fs.readFileSync(__dirname + '/../function.zip');
} catch (err) {
  console.error('Could not read function.zip! ' + err.message + '. Please ensure that you have built babel-bot.');
  process.exit(1);
}

console.log('Deploying...');
const lambda = new AWS.Lambda({apiVersion: '2015-03-31'});
lambda.updateFunctionCode({
  FunctionName: 'babel-function',
  Publish: true,
  ZipFile: file,
}, function(err, data) {
  if (err) {
    console.error('Could not update: ' + err.message);
    process.exit(1);
  } else {
    console.log('Successfully updated!');
  }
});
