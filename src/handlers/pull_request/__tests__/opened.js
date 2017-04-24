// @flow

import handler from '../opened';

const payload = require('./__fixtures__/new-pr-opened.json');
jest.mock('../../../github', () => {
    let issue = { ...require('./__fixtures__/issue.json') };

    return {
        addLabels: jest.fn((id, owner, repo, labels) => {
          issue.labels = [...issue.labels, ...labels.map(l => ({ name: l }))];
          return Promise.resolve();
        }),
        getLabels: jest.fn(() => Promise.resolve(issue.labels)),
        removeLabel: jest.fn((id, owner, repo, label) => {
            issue.labels = issue.labels.filter(l => l.name !== label.name);
            return Promise.resolve();
        }),
        getIssue: () => issue,
        setIssue: (i) => issue = i
    };
});

describe('PR Opened Handler', () => {
    it('Should removed claimed label on associated issues when a PR is opened', async () => {
        const github = require('../../../github');
        await handler(payload);

        expect(github.removeLabel).toHaveBeenCalledTimes(1);

        // $FlowFixMe
        expect(github.getIssue().labels.indexOf('claimed')).toEqual(-1);

        // $FlowFixMe
        github.addLabels.mockClear();
        // $FlowFixMe
        github.removeLabel.mockClear();
    });

    it('Should removed help wanted label on associated issues when a PR is opened', async () => {
      const github = require('../../../github');

      // $FlowFixMe
      github.setIssue({
        ...require('./__fixtures__/issue.json'),
        labels: [ { name: 'help wanted' } ]
      });

      await handler(payload);

      expect(github.removeLabel).toHaveBeenCalledTimes(1);

      // $FlowFixMe
      expect(github.getIssue().labels.indexOf('help wanted')).toEqual(-1);

      // $FlowFixMe
      github.addLabels.mockClear();
      // $FlowFixMe
      github.removeLabel.mockClear();
    });

    it('Should add Has PR label to associated issues when a PR is opened', async () => {
        const github = require('../../../github');
        // $FlowFixMe
        github.setIssue({ ...require('./__fixtures__/issue.json') });

        await handler(payload);

        expect(github.addLabels).toHaveBeenCalledTimes(1);

        // $FlowFixMe
        expect(github.getIssue().labels.length).toEqual(1);

        // $FlowFixMe
        expect(github.getIssue().labels[0].name).toEqual('Has PR');

        // $FlowFixMe
        github.addLabels.mockClear();
        // $FlowFixMe
        github.removeLabel.mockClear();
    });
});
