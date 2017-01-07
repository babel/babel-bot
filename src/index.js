// @flow

const got = require('got');
const github = require('./github');
import messages from './messages';
import util from './util';
import auth from './auth';
import Logger from './logger';

type InputType = {
    signature: string;
    data: { action: string };
    type: string;
};

type LambdaCB = (err: any, success: any) => void;

const { log } = new Logger('index.js');

exports.handler = ({ signature, data, type }: InputType, context: Object, callback: LambdaCB) => {
    log('Validating auth', 'verbose');
    const isAuthValid = auth.isValid(
        JSON.stringify(data),
        signature,
        process.env.GITHUB_SECRET || ''
    );

    if (!isAuthValid) {
        log('Auth Invalid', 'verbose');
        return callback(new Error('Invalid Auth'));
    }

    log('Auth Valid', 'verbose');
    const possibleHandlerPath = `./handlers/${type}/${data.action}`;
    let handler;

    try {
        // $FlowIgnore: Dynamic requires FTW
        handler = require(possibleHandlerPath);
    } catch (e) {
        log(`**No matching handler found for ${type}:${data.action}**`, 'verbose');
        log(`**Tried looking in ${possibleHandlerPath}**`, 'verbose');
        return;
    }

    console.log(`**Invoking handler for ${type}:${data.action}**`, 'verbose');
    handler.default ? handler.default(data) : handler(data);
};
