// @flow

import crypto from 'crypto';
import timingSafeEqual from 'timing-safe-equal';
import Logger from './logger';

const { log } = new Logger('auth.js');

exports.isValid = (rawBody: string, signature: string, secret: string): bool => {
    const newSignature = crypto
        .createHmac('sha1', secret)
        .update(new Buffer(rawBody, 'utf-8'))
        .digest('hex');

    log(`Received sha was ${signature}, new sha is ${newSignature}`, 'verbose');

    return timingSafeEqual(
        // Note: Should change to `Buffer.from` when AWS Lambda supports node >= 6
        new Buffer(signature),
        new Buffer(`sha1=${newSignature}`)
    );
};
