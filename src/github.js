// @flow

const got = require('got');

const BASE_URI = exports.BASE_URI = 'https://api.github.com';
const headers = {
    Authorization: `token ${process.env.GITHUB_API_KEY || ''}`
};

const post = exports.post = (path: string, body: Object | Array<any>) => {
    return got.post(`${BASE_URI}${path}`, {
        headers,
        body: JSON.stringify(body)
    })
};

exports.get = (uri: string) => got.get(uri, { headers });

exports.addIssueComment = (issueId: string | number, owner: string, repo: string, comment: string) => {
    const uri = `/repos/${owner}/${repo}/issues/${issueId}/comments`;
    return post(uri, { body: comment });
};

exports.addLabels = (id: string | number, owner: string, repo: string, labels: Array<string>) => {
    return post(`/repos/${owner}/${repo}/issues/${id}/labels`, labels);
};
