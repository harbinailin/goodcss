"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitLabNewService = exports.fetchJson = void 0;
const https = __importStar(require("https"));
const graphql_request_1 = require("graphql-request");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const url_1 = require("url");
const https_proxy_agent_1 = __importDefault(require("https-proxy-agent"));
const assert_1 = __importDefault(require("assert"));
const token_service_1 = require("../services/token_service");
const fetch_error_1 = require("../errors/fetch_error");
const get_user_agent_header_1 = require("../utils/get_user_agent_header");
const ensure_absolute_avatar_url_1 = require("../utils/ensure_absolute_avatar_url");
const get_http_agent_options_1 = require("../utils/get_http_agent_options");
const gitlab_project_1 = require("./gitlab_project");
const get_rest_id_from_graphql_id_1 = require("../utils/get_rest_id_from_graphql_id");
const user_friendly_error_1 = require("../errors/user_friendly_error");
const mr_permission_1 = require("./graphql/mr_permission");
const shared_1 = require("./graphql/shared");
const get_projects_1 = require("./graphql/get_projects");
const get_discussions_1 = require("./graphql/get_discussions");
const get_snippets_1 = require("./graphql/get_snippets");
const get_project_1 = require("./graphql/get_project");
const create_diff_comment_1 = require("./graphql/create_diff_comment");
const remove_leading_slash_1 = require("../utils/remove_leading_slash");
const log_1 = require("../log");
const is_mr_1 = require("../utils/is_mr");
const if_version_gte_1 = require("./if_version_gte");
const get_snippet_content_1 = require("./graphql/get_snippet_content");
const unsupported_version_error_1 = require("../errors/unsupported_version_error");
const constants_1 = require("../constants");
const make_markdown_links_absolute_1 = require("../utils/make_markdown_links_absolute");
const make_html_links_absolute_1 = require("../utils/make_html_links_absolute");
function isLabelEvent(note) {
    return note.label !== undefined;
}
async function fetchJson(label, url, options, query = {}) {
    const q = new url_1.URLSearchParams();
    Object.entries(query).forEach(([name, value]) => {
        if (typeof value !== 'undefined' && value !== null) {
            q.set(name, value);
        }
    });
    const result = await (0, cross_fetch_1.default)(`${url}?${q}`, options);
    if (!result.ok) {
        throw new fetch_error_1.FetchError(`Fetching ${label} from ${url} failed`, result);
    }
    return result.json();
}
exports.fetchJson = fetchJson;
// TODO: extract the mutation into a separate file like src/gitlab/graphql/get_project.ts
const discussionSetResolved = (0, graphql_request_1.gql) `
  mutation DiscussionToggleResolve($replyId: DiscussionID!, $resolved: Boolean!) {
    discussionToggleResolve(input: { id: $replyId, resolve: $resolved }) {
      errors
    }
  }
`;
// TODO: extract the mutation into a separate file like src/gitlab/graphql/get_project.ts
const createNoteMutation = (0, graphql_request_1.gql) `
  ${shared_1.noteDetailsFragment}
  mutation CreateNote($issuableId: NoteableID!, $body: String!, $replyId: DiscussionID) {
    createNote(input: { noteableId: $issuableId, body: $body, discussionId: $replyId }) {
      errors
      note {
        ...noteDetails
      }
    }
  }
`;
// TODO: extract the mutation into a separate file like src/gitlab/graphql/get_project.ts
const deleteNoteMutation = (0, graphql_request_1.gql) `
  mutation DeleteNote($noteId: NoteID!) {
    destroyNote(input: { id: $noteId }) {
      errors
    }
  }
`;
// TODO: extract the mutation into a separate file like src/gitlab/graphql/get_project.ts
const updateNoteBodyMutation = (0, graphql_request_1.gql) `
  mutation UpdateNoteBody($noteId: NoteID!, $body: String) {
    updateNote(input: { id: $noteId, body: $body }) {
      errors
    }
  }
`;
const getProjectPath = (issuable) => issuable.references.full.split(/[#!]/)[0];
const getIssuableGqlId = (issuable) => `gid://gitlab/${(0, is_mr_1.isMr)(issuable) ? 'MergeRequest' : 'Issue'}/${issuable.id}`;
const getMrGqlId = (id) => `gid://gitlab/MergeRequest/${id}`;
class GitLabNewService {
    constructor(instanceUrl, pipelineInstanceUrl) {
        this.instanceUrl = instanceUrl;
        this.pipelineInstanceUrl = pipelineInstanceUrl;
        const ensureEndsWithSlash = (url) => url.replace(/\/?$/, '/');
        const endpoint = new url_1.URL('./api/graphql', ensureEndsWithSlash(this.instanceUrl)).href; // supports GitLab instances that are on a custom path, e.g. "https://example.com/gitlab"
        this.client = new graphql_request_1.GraphQLClient(endpoint, this.fetchOptions);
    }
    get httpAgent() {
        const agentOptions = (0, get_http_agent_options_1.getHttpAgentOptions)();
        if (agentOptions.proxy) {
            return (0, https_proxy_agent_1.default)(agentOptions.proxy);
        }
        if (this.instanceUrl.startsWith('https://')) {
            return new https.Agent(agentOptions);
        }
        return undefined;
    }
    get fetchOptions() {
        const token = token_service_1.tokenService.getToken(this.instanceUrl);
        return {
            headers: {
                Authorization: `Bearer ${token}`,
                ...(0, get_user_agent_header_1.getUserAgentHeader)(),
            },
            agent: this.httpAgent,
        };
    }
    async getVersion() {
        var _a;
        try {
            const result = await (0, cross_fetch_1.default)(`${this.instanceUrl}/api/v4/version`, this.fetchOptions);
            return (_a = (await result.json())) === null || _a === void 0 ? void 0 : _a.version;
        }
        catch (e) {
            (0, log_1.logError)(e);
            return undefined;
        }
    }
    async getProject(projectPath) {
        const options = { projectPath };
        const result = await this.client.request(get_project_1.queryGetProject, options);
        return result.project && new gitlab_project_1.GitLabProject(result.project);
    }
    async getProjects(options) {
        var _a, _b;
        const results = await this.client.request(get_projects_1.queryGetProjects, options);
        return ((_b = (_a = results.projects) === null || _a === void 0 ? void 0 : _a.nodes) === null || _b === void 0 ? void 0 : _b.map(project => new gitlab_project_1.GitLabProject(project))) || [];
    }
    async getSnippets(projectPath, afterCursor) {
        var _a;
        const options = {
            projectPath,
            afterCursor,
        };
        const result = await this.client.request(get_snippets_1.queryGetSnippets, options);
        const { project } = result;
        // this can mean three things: project doesn't exist, user doesn't have access, or user credentials are wrong
        // https://gitlab.com/gitlab-org/gitlab/-/issues/270055
        if (!project) {
            throw new Error(`Project ${projectPath} was not found. You might not have permissions to see it.`);
        }
        const snippets = project.snippets.nodes;
        // each snippet has to contain projectId so we can make REST API call for the content
        const snippetsWithProject = snippets.map(sn => ({
            ...sn,
            projectId: project.id,
        }));
        return ((_a = project.snippets.pageInfo) === null || _a === void 0 ? void 0 : _a.hasNextPage)
            ? [
                ...snippetsWithProject,
                ...(await this.getSnippets(projectPath, project.snippets.pageInfo.endCursor)),
            ]
            : snippetsWithProject;
    }
    // TODO remove this method once the lowest supported GitLab version is 14.1.0
    async getSnippetContentOld(snippet, blob) {
        const getBranch = (rawPath) => {
            // raw path example: "/gitlab-org/gitlab-vscode-extension/-/snippets/111/raw/master/okr.md"
            const result = rawPath.match(/\/-\/snippets\/\d+\/raw\/([^/]+)\//);
            (0, assert_1.default)(result, `The rawPath is malformed ${rawPath}`);
            return result[1];
        };
        const projectId = (0, get_rest_id_from_graphql_id_1.getRestIdFromGraphQLId)(snippet.projectId);
        const snippetId = (0, get_rest_id_from_graphql_id_1.getRestIdFromGraphQLId)(snippet.id);
        const branch = getBranch(blob.rawPath);
        const url = `${this.instanceUrl}/api/v4/projects/${projectId}/snippets/${snippetId}/files/${branch}/${blob.path}/raw`;
        const result = await (0, cross_fetch_1.default)(url, this.fetchOptions);
        if (!result.ok) {
            throw new fetch_error_1.FetchError(`Fetching snippet from ${url} failed`, result);
        }
        return result.text();
    }
    async getSnippetContentNew(snippet, blob) {
        const options = { snippetId: snippet.id };
        const result = await this.client.request(get_snippet_content_1.getSnippetContentQuery, options);
        const snippetResponse = result.snippets.nodes[0];
        (0, assert_1.default)(snippetResponse, `The requested snippet ${snippet.id} was not found`);
        const blobResponse = snippetResponse.blobs.nodes.find(b => b.path === blob.path);
        (0, assert_1.default)(blobResponse, `The requested snippet ${snippet.id} is missing blob ${blob.path}`);
        return blobResponse.rawPlainData;
    }
    async getSnippetContent(snippet, blob) {
        return (0, if_version_gte_1.ifVersionGte)(await this.getVersion(), '14.1.0', () => this.getSnippetContentNew(snippet, blob), () => this.getSnippetContentOld(snippet, blob));
    }
    // This method has to use REST API till https://gitlab.com/gitlab-org/gitlab/-/issues/280803 gets done
    async getMrDiff(mr) {
        const versionsUrl = `${this.instanceUrl}/api/v4/projects/${mr.project_id}/merge_requests/${mr.iid}/versions`;
        const versionsResult = await (0, cross_fetch_1.default)(versionsUrl, this.fetchOptions);
        if (!versionsResult.ok) {
            throw new fetch_error_1.FetchError(`Fetching versions from ${versionsUrl} failed`, versionsResult);
        }
        const versions = await versionsResult.json();
        const lastVersion = versions[0];
        const lastVersionUrl = `${this.instanceUrl}/api/v4/projects/${mr.project_id}/merge_requests/${mr.iid}/versions/${lastVersion.id}`;
        const diffResult = await (0, cross_fetch_1.default)(lastVersionUrl, this.fetchOptions);
        if (!diffResult.ok) {
            throw new fetch_error_1.FetchError(`Fetching MR diff from ${lastVersionUrl} failed`, diffResult);
        }
        return diffResult.json();
    }
    async getFileContent(path, ref, projectId) {
        const encodedPath = encodeURIComponent((0, remove_leading_slash_1.removeLeadingSlash)(path));
        const encodedRef = encodeURIComponent(ref);
        const encodedProject = encodeURIComponent(projectId);
        const fileUrl = `${this.instanceUrl}/api/v4/projects/${encodedProject}/repository/files/${encodedPath}/raw?ref=${encodedRef}`;
        const fileResult = await (0, cross_fetch_1.default)(fileUrl, this.fetchOptions);
        if (!fileResult.ok) {
            throw new fetch_error_1.FetchError(`Fetching file from ${fileUrl} failed`, fileResult);
        }
        return fileResult.text();
    }
    async getFile(path, ref, projectId) {
        const encodedPath = encodeURIComponent((0, remove_leading_slash_1.removeLeadingSlash)(path));
        const encodedRef = encodeURIComponent(ref);
        const encodedProject = encodeURIComponent(projectId);
        const fileUrl = `${this.instanceUrl}/api/v4/projects/${encodedProject}/repository/files/${encodedPath}?ref=${encodedRef}`;
        const fileResult = await (0, cross_fetch_1.default)(fileUrl, this.fetchOptions);
        if (!fileResult.ok) {
            throw new fetch_error_1.FetchError(`Fetching file from ${fileUrl} failed`, fileResult);
        }
        return fileResult.json();
    }
    async getTree(path, ref, projectId) {
        const encodedPath = encodeURIComponent((0, remove_leading_slash_1.removeLeadingSlash)(path));
        const encodedRef = encodeURIComponent(ref);
        const encodedProject = encodeURIComponent(projectId);
        const treeUrl = `${this.instanceUrl}/api/v4/projects/${encodedProject}/repository/tree?ref=${encodedRef}&path=${encodedPath}`;
        const treeResult = await (0, cross_fetch_1.default)(treeUrl, this.fetchOptions);
        if (!treeResult.ok) {
            throw new fetch_error_1.FetchError(`Fetching tree from ${treeUrl} failed`, treeResult);
        }
        return treeResult.json();
    }
    getBranches(project, search) {
        const encodedProject = encodeURIComponent(project);
        const branchUrl = `${this.instanceUrl}/api/v4/projects/${encodedProject}/repository/branches`;
        return fetchJson('branches', branchUrl, this.fetchOptions, { search });
    }
    getTags(project, search) {
        const encodedProject = encodeURIComponent(project);
        const tagUrl = `${this.instanceUrl}/api/v4/projects/${encodedProject}/repository/tags`;
        return fetchJson('tags', tagUrl, this.fetchOptions, { search });
    }
    /*
      The GraphQL endpoint sends us the note.htmlBody with links that start with `/`.
      This works well for the the GitLab webapp, but in VS Code we need to add the full host.
    */
    addHostToUrl(discussion, projectPath) {
        const prependHost = note => ({
            ...note,
            body: (0, make_markdown_links_absolute_1.makeMarkdownLinksAbsolute)(note.body, projectPath, this.instanceUrl),
            bodyHtml: (0, make_html_links_absolute_1.makeHtmlLinksAbsolute)(note.bodyHtml, this.instanceUrl),
            author: {
                ...note.author,
                avatarUrl: note.author.avatarUrl && (0, ensure_absolute_avatar_url_1.ensureAbsoluteAvatarUrl)(this.instanceUrl, note.author.avatarUrl),
            },
        });
        return {
            ...discussion,
            notes: {
                ...discussion.notes,
                nodes: discussion.notes.nodes.map(prependHost),
            },
        };
    }
    async getDiscussions({ issuable, endCursor }) {
        var _a, _b, _c;
        await this.validateVersion('MR Discussions', constants_1.REQUIRED_VERSIONS.MR_DISCUSSIONS);
        const projectPath = getProjectPath(issuable);
        const query = (0, is_mr_1.isMr)(issuable) ? get_discussions_1.getMrDiscussionsQuery : get_discussions_1.getIssueDiscussionsQuery;
        const options = {
            projectPath,
            iid: String(issuable.iid),
            afterCursor: endCursor,
        };
        const result = await this.client.request(query, options);
        (0, assert_1.default)(result.project, `Project ${projectPath} was not found.`);
        const discussions = ((_a = result.project.issue) === null || _a === void 0 ? void 0 : _a.discussions) || ((_b = result.project.mergeRequest) === null || _b === void 0 ? void 0 : _b.discussions);
        (0, assert_1.default)(discussions, `Discussions for issuable ${issuable.references.full} were not found.`);
        if ((_c = discussions.pageInfo) === null || _c === void 0 ? void 0 : _c.hasNextPage) {
            (0, assert_1.default)(discussions.pageInfo.endCursor);
            const remainingPages = await this.getDiscussions({
                issuable,
                endCursor: discussions.pageInfo.endCursor,
            });
            return [...discussions.nodes, ...remainingPages];
        }
        return discussions.nodes.map(n => this.addHostToUrl(n, projectPath));
    }
    async canUserCommentOnMr(mr) {
        return (0, if_version_gte_1.ifVersionGte)(await this.getVersion(), constants_1.REQUIRED_VERSIONS.MR_DISCUSSIONS, async () => {
            var _a, _b;
            const projectPath = getProjectPath(mr);
            const queryOptions = {
                projectPath,
                iid: String(mr.iid),
            };
            const result = await this.client.request(mr_permission_1.getMrPermissionsQuery, queryOptions);
            (0, assert_1.default)((_a = result === null || result === void 0 ? void 0 : result.project) === null || _a === void 0 ? void 0 : _a.mergeRequest, `MR ${mr.references.full} was not found.`);
            return Boolean((_b = result.project.mergeRequest.userPermissions) === null || _b === void 0 ? void 0 : _b.createNote);
        }, () => false);
    }
    async setResolved(replyId, resolved) {
        await this.validateVersion('MR Discussions', constants_1.REQUIRED_VERSIONS.MR_DISCUSSIONS);
        try {
            return await this.client.request(discussionSetResolved, {
                replyId,
                resolved,
            });
        }
        catch (e) {
            throw new user_friendly_error_1.UserFriendlyError(`Couldn't ${resolved ? 'resolve' : 'unresolve'} the discussion when calling the API.
        For more information, review the extension logs.`, e);
        }
    }
    async getLabelEvents(issuable) {
        const type = (0, is_mr_1.isMr)(issuable) ? 'merge_requests' : 'issues';
        const labelEventsUrl = `${this.instanceUrl}/api/v4/projects/${issuable.project_id}/${type}/${issuable.iid}/resource_label_events?sort=asc&per_page=100`;
        const result = await (0, cross_fetch_1.default)(labelEventsUrl, this.fetchOptions);
        if (!result.ok) {
            throw new fetch_error_1.FetchError(`Fetching file from ${labelEventsUrl} failed`, result);
        }
        return result.json();
    }
    async getDiscussionsAndLabelEvents(issuable) {
        const [discussions, labelEvents] = await Promise.all([
            this.getDiscussions({ issuable }),
            this.getLabelEvents(issuable),
        ]);
        const combinedEvents = [...discussions, ...labelEvents];
        combinedEvents.sort((a, b) => {
            const aCreatedAt = isLabelEvent(a) ? a.created_at : a.createdAt;
            const bCreatedAt = isLabelEvent(b) ? b.created_at : b.createdAt;
            return aCreatedAt < bCreatedAt ? -1 : 1;
        });
        return combinedEvents;
    }
    async createNote(issuable, body, replyId) {
        await this.validateVersion('MR Discussions', constants_1.REQUIRED_VERSIONS.MR_DISCUSSIONS);
        try {
            const result = await this.client.request(createNoteMutation, {
                issuableId: getIssuableGqlId(issuable),
                body,
                replyId,
            });
            if (result.createNote.errors.length > 0) {
                throw new Error(result.createNote.errors.join(','));
            }
            (0, assert_1.default)(result.createNote.note);
            return result.createNote.note;
        }
        catch (error) {
            throw new user_friendly_error_1.UserFriendlyError(`Couldn't create the comment when calling the API.
      For more information, review the extension logs.`, error);
        }
    }
    async deleteNote(noteId) {
        await this.validateVersion('MR Discussions', constants_1.REQUIRED_VERSIONS.MR_DISCUSSIONS);
        try {
            await this.client.request(deleteNoteMutation, {
                noteId,
            });
        }
        catch (e) {
            throw new user_friendly_error_1.UserFriendlyError(`Couldn't delete the comment when calling the API.
        For more information, review the extension logs.`, e);
        }
    }
    /**
     * This method is used only as a replacement of optimistic locking when updating a note.
     * We request the latest note to validate that it hasn't changed since we last saw it.
     */
    async getMrNote(mr, noteId) {
        await this.validateVersion('MR Discussions', constants_1.REQUIRED_VERSIONS.MR_DISCUSSIONS);
        const noteUrl = `${this.instanceUrl}/api/v4/projects/${mr.project_id}/merge_requests/${mr.iid}/notes/${noteId}`;
        const result = await (0, cross_fetch_1.default)(noteUrl, this.fetchOptions);
        if (!result.ok) {
            throw new fetch_error_1.FetchError(`Fetching the latest note from ${noteUrl} failed`, result);
        }
        return result.json();
    }
    async updateNoteBody(noteGqlId, body, originalBody, mr) {
        await this.validateVersion('MR Discussions', constants_1.REQUIRED_VERSIONS.MR_DISCUSSIONS);
        const latestNote = await this.getMrNote(mr, (0, get_rest_id_from_graphql_id_1.getRestIdFromGraphQLId)(noteGqlId));
        // This check is the best workaround we can do in the lack of optimistic locking
        // Issue to make this check in the GitLab instance: https://gitlab.com/gitlab-org/gitlab/-/issues/323808
        if (latestNote.body !== originalBody) {
            throw new user_friendly_error_1.UserFriendlyError(`This comment changed after you last viewed it, and can't be edited.
        Your new comment is NOT lost. To retrieve it, edit the comment again and copy your comment text,
        then update the original comment by opening the sidebar and running the
        "GitLab: Refresh sidebar" command.`, new Error(`You last saw:\n"${originalBody}"\nbut the latest version is:\n"${latestNote.body}"`));
        }
        try {
            await this.client.request(updateNoteBodyMutation, {
                noteId: noteGqlId,
                body,
            });
        }
        catch (e) {
            throw new user_friendly_error_1.UserFriendlyError(`Couldn't update the comment when calling the API.
        Your draft hasn't been lost. To see it, edit the comment.
        For more information, review the extension logs.`, e);
        }
    }
    async createDiffNote(mrId, body, position) {
        var _a, _b;
        await this.validateVersion('MR Discussions', constants_1.REQUIRED_VERSIONS.MR_DISCUSSIONS);
        try {
            const result = await this.client.request(create_diff_comment_1.createDiffNoteMutation, {
                issuableId: getMrGqlId(mrId),
                body,
                position,
            });
            (0, assert_1.default)((_b = (_a = result === null || result === void 0 ? void 0 : result.createDiffNote) === null || _a === void 0 ? void 0 : _a.note) === null || _b === void 0 ? void 0 : _b.discussion, `Response doesn't contain a note with discussion: ${JSON.stringify(result)}`);
            return result.createDiffNote.note.discussion;
        }
        catch (e) {
            throw new user_friendly_error_1.UserFriendlyError(`Unable to add comment. Try again.`, new Error(`MR(${mrId}), ${JSON.stringify(position)}, ${e}`));
        }
    }
    async validateCIConfig(project, content) {
        await this.validateVersion('CI config validation', constants_1.REQUIRED_VERSIONS.CI_CONFIG_VALIDATIONS);
        const response = await (0, cross_fetch_1.default)(`${this.instanceUrl}/api/v4/projects/${project.restId}/ci/lint`, {
            ...this.fetchOptions,
            headers: { ...this.fetchOptions.headers, 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ content }),
        });
        if (!response.ok)
            throw new fetch_error_1.FetchError(`Request to validate the CI config failed`, response);
        return response.json();
    }
    async validateVersion(featureName, requiredVersion) {
        const currentVersion = await this.getVersion();
        await (0, if_version_gte_1.ifVersionGte)(currentVersion, requiredVersion, () => undefined, () => {
            throw new unsupported_version_error_1.UnsupportedVersionError(featureName, currentVersion, requiredVersion);
        });
    }
}
exports.GitLabNewService = GitLabNewService;
//# sourceMappingURL=gitlab_new_service.js.map