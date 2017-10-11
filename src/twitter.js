// @flow

import Twitter from 'twitter';

const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

exports.tweet = (msg: string) => {
    return client.post('statuses/update', { status: msg }).then((tweet) =>  tweet);
}
