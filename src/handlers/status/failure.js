// @flow

import Logger from '../../logger';
import github from '../../github';
import { fetchBuild } from '../../travis';
import stripIndent from 'common-tags/lib/stripIndent';
import type { JobItem } from '../../travis';
import type { StatusPayload } from './types';

const { log } = new Logger('status/failure.js');

const reBuildID = /.+\/(\d+)$/;

const buildItemFailureText = (item: JobItem, owner: string, repo: string) => {
    const travis = `https://travis-ci.org/${owner}/${repo}/jobs/${item.id}`;
    return `* [Node v${item.config.node_js} - ${item.config.os}](${travis})`;
};

const buildFailureMsg = (prOwner: string, failedBuilds: Array<JobItem>, owner, repo) => {
    const failureItemsText = failedBuilds.map(
        item => buildItemFailureText(item, owner, repo)
    ).join('\n');
    return stripIndent`
        Hey @${prOwner}! It looks like one or more of your builds have failed.` +
        ` I\'ve copied the relevant info below to save you some time.\n\n${failureItemsText}`;
};

export default function(payload: StatusPayload) {
    const { repository: repo, target_url } = payload;
    const [, buildID] = payload.target_url.match(reBuildID) || [];

    log(`Fetching test matrix for TravisCI build #${buildID}`, 'verbose');

    fetchBuild(repo.owner.login, repo.name, buildID).then(res => {
        const failedBuilds = res.jobs.filter(build => build.state === 'failed');
        const committer = payload.commit.author.login;

        log(`Adding comment for PR number ${res.build.pull_request_number}`, 'verbose');
        return github.addIssueComment(
            res.build.pull_request_number,
            repo.owner.login,
            repo.name,
            buildFailureMsg(committer, failedBuilds, repo.owner.login, repo.name)
        );
    }).catch(e => {
        log(`Failed fetching test matrix. Details:\n${e.message}`);
    });
}
