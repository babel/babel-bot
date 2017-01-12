// @flow

import Logger from '../../logger';
import github from '../../github';
import { fetchBuild } from '../../travis';
import stripIndent from 'common-tags/lib/stripIndent';
import type { JobItem } from '../../travis';

const { log } = new Logger('status/failure.js');

type FailedStatusPayload = {
    description: string;
    target_url: string;
    branches: Array<{
        name: string;
        commit: {
            sha: string;
            url: string;
        }
    }>;
    repository: {
        full_name: string;
        name: string;
        owner: {
            login: string;
        }
    };
    commit: {
        author: { login: string }
    }
};

const reBuildID = /.+\/(\d+)$/;

const buildItemFailureText = (item: JobItem, owner: string, repo: string) => {
    return stripIndent`
        **OS**: ${item.config.os}
        **node.js version**: ${item.config.node_js}
        **Started at**: ${item.started_at}
        **Failed at**: ${item.finished_at}
        **Logs**: [Click Here](https://travis-ci.org/${owner}/${repo}/jobs/${item.id})
    `;
};

const buildFailureMsg = (prOwner: string, failedBuilds: Array<JobItem>, owner, repo) => {
    const failureItemsText = failedBuilds.map(
        item => buildItemFailureText(item, owner, repo)
    ).join('\n\n');
    return stripIndent`
        Hey @${prOwner}! It looks like one or more of your builds have failed.` +
        ` I\'ve copied the relevant info below to save you some time.\n\n${failureItemsText}`;
};

export default function(payload: FailedStatusPayload) {
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
