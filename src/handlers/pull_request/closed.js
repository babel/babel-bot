// @flow

import Logger from '../../logger';
import github from '../../github';

const { log } = new Logger('pull_request/closed.js');

type ClosedPRPayload = {
    number: number;
    pull_request: {
        merged: boolean;
        head: {
            ref: string;
        }
    };
    repository: {
        name: string;
        owner: {
            login: string;
        }
    };
};

export default function({ number, pull_request, repository }: ClosedPRPayload) {
    const { merged, head: { ref: branch } } = pull_request;
    const { name: repo, owner: { login: owner } } = repository

    if (!merged) {
        log(`Pull request #${number} was closed but not merged`, 'verbose');
        return;
    }

    github.deleteBranch({
        owner: owner,
        repo: repo,
        branch: branch
    })
}
