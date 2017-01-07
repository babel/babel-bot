// @flow

const crypto = require('crypto');
const timingSafeEqual = require('timing-safe-equal');

exports.isValid = (rawBody: string, signature: string, secret: string): bool => {
    const newSignature = crypto
        .createHmac('sha1', secret)
        .update(rawBody)
        .digest('hex');

    return timingSafeEqual(
        // Note: Should change to `Buffer.from` when AWS Lambda supports node >= 6
        new Buffer(signature),
        new Buffer(`sha1=${newSignature}`)
    );
};
