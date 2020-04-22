/**
 * Provides methods for fetching data from CircleCI's API.
 * @flow
 */

import got from 'got';
import url from 'url';

export type Build = {
  pull_requests?: [{
    head_sha: string,
    url: string,
  }],
};

const headers = {
  Accept: 'application/json',
  'User-Agent': 'BabelBot/1.0.0'
};
const API_BASE = 'https://circleci.com/api/v1.1/project/github';
const API_KEY = `${process.env.CIRCLECI_API_KEY || ''}`;

/**
 * Parses the owner, repo and build number from a CircleCI build URL.
 */
export function parseBuildURL(buildURL: string): {
  owner: string,
  repo: string,
  build: number,
} {
  const path = url.parse(buildURL).pathname;
  if (!path) {
    throw new Error('Invalid CircleCI URL');
  }
  const parts = path.substr(1).split('/');
  if (parts.length !== 4) {
    throw new Error(`Unexpected CircleCI URL format: ${path}`);
  }

  const [_, owner, repo, build] = parts;
  return {owner, repo, build: +build};
}

/**
 * Extract the CircleCI build URL from GitHub check run output summary
 * @param {string} outputSummary
 * @example
 *
 * extractBuildURL("* [build-standalone](https://circleci.com/gh/babel/babel/21115?utm_campaign=vcs-integration-link&utm_medium=referral&utm_source=github-checks-link) - Success")
 * // returns "https://circleci.com/gh/babel/babel/21115?utm_campaign=vcs-integration-link&utm_medium=referral&utm_source=github-checks-link"
 */
export function extractBuildURL(outputSummary: string): string {
  const matches = outputSummary.match(/\[build-standalone\]\(([^(]+)\)/);
  if (!matches || !matches[1]) {
    throw new Error(`Unsupported Check Run Output Summary: ${outputSummary}`);
  }
  return matches[1];
}

export async function fetchBuild(
  owner: string,
  repo: string,
  build: number
): Promise<Build> {
  const response = await got.get(`${API_BASE}/${owner}/${repo}/${build}`, {
    headers,
    json: true,
  });
  return (response.body: Build);
}

// https://circleci.com/docs/api/v1-reference/#retry-build
export async function retryBuild(
  owner: string,
  repo: string,
  build: number
): Promise<number> {
  const response = await got.post(`${API_BASE}/${owner}/${repo}/${build}/retry?circle-token=${API_KEY}`, {
    headers,
    json: true,
  });
  return response.build_num;
}
