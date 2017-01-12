// @flow

import got from 'got';

const headers = {
    Accept: 'application/vnd.travis-ci.2+json',
    'User-Agent': 'BabelBot/1.0.0'
};
const API_BASE = 'https://api.travis-ci.org';

export type JobItem = {
    id: number;
    config: {
        os: string;
        node_js: string; // node version
    },
    state: string;
    started_at: string;
    finished_at: string;
};

type BuildBody = {
    build: {
        pull_request_number: number;
    },
    jobs: Array<JobItem>;
};


export function fetchBuild(owner: string, repo: string, buildID: number | string): Promise<BuildBody> {
    return got.get(`${API_BASE}/repos/${owner}/${repo}/builds/${buildID}`, {
        headers,
        json: true
    }).then(res => {
        const body: BuildBody = res.body;
        return body;
    });
}
