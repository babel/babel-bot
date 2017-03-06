// @flow

import github from '../../github';
import Logger from '../../logger';

const { log } = new Logger('release/published.js');

type ReleasePublishedPayload = {
    release: {
        body: string;
        html_url: string;
    },
    repository: {
        owner: { login: string; };
        name: string;
    }
};

export default function({ release, repository }: ReleasePublishedPayload) {
    const { login: owner } = repository.owner;
    const { name: repo } = repository;
    const { body, html_url: releaseUrl } = release;

    const msg = `Released in ${releaseUrl} :tada:`;

    log('Linking pull requests to release', 'verbose');

    const regex = /- \[#(\d+)]/g;

    let match;

    while ((match = regex.exec(body)) !== null) {
        const issue = match[1];
        log(`Add comment to /repos/${owner}/${repo}/issues/${issue}/comments`, 'verbose');
        github.addIssueComment(issue, owner, repo, msg);
    }
}
