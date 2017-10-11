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
    const commentBody = replPreview(replURL);

    let commentRequest;
    try {
      // See if we already have an existing comment
      const existingComments = await github.getIssueComments({owner, repo, number: pr});
      const existingComment = existingComments.find(
        comment =>
          comment.user.login === 'babel-bot' &&
          comment.body.includes('/repl/build/')
      );
      if (existingComment) {
        // There's already an existing comment, so we'll just edit that one
        // rather than posting a brand new comment.
        commentRequest = github.editComment({
          owner,
          repo,
          id: existingComment.id,
          body: commentBody
        });
      }
    } catch (err) {
      // Don't worry... It's probably okay. The worst thing that will happen is
      // that we have duplicate comments.
    }

    if (!commentRequest) {
      commentRequest = github.addIssueComment(pr, owner, repo, commentBody);
    }

    await Promise.all([
      commentRequest,
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
