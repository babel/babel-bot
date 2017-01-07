// function getPackagesFromDiffURI(uri: string) {
//     return github.get(uri).then(res => {
//         return Array.from(util.packagesFromDiff(res.body));
//     });
// }

// const diffURI = payload.pull_request.diff_url;
// getPackagesFromDiffURI(diffURI).then(packages => {
//     return github.addLabels(prId, owner, repo, packages);
// }).catch(callback);
