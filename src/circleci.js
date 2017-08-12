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
