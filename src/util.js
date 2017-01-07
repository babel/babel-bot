// @flow

const parseDiff = require('parse-diff');

const flatten = arr => [].concat.apply([], arr);

exports.packagesFromDiff = (diff: string) => {
    const parsedDiff = parseDiff(diff);
    const filesList = flatten(parsedDiff.map(piece => [piece.from, piece.to]));

    return filesList.reduce((acc, file) => {
        const results = file.match(/packages\/([a-zA-Z0-9-.]+)\//) || [];
        if (results.length === 2) {
            acc.add(results[1]);
        }
        return acc;
    }, new Set());
};
