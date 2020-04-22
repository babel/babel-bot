// @flow

import got from 'got';
import url from 'url';

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

// https://developer.github.com/v3/issues/comments/#list-comments-on-an-issue
type GetCommentsParams = {
    owner: string;
    repo: string;
    number: string | number;
};
type GetCommentsResult = Array<Comment>;
type Comment = {
    id: number,
    user: {
        id: number,
        login: string,
    },
    body: string,
};
exports.getIssueComments = async ({ owner, repo, number }: GetCommentsParams) => {
    const result = await get(`${BASE_URI}/repos/${owner}/${repo}/issues/${number}/comments`, {
        json: true,
    });
    return (result.body: GetCommentsResult);
};

// https://developer.github.com/v3/issues/comments/#edit-a-comment
type EditCommentsParams = {
    owner: string;
    repo: string;
    id: number;
    body: string;
};
exports.editComment = async ({ owner, repo, id, body }: EditCommentsParams) => {
    await got.patch(`${BASE_URI}/repos/${owner}/${repo}/issues/comments/${id}`, {
        body: JSON.stringify({ body }),
        headers,
        json: true,
    });
};

// https://developer.github.com/v3/repos/statuses/#create-a-status
type SetStatusParams = {
    owner: string;
    repo: string;
    sha: string;

    context: string;
    description: string;
    state: 'pending' | 'success' | 'error' | 'failure';
    target_url: string;
};
exports.setStatus = async function(params: SetStatusParams) {
    const {owner, repo, sha, ...body} = params;
    const response = await got.post(`${BASE_URI}/repos/${owner}/${repo}/statuses/${sha}`, {
        headers,
        json: true,
        body: JSON.stringify(body)
    });
    return response.body;
};
exports.parsePullRequestURL = function(prURL: string): {
    owner: string,
    repo: string,
    pr: number
} {
    const path = url.parse(prURL).pathname;
    if (!path) {
      throw new Error('Invalid GitHub URL');
    }
    const parts = path.substr(1).split('/');
    if (parts.length !== 4 || parts[2] !== 'pull') {
      throw new Error(`Unexpected GitHub PR URL format: ${path}`);
    }

    const [owner, repo, _, pr] = parts;
    return {owner, repo, pr: +pr};
}

// https://developer.github.com/v3/pulls/#get-a-single-pull-request
type PullRequestParams = {
    owner: string;
    repo: string;
    number: string | number;
};
exports.getPullRequest = async function({ owner, repo, number }: PullRequestParams) {
    return get(`${BASE_URI}/repos/${owner}/${repo}/pulls/${number}`, { json: true })
        .then(({ body }) => body);
};

// https://developer.github.com/v3/repos/statuses/#list-statuses-for-a-specific-ref
type StatusesPayload = {
    owner: string;
    repo: string;
    sha: string;
};
exports.getStatuses = async function({ owner, repo, sha }: StatusesPayload) {
    return get(`${BASE_URI}/repos/${owner}/${repo}/statuses/${sha}`, { json: true })
        .then(({ body }) => body);
}
