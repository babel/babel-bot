// @flow

import github from '../../github';
import messages from '../../messages';
import Logger from '../../logger';

const { log } = new Logger('issues/opened.js');

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

    log(`Checking if ${issueSubmitter} is member of Babel org`, 'verbose');
    return github.getUserOrgs(issueSubmitter).then(orgs => {
        const isBabelOrgMember = orgs.filter(({ login }) => login === 'babel').length;
        if (isBabelOrgMember) {
            log(`User is member of Babel org. Skipping comment`, 'verbose');
            return;
        };

        log(`User is not member of Babel org. Adding comment`, 'verbose');
        return github.addIssueComment(issue.number, owner, repo, msg);
    }).catch(e => {
        log(`Failed attempting to add new issue comment. Details: ${e.message}`);
    });
}
