// @flow

import handler from '../labeled';
import fs from 'fs';

const wrongLabelPayload = require('./__fixtures__/other-label-added.json');
const needsInfoPayload = require('./__fixtures__/info-label-added.json');
const beginnerFriendlyPayload = require('./__fixtures__/beginner-friendly-label-added.json');
jest.mock('../../../github');
jest.mock('../../../twitter');

describe('Issue Labeled Handler', () => {
    it('should not add a comment if label !== "Needs Info"', () => {
        handler(wrongLabelPayload);
        const github = require('../../../github');
        expect(github.addIssueComment).toHaveBeenCalledTimes(0);
    });

    it('should add a comment if label === "Needs Info"', () => {
        handler(needsInfoPayload);
        const github = require('../../../github');
        expect(github.addIssueComment).toHaveBeenCalledTimes(1);
    });

    it('should not tweet if label !== "beginner-friendly"', () => {
        handler(wrongLabelPayload);
        const twitter = require('../../../twitter');
        expect(twitter.tweet).toHaveBeenCalledTimes(0);
    });

    it('should tweet if label === "beginner-friendly"', () => {
        handler(beginnerFriendlyPayload);
        const twitter = require('../../../twitter');
        expect(twitter.tweet).toHaveBeenCalledTimes(1);
    });
});
