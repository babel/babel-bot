module.exports = {
    "extends": "babel",
    "plugins": [
        "jest",
        "jasmine",
    ],
    "rules": {
        "indent": ["error", 4],
        "quotes": ["error", "single"],
        "max-len": "off",
    },
    "env": {
        "node": true,
        "jest": true,
        "jasmine": true,
    },
};
