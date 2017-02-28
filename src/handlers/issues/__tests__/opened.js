// @flow

import handler from '../opened';
import fs from 'fs';

const payload = require('./__fixtures__/new-issue-opened.json');
jest.mock('../../../github', () => ({
    getUserOrgs: jest.fn(() => Promise.resolve([])),
    addIssueComment: jest.fn(() => Promise.resolve())
}));

describe('Issue Opened Handler', () => {
    it('Should add a new comment when an issue is opened', async () => {
        await handler(payload);
        const github = require('../../../github');

        expect(github.addIssueComment).toHaveBeenCalledTimes(1);
    });

    it('should use correct username', async () => {
        await handler(payload);
        const github = require('../../../github');

        // $FlowFixMe
        const [[, , , msg]] = github.addIssueComment.mock.calls;
        const expectedUser = payload.issue.user.login;
        expect(msg).toMatch(new RegExp(`.+@${expectedUser}.+`));
    });

    it('should use correct repo + owner', async () => {
        await handler(payload);
        const github = require('../../../github');

        // $FlowFixMe
        const [[, owner, repo]] = github.addIssueComment.mock.calls;
        const expectedRepo = payload.repository.name;
        const expectedOwner = payload.repository.owner.login;

        expect(repo).toEqual(expectedRepo);
        expect(owner).toEqual(expectedOwner);
    });

    it('should use correct issue number', async () => {
        await handler(payload);
        const github = require('../../../github');

        // $FlowFixMe
        const [[issue]] = github.addIssueComment.mock.calls;
        expect(issue).toEqual(payload.issue.number);
    });
});
