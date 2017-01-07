// @flow

import handler from '../labeled';
import fs from 'fs';

const wrongLabelPayload = require('./__fixtures__/other-label-added.json');
const needsInfoPayload = require('./__fixtures__/info-label-added.json');
jest.mock('../../../github');

describe('Issue Opened Handler', () => {
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
});
