// @flow

const got = require('got');
const github = require('./github');
const messages = require('./messages');
const util = require('./util');
const auth = require('./auth');

export type Payload = {
    action: string;
};

export type InputType = {
    signature: string;
    data: Payload;
    type: string;
};

type LambdaCB = (err: any, success: any) => void;

exports.handler = ({ signature, data, type }: InputType, context: Object, callback: LambdaCB) => {
    const isAuthValid = auth.isValid(
        JSON.stringify(data),
        signature,
        process.env.GITHUB_SECRET || ''
    );

    if (!isAuthValid) {
        return callback(new Error('Invalid Auth'));
    }

    const possibleHandlerPath = `./handlers/${type}/${data.action}`;
    let handler;

    try {
        // $FlowFixMe: Dynamic requires FTW
        handler = require(possibleHandlerPath);
    } catch (e) {
        console.log(`**No matching handler found for ${type}:${data.action}**`);
        console.log(`**Tried looking in ${possibleHandlerPath}**`);
        return;
    }

    console.log(`**Invoking handler for ${type}:${data.action}**`);
    handler.default ? handler.default(data) : handler(data);
};
