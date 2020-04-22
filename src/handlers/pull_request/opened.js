// @flow

import Logger from '../../logger';
import github from '../../github';

const { log } = new Logger('pull_request/opened.js');

type OpenedPRPayload = {
    number: number;
    pull_request: {
        title: string;
        body: string;
    };
    repository: {
        full_name: string;
        name: string;
        owner: {
            login: string;
        }
    };
};

function issuesFromBody(body: string) {
    const reFixedList = /\s+Fixed issues\s+\|*\s(.+)/i;
    const [, fixedList] = body.match(reFixedList) || [];
    if (!fixedList) return [];

    const reID = /#(\d+)/g;
    let val, ids = [];
    while ((val = reID.exec(fixedList)) !== null) { 
        // $FlowIgnore
        ids.push(val[1]);
    }

    return ids;
}

export default function({ number, pull_request, repository }: OpenedPRPayload) {
    const { body } = pull_request;
    const issues = issuesFromBody(body);
    if (!issues.length) {
        log(`No issues found for PR #${number}`, 'verbose');
        return
    }

    const { name: repo, owner: { login } } = repository;
    const requests = issues.map(id => github.addLabels(
        id,
        login,
        repo,
        ['Has PR']
    ));

    const issuesStr = issues.join(', ');
    log(`Sent request(s) to add labels related to PR #${number}. Issues: ${issuesStr}`, 'verbose');
    Promise.all(requests).then(() => {
        log(`Submitted labels for PR ${number} on issues: ${issuesStr}`, 'verbose');
    }).catch(e => {
        log(`Failed submitted labels for PR ${number} on at least one of ${issuesStr}`);
    });
}
