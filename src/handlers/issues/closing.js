// @flow

import github from '../../github';
import Logger from '../../logger';

const { log } = new Logger('issues/closing.js');

type ClosingIssuesPayload = {
    repository: {
        owner: { login: string; };
        name: string;
    }
}

const closingIssueMessage = "Closing this issue because it has been inactive for a long period of time.";

const isInactive = updatedAt => {
    const idleTime = 30 * 24 * 60 * 60 * 1000;
    const currentDate = new Date();
    const updateDate = new Date(updatedAt);
    return currentDate - updateDate > idleTime;
}

export default function({ repository }: ClosingIssuesPayload) {
    const { owner: { login: owner }, name: repo } = repository;

    github.getLabeledIssues({
        labels: encodeURIComponent("Needs Info"),
        owner: owner,
        repo: repo
    }).then(issues => {
        issues.forEach(({ pull_request, number, updated_at }) => {
            if (!pull_request && isInactive(updated_at)) {
                log(`Adding comment to issue #${number}`, 'verbose');
                github.addIssueComment(
                    number,
                    owner,
                    repo,
                    closingIssueMessage
                ).then(res => {
                    log(`Closing issue #${number}`, 'verbose')
                    return github.closeIssue({
                        id: number,
                        owner: owner,
                        repo: repo
                    });
                }).catch(err => {
                    log(`Failed closing issue ${number}. Details: ${err.message}`);
                });
            }
        })
    });
}
