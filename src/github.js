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
    });
};

const get = exports.get = (uri: string, opts: Object) => got.get(uri, { headers, ...opts });

const del = exports.del = (path: string) => {
    return got.delete(`${BASE_URI}${path}`, {
        headers
    });
};

exports.addIssueComment = (issueId: string | number, owner: string, repo: string, comment: string) => {
    const uri = `/repos/${owner}/${repo}/issues/${issueId}/comments`;
    return post(uri, { body: comment });
};

exports.addLabels = (id: string | number, owner: string, repo: string, labels: Array<string>) => {
    return post(`/repos/${owner}/${repo}/issues/${id}/labels`, labels);
};

type OrgPayload = Promise<Array<{ login: string }>>;
exports.getUserOrgs = (username: string): OrgPayload => {
    return get(`${BASE_URI}/users/${username}/orgs`, { json: true })
        .then(({ body }) => body);
};

type NewIssueParams = {
    title: string;
    body: string;
    owner: string;
    repo: string;
};
type NewIssueResponse = { html_url: string; };
exports.newIssue = ({ title, body, owner, repo }: NewIssueParams): Promise<NewIssueResponse> => {
    console.log('posting new issue');
    return got.post(`${BASE_URI}/repos/${owner}/${repo}/issues`, {
        headers,
        json: true,
        body: JSON.stringify({ title, body })
    }).then(({ body }) => body);
};

type CloseIssueParams = {
    id: string | number;
    owner: string;
    repo: string;
};
exports.closeIssue = ({ id, owner, repo }: CloseIssueParams) => {
    return got.patch(`${BASE_URI}/repos/${owner}/${repo}/issues/${id}`, {
        body: JSON.stringify({ state: 'closed' })
    });
};

type IssueCommentParams = {
    id: string | number;
    owner: string;
    repo: string;
};
// https://developer.github.com/v3/issues/comments/#delete-a-comment
exports.deleteIssueComment = ({ id, owner, repo }: IssueCommentParams) => {
    return del(`/repos/${owner}/${repo}/issues/comments/${id}`);
}

type IssueParams = {
    content: string;
    number: string | number;
    owner: string;
    repo: string;
};
// https://developer.github.com/v3/reactions/#create-reaction-for-an-issue
exports.createIssueReaction = ({ content, number, owner, repo }: IssueParams) => {
    return got.post(`${BASE_URI}/repos/${owner}/${repo}/issues/${number}/reactions`, {
        headers: {
            ...headers,
            Accept: 'application/vnd.github.squirrel-girl-preview'
        },
        json: true,
        body: JSON.stringify({ content })
    }).then(({ body }) => body);
}
