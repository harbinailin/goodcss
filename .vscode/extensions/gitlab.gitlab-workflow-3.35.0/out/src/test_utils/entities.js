"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.project = exports.reviewUriParams = exports.gqlProject = exports.repository = exports.job = exports.pipeline = exports.customQuery = exports.mrVersion = exports.diffFile = exports.mr = exports.issue = void 0;
const custom_query_type_1 = require("../gitlab/custom_query_type");
const gitlab_project_1 = require("../gitlab/gitlab_project");
const create_wrapped_repository_1 = require("./create_wrapped_repository");
exports.issue = {
    id: 1,
    iid: 1000,
    title: 'Issuable Title',
    project_id: 9999,
    web_url: 'https://gitlab.example.com/group/project/issues/1000',
    author: {
        avatar_url: 'https://secure.gravatar.com/avatar/6042a9152ada74d9fb6a0cdce895337e?s=80&d=identicon',
        name: 'Tomas Vik',
    },
    references: {
        full: 'gitlab-org/gitlab#1000',
    },
    severity: 'severityLevel1',
    name: 'Issuable Name',
};
exports.mr = {
    ...exports.issue,
    id: 2,
    iid: 2000,
    web_url: 'https://gitlab.example.com/group/project/merge_requests/2000',
    references: {
        full: 'gitlab-org/gitlab!2000',
    },
    sha: '69ad609e8891b8aa3db85a35cd2c5747705bd76a',
    source_project_id: 9999,
    target_project_id: 9999,
    source_branch: 'feature-a',
};
exports.diffFile = {
    old_path: 'old_file.js',
    new_path: 'new_file.js',
    new_file: false,
    deleted_file: false,
    renamed_file: true,
    diff: '@@ -0,0 +1,7 @@\n+new file 2\n+\n+12\n+34\n+56\n+\n+,,,\n',
};
exports.mrVersion = {
    base_commit_sha: 'aaaaaaaa',
    head_commit_sha: 'bbbbbbbb',
    start_commit_sha: 'cccccccc',
    diffs: [exports.diffFile],
};
exports.customQuery = {
    name: 'Query name',
    type: custom_query_type_1.CustomQueryType.ISSUE,
    maxResults: 10,
    scope: 'all',
    state: 'closed',
    wip: 'no',
    confidential: false,
    excludeSearchIn: 'all',
    orderBy: 'created_at',
    sort: 'desc',
    searchIn: 'all',
    noItemText: 'No item',
};
exports.pipeline = {
    status: 'success',
    updated_at: '2021-02-12T12:06:17Z',
    id: 123456,
    project_id: 567890,
    web_url: 'https://example.com/foo/bar/pipelines/46',
};
exports.job = {
    id: 1,
    name: 'Unit tests',
    status: 'success',
    stage: 'test',
    created_at: '2021-07-19T11:44:54.928Z',
    started_at: '2021-07-19T11:44:54.928Z',
    finished_at: '2021-07-19T11:44:54.928Z',
    allow_failure: false,
    web_url: 'https://example.com/foo/bar/jobs/68',
};
exports.repository = (0, create_wrapped_repository_1.createWrappedRepository)();
exports.gqlProject = {
    id: 'gid://gitlab/Project/5261717',
    name: 'gitlab-vscode-extension',
    description: '',
    httpUrlToRepo: 'https://gitlab.com/gitlab-org/gitlab-vscode-extension.git',
    sshUrlToRepo: 'git@gitlab.com:gitlab-org/gitlab-vscode-extension.git',
    fullPath: 'gitlab-org/gitlab-vscode-extension',
    webUrl: 'https://gitlab.com/gitlab-org/gitlab-vscode-extension',
    group: {
        id: 'gid://gitlab/Group/9970',
    },
    wikiEnabled: false,
};
exports.reviewUriParams = {
    mrId: exports.mr.id,
    projectId: exports.mr.project_id,
    repositoryRoot: '/',
    path: 'new_path.js',
    commit: exports.mr.sha,
};
exports.project = new gitlab_project_1.GitLabProject(exports.gqlProject);
//# sourceMappingURL=entities.js.map