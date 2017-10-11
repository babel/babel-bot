// @flow

import auth from './auth';
import Logger from './logger';

export type InputType = {
    signature: string;
    data: {
        action?: string;
        state?: string;
    };
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
        return callback(new Error('Invalid Auth'));
    }

    log('Auth Valid', 'verbose');
    const event = data.action || data.state || 'UNKNOWN';
    const possibleHandlerPath = `./handlers/${type}/${event}`;
    let handler;

    try {
        handler = require(possibleHandlerPath);
    } catch (e) {
        log(`**No matching handler found for ${type}:${event}**`, 'verbose');
        log(`**Tried looking in ${possibleHandlerPath}**`, 'verbose');
        return;
    }

    log(`**Invoking handler for ${type}:${event}**`);
    // Support module.exports or transpiled `export default`
    handler.default ? handler.default(data) : handler(data);
};
