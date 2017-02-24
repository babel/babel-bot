// @flow

import github from '../../github';
import Logger from '../../logger';
import { oneLine } from 'common-tags'

const { log } = new Logger('handlers/issue_comment/created.js');

type IssueCommentPayload = {
    issue: {
        number: number;
        title: string;
        body: string;
        html_url: string;
        user: { login: string; };
    };
    comment: {
        id: number;
        user: { login: string; };
        body: string;
    };
    repository: {
        owner: { login: string; };
        name: string;
    }
};

// Accepts
// @babel-bot move owner/repo
// @babel-bot move to owner/repo
// @babel-bot   move     to   owner/repo
const reRepo = /@babel-bot\s+move\s+(?:to\s+)?(.+\/.+)/i;

const movedComment = (user: string, uri: string) => oneLine`
    Hey @${user}! I've [moved your issue](${uri}) to the correct repository. Please make
    sure to keep an eye on the new issue for the latest information.
`;

const newIssueBody = (user: string, originalUri: string, body: string) => {
    return `Original issue submitted by @${user} in ${originalUri}\n\n${body}`;
};

const isAnnoying = (body) => body === '+1' || body === '-1';

// This is super messy and needs cleanup. But not tonight :D
export default function({ comment, issue, repository }: IssueCommentPayload) {

    if (isAnnoying(comment.body.trim())) {
        log(`Removing a +1/-1 comment`, 'verbose');
        github.deleteIssueComment({
            id: comment.id,
            owner: repository.owner.login,
            repo: repository.name
        });
    }

    const [, targetRepo] = comment.body.match(reRepo) || [];
    if (!targetRepo) return;

    const username = issue.user.login;
    const movingUser = comment.user.login;
    github.getUserOrgs(movingUser).then(orgs => {
        const isBabelMember = orgs.find(org => org.login === 'babel');
        if (!isBabelMember) {
            log(`User ${movingUser} attempted to move an issue without being an org member. Rude!`, 'verbose');
            return;
        }

        const [owner, repo] = targetRepo.split('/');
        log(`Attempting to move issue ${issue.number} to ${owner}:${repo}`, 'verbose');

        return github.newIssue({
            title: issue.title,
            body: newIssueBody(username, issue.html_url, issue.body),
            owner,
            repo
        });
    }).then(res => {
        if (!res) return;

        log(`Adding issue moved notification for ${issue.number}`, 'verbose');
        return github.addIssueComment(
            issue.number,
            repository.owner.login,
            repository.name,
            movedComment(username, res.html_url)
        );
    }).then(res => {
        if (!res) return;
        log(`Closing issue ${issue.number}`, 'verbose');
        return github.closeIssue({
            id: issue.number,
            owner: repository.owner.login,
            repo: repository.name
        });
    }).catch(err => {
        log(`Failed moving issue ${issue.number}. Details: ${err.message}`);
    });
}
