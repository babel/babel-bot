const fs = require('fs');
const path = require('path');
const util = require('../util');
const diff = fs.readFileSync(path.join(__dirname, '__fixtures__/diff.txt'), 'UTF-8');

const setsAreEqual = (setA, setB) => {
    const pred = val => setB.has(val);
    return Array.from(setA).every(pred);
};

describe('packagesFromDiff', () => {
    it('should return list of package names from diff', () => {
        const packages = util.packagesFromDiff(diff);
        const expectedPackages = new Set([
            'babel-types',
            'babel-plugin-transform-es2015-function-name'
        ]);

        expect(setsAreEqual(packages, expectedPackages)).toBe(true);
    });
});
