// @flow

import handler from '../opened';
import fs from 'fs';

const payload = require('./__fixtures__/new-issue-opened.json');
jest.mock('../../../github');

describe('Issue Opened Handler', () => {
    it('Should add a new comment when an issue is opened', () => {
        handler(payload);
        const github = require('../../../github');

        expect(github.addIssueComment).toHaveBeenCalledTimes(1);
    });

    it('should use correct username', () => {
        handler(payload);
        const github = require('../../../github');
        // $FlowIgnore
        const [[, , , msg]] = github.addIssueComment.mock.calls;
        const expectedUser = payload.issue.user.login;
        expect(msg).toMatch(new RegExp(`.+@${expectedUser}.+`));
    });

    it('should use correct repo + owner', () => {
        handler(payload);
        const github = require('../../../github');
        // $FlowIgnore
        const [[, owner, repo]] = github.addIssueComment.mock.calls;
        const expectedRepo = payload.repository.name;
        const expectedOwner = payload.repository.owner.login;

        expect(repo).toEqual(expectedRepo);
        expect(owner).toEqual(expectedOwner);
    });

    it('should use correct issue number', () => {
        handler(payload);
        const github = require('../../../github');
        // $FlowIgnore
        const [[issue]] = github.addIssueComment.mock.calls;

        expect(issue).toEqual(payload.issue.number);
    });
});
