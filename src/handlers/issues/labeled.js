// @flow

import github from '../../github';
import messages from '../../messages';

type LabeledIssuePayload = {
    issue: {
        user: { login: string; };
        number: number;
    },
    label: {
        name: string;
    },
    repository: {
        owner: { login: string; };
        name: string;
    }
};

export default function({ label, issue, repository }: LabeledIssuePayload) {
    const issueSubmitter = issue.user.login;
    const { login: owner } = repository.owner;
    const { name: repo } = repository;

    if (label.name === 'Needs Info') {
        const msg = messages.needsInfo(issueSubmitter);
        github.addIssueComment(issue.number, owner, repo, msg);
    }
}
