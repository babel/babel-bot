/**
 * Handles successful build statuses. Currently, this is used to link to the REPL
 * when a CircleCI build completes successfully. Note that this is kinda messy,
 * as we need to parse the CircleCI build number out of the build URL. Ideally,
 * this would be a CircleCI webhook and NOT a GitHub webhook, but we already
 * have all this infra for GitHub webhooks, so this is good enough for now.
 * @flow
 */

import * as circleci from '../../circleci';
import github from '../../github';
import Logger from '../../logger';
import { replPreview } from '../../messages';
import type { StatusPayload } from './types';

const { log } = new Logger('status/success.js');

export default async function(payload: StatusPayload): Promise<void> {
  // We only care about CircleCI statuses
  if (payload.context !== 'ci/circleci') {
    log(`Ignoring payload ${payload.id} as it is not CircleCI: ${payload.context}`, 'verbose');
    return;
  }

  try {
    const { owner, repo, build: buildNum } = circleci.parseBuildURL(payload.target_url);

    // GitHub don't give us the pull request URL, so we need to get that from
    // CircleCI's API.
    const build = await circleci.fetchBuild(owner, repo, buildNum);
    const prs = build.pull_requests; // for Flow refinement
    if (!prs || prs.length === 0) {
      log(`CircleCI build ${buildNum} is not a pull request. Ignoring.`, 'verbose');
      return;
    }
    const { pr } = github.parsePullRequestURL(prs[0].url);

    let replURL = `https://babeljs.io/repl/build/${buildNum}/`;
    // Handle custom repos such as forks
    if (owner !== 'babel' || repo !== 'babel') {
      replURL += `#?circleci_repo=${owner}/${repo}`;
    }

    // Check if we already have a comment with this exact URL. Sometimes, GitHub
    // will call the webhook multiple times for the same status (???)
    try {
      const existingComments = await github.getIssueComments({owner, repo, number: pr});
      if (existingComments.find(comment => comment.body.includes(replURL))) {
        log(`Not adding comment to #${pr} as one already exists`);
        return;
      }
    } catch (err) {
      // Don't worry... It's probably okay. The worst thing that will happen is
      // that we have duplicate comments.
    }

    await Promise.all([
      github.addIssueComment(pr, owner, repo, replPreview(replURL)),
      github.setStatus({
        owner,
        repo,
        sha: prs[0].head_sha,
        context: 'babel/repl',
        description: 'REPL preview is available',
        state: 'success',
        target_url: replURL,
      }),
    ]);
  } catch (err) {
    log(`Error handling CircleCI build: ${err.message}`);
  }
}
