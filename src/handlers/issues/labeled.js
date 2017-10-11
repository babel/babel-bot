// @flow

import github from '../../github';
import twitter from '../../twitter';
import messages from '../../messages';

type LabeledIssuePayload = {
    issue: {
        user: { login: string; };
        html_url: string;
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
    const issueHtmlUrl = issue.html_url;
    const { login: owner } = repository.owner;
    const { name: repo } = repository;

    if (label.name === 'Needs Info') {
        const msg = messages.needsInfo(issueSubmitter);
        github.addIssueComment(issue.number, owner, repo, msg);
    } else if(label.name === 'beginner-friendly') {
        const msg = messages.tweetIssue(issueHtmlUrl);
        twitter.tweet(msg);
    }
}
