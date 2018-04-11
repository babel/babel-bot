// @flow

const stripIndent = require('common-tags/lib/stripIndent');

exports.needsInfo = (username: string) => stripIndent`
    Hi @${username}! A maintainer of the project has notified me that you're missing
    some information we'll need to replicate this issue.

    Please understand that we receive a high volume of issues, and there are only a limited number
    of volunteers that help maintain this project. The easier it is for us to decipher an issue with the info provided,
    the more likely it is that we'll be able to help.

    Please make sure you have the following information documented in this ticket:

    1. Your Babel configuration (typically in the form of a \`.babelrc\`)
    2. The current (incorrect) behavior you're seeing
    3. The behavior you expect
    4. A [short, self-contained example](http://sscce.org/)

    Please provide either a link to the problem via the [\`repl\`](https://babeljs.io/repl/), or if the \`repl\` is insufficient,
    a new and minimal repository with instructions on how to build/replicate the issue.
`;

exports.newIssue = (username: string) => stripIndent`
    Hey @${username}! We really appreciate you taking the time to report an issue. The collaborators
    on this project attempt to help as many people as possible, but we're a limited number of volunteers,
    so it's possible this won't be addressed swiftly.

    If you need any help, or just have general Babel or JavaScript questions, we have a vibrant [Slack
    community](https://babeljs.slack.com) that typically always has someone willing to help. You can sign-up [here](https://slack.babeljs.io/)
    for an invite.
`;

exports.replPreview = (url: string) => stripIndent`
    Build successful! You can test your changes in the REPL here: ${url}
`;
