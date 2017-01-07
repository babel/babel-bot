// @flow

import github from '../../github';
import messages from '../../messages';

type OpenedIssuePayload = {
    issue: {
        user: { login: string; };
        number: number;
    },
    repository: {
        owner: { login: string; };
        name: string;
    }
};

export default function({ issue, repository }: OpenedIssuePayload) {
    const issueSubmitter = issue.user.login;
    const { login: owner } = repository.owner;
    const { name: repo } = repository;
    const msg = messages.newIssue(issueSubmitter);

    github.addIssueComment(issue.number, owner, repo, msg);
}
