export type StatusPayload = {
    context: string;
    description: string;
    id: string;
    target_url: string;
    branches: Array<{
        name: string;
        commit: {
            sha: string;
            url: string;
        }
    }>;
    repository: {
        full_name: string;
        name: string;
        owner: {
            login: string;
        }
    };
    commit: {
        author: { login: string }
    }
};
