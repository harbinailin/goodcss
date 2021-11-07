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
exports.renderMarkdown = exports.createSnippet = exports.fetchMRIssues = exports.handlePipelineAction = exports.fetchPipelineAndMrForCurrentBranch = exports.fetchLastPipelineForMr = exports.fetchOpenMergeRequestForCurrentBranch = exports.fetchJobsForPipeline = exports.fetchIssuables = exports.fetchVersion = exports.fetchCurrentUser = exports.fetchCurrentPipelineProject = void 0;
const vscode = __importStar(require("vscode"));
const request_promise_1 = __importDefault(require("request-promise"));
const token_service_1 = require("./services/token_service");
const user_friendly_error_1 = require("./errors/user_friendly_error");
const api_error_1 = require("./errors/api_error");
const log_1 = require("./log");
const get_user_agent_header_1 = require("./utils/get_user_agent_header");
const custom_query_type_1 = require("./gitlab/custom_query_type");
const ensure_absolute_avatar_url_1 = require("./utils/ensure_absolute_avatar_url");
const get_http_agent_options_1 = require("./utils/get_http_agent_options");
const get_instance_url_1 = require("./utils/get_instance_url");
const git_extension_wrapper_1 = require("./git/git_extension_wrapper");
const extension_configuration_1 = require("./utils/extension_configuration");
const constants_1 = require("./constants");
const help_error_1 = require("./errors/help_error");
const normalizeAvatarUrl = (instanceUrl) => (issuable) => {
    const { author } = issuable;
    if (!author.avatar_url) {
        return issuable;
    }
    return {
        ...issuable,
        author: {
            ...author,
            avatar_url: (0, ensure_absolute_avatar_url_1.ensureAbsoluteAvatarUrl)(instanceUrl, author.avatar_url),
        },
    };
};
let versionCache = null;
async function fetch(repositoryRoot, path, method = 'GET', data) {
    const instanceUrl = await (0, get_instance_url_1.getInstanceUrl)(repositoryRoot);
    const apiRoot = `${instanceUrl}/api/v4`;
    const glToken = token_service_1.tokenService.getToken(instanceUrl);
    const tokens = token_service_1.tokenService.getInstanceUrls().join(', ');
    if (!glToken) {
        let err = `
      GitLab Workflow: Cannot make request.
      GitLab URL for this workspace is set to ${instanceUrl}
      and there is no matching token for this URL.
    `;
        if (tokens.length) {
            err = `${err} You have configured tokens for ${tokens}.`;
        }
        throw new help_error_1.HelpError(err, { section: constants_1.README_SECTIONS.SETUP });
    }
    const config = {
        method,
        headers: {
            'PRIVATE-TOKEN': glToken,
            ...(0, get_user_agent_header_1.getUserAgentHeader)(),
        },
        ...(0, get_http_agent_options_1.getHttpAgentOptions)(),
    };
    if (data) {
        config.formData = data;
    }
    config.transform = (body, response) => {
        try {
            return {
                response: JSON.parse(body),
                headers: response.headers,
            };
        }
        catch (e) {
            (0, log_1.handleError)(new user_friendly_error_1.UserFriendlyError('Failed to parse GitLab API response', e, `Response body: ${body}\nRequest URL: ${apiRoot}${path}`));
            return { error: e };
        }
    };
    return (0, request_promise_1.default)(`${apiRoot}${path}`, config);
}
async function fetchCurrentProject(repositoryRoot) {
    var _a;
    try {
        const repository = git_extension_wrapper_1.gitExtensionWrapper.getRepository(repositoryRoot);
        return (_a = (await repository.getProject())) !== null && _a !== void 0 ? _a : null;
    }
    catch (e) {
        throw new api_error_1.ApiError(e, 'get current project');
    }
}
async function fetchCurrentProjectSwallowError(repositoryRoot) {
    try {
        return await fetchCurrentProject(repositoryRoot);
    }
    catch (error) {
        (0, log_1.logError)(error);
        return null;
    }
}
async function fetchCurrentPipelineProject(repositoryRoot) {
    var _a, _b;
    try {
        const repository = git_extension_wrapper_1.gitExtensionWrapper.getRepository(repositoryRoot);
        const { pipelineGitRemoteName } = (0, extension_configuration_1.getExtensionConfiguration)();
        if (pipelineGitRemoteName) {
            const { namespace, project } = repository.getRemoteByName(pipelineGitRemoteName);
            return (_a = (await repository.getGitLabService().getProject(`${namespace}/${project}`))) !== null && _a !== void 0 ? _a : null;
        }
        return (_b = (await repository.getProject())) !== null && _b !== void 0 ? _b : null;
    }
    catch (e) {
        (0, log_1.logError)(e);
        return null;
    }
}
exports.fetchCurrentPipelineProject = fetchCurrentPipelineProject;
async function fetchCurrentUser(repositoryRoot) {
    try {
        const { response: user } = await fetch(repositoryRoot, '/user');
        if (!user)
            throw new Error('Could not retrieve current user.');
        return user;
    }
    catch (e) {
        throw new api_error_1.ApiError(e, 'get current user');
    }
}
exports.fetchCurrentUser = fetchCurrentUser;
async function fetchFirstUserByUsername(repositoryRoot, userName) {
    try {
        const { response: users } = await fetch(repositoryRoot, `/users?username=${userName}`);
        return users[0];
    }
    catch (e) {
        (0, log_1.handleError)(new user_friendly_error_1.UserFriendlyError('Error when fetching GitLab user.', e));
        return undefined;
    }
}
async function fetchVersion(repositoryRoot) {
    try {
        if (!versionCache) {
            const { response } = await fetch(repositoryRoot, '/version');
            versionCache = response.version;
        }
    }
    catch (e) {
        (0, log_1.handleError)(e);
    }
    return versionCache;
}
exports.fetchVersion = fetchVersion;
async function fetchLastPipelineForCurrentBranch(repositoryRoot) {
    const project = await fetchCurrentPipelineProject(repositoryRoot);
    if (!project) {
        return undefined;
    }
    const branchName = await git_extension_wrapper_1.gitExtensionWrapper
        .getRepository(repositoryRoot)
        .getTrackingBranchName();
    const pipelinesRootPath = `/projects/${project.restId}/pipelines`;
    const { response: pipelines } = await fetch(repositoryRoot, `${pipelinesRootPath}?ref=${encodeURIComponent(branchName)}`);
    return pipelines.length > 0 ? pipelines[0] : null;
}
async function fetchIssuables(params, repositoryRoot) {
    var _a;
    const { type, scope, state, author, assignee, wip } = params;
    let { searchIn, pipelineId, reviewer } = params;
    const config = {
        type: type || 'merge_requests',
        scope: scope || 'all',
        state: state || 'opened',
    };
    let issuable = null;
    const version = await fetchVersion(repositoryRoot);
    const project = await fetchCurrentProjectSwallowError(repositoryRoot);
    if (!version || !project)
        return [];
    if (config.type === 'vulnerabilities' && config.scope !== 'dismissed') {
        config.scope = 'all';
    }
    else if ((config.type === 'issues' || config.type === 'merge_requests') &&
        config.scope !== 'assigned_to_me' &&
        config.scope !== 'created_by_me') {
        config.scope = 'all';
    }
    // Normalize scope parameter for version < 11 instances.
    const [major] = version.split('.');
    if (parseInt(major, 10) < 11) {
        config.scope = config.scope.replace(/_/g, '-');
    }
    let path = '';
    const search = new URLSearchParams();
    search.append('state', config.state);
    /**
     * Set path based on config.type
     */
    if (config.type === 'epics') {
        if (project.groupRestId) {
            path = `/groups/${project.groupRestId}/${config.type}`;
            search.append('include_ancestor_groups', 'true');
        }
        else {
            return [];
        }
    }
    else {
        const searchKind = config.type === custom_query_type_1.CustomQueryType.VULNERABILITY ? 'vulnerability_findings' : config.type;
        path = `/projects/${project.restId}/${searchKind}`;
        search.append('scope', config.scope);
    }
    /**
     * Author parameters
     */
    if (config.type === 'issues') {
        if (author) {
            search.append('author_username', author);
        }
    }
    else if (author) {
        const authorUser = await fetchFirstUserByUsername(repositoryRoot, author);
        search.append('author_id', (authorUser && authorUser.id) || '-1');
    }
    /**
     * Assignee parameters
     */
    if (assignee === 'Any' || assignee === 'None') {
        search.append('assignee_id', assignee);
    }
    else if (assignee && config.type === 'issues') {
        search.append('assignee_username', assignee);
    }
    else if (assignee) {
        const assigneeUser = await fetchFirstUserByUsername(repositoryRoot, assignee);
        search.append('assignee_id', (assigneeUser && assigneeUser.id) || '-1');
    }
    /**
     * Reviewer parameters
     */
    if (reviewer) {
        if (reviewer === '<current_user>') {
            const user = await fetchCurrentUser(repositoryRoot);
            reviewer = user.username;
        }
        search.append('reviewer_username', reviewer);
    }
    /**
     * Search in parameters
     */
    if (searchIn) {
        if (searchIn === 'all') {
            searchIn = 'title,description';
        }
        search.append('in', searchIn);
    }
    /**
     * Handle WIP/Draft for merge_request config.type
     */
    if (config.type === 'merge_requests' && wip) {
        search.append('wip', wip);
    }
    /**
     * Query parameters related to issues
     */
    let issueQueryParams = {};
    if (config.type === 'issues') {
        issueQueryParams = {
            confidential: params.confidential,
            'not[labels]': params.excludeLabels,
            'not[milestone]': params.excludeMilestone,
            'not[author_username]': params.excludeAuthor,
            'not[assignee_username]': params.excludeAssignee,
            'not[search]': params.excludeSearch,
            'not[in]': params.excludeSearchIn,
        };
    }
    /**
     * Pipeline parameters
     */
    // FIXME: this 'branch' or actual numerical ID most likely doesn't make sense from user perspective
    //        Also, the logic allows for `pipeline_id=branch` query which doesn't make sense
    //        Issue to deprecate this filter: https://gitlab.com/gitlab-org/gitlab-vscode-extension/-/issues/311
    if (pipelineId) {
        if (pipelineId === 'branch') {
            pipelineId = (_a = (await fetchLastPipelineForCurrentBranch(repositoryRoot))) === null || _a === void 0 ? void 0 : _a.id;
        }
        search.append('pipeline_id', `${pipelineId}`);
    }
    /**
     * Miscellaneous parameters
     */
    const queryParams = {
        labels: params.labels,
        milestone: params.milestone,
        search: params.search,
        created_before: params.createdBefore,
        created_after: params.createdAfter,
        updated_before: params.updatedBefore,
        updated_after: params.updatedAfter,
        order_by: params.orderBy,
        sort: params.sort,
        per_page: params.maxResults,
        report_type: params.reportTypes,
        severity: params.severityLevels,
        confidence: params.confidenceLevels,
        ...issueQueryParams,
    };
    const usedQueryParamNames = Object.keys(queryParams).filter(k => queryParams[k]);
    usedQueryParamNames.forEach(name => search.append(name, `${queryParams[name]}`));
    const { response } = await fetch(repositoryRoot, `${path}?${search.toString()}`);
    issuable = response;
    return issuable.map(normalizeAvatarUrl(await (0, get_instance_url_1.getInstanceUrl)(repositoryRoot)));
}
exports.fetchIssuables = fetchIssuables;
async function fetchJobsForPipeline(repositoryRoot, pipeline) {
    const { response } = await fetch(repositoryRoot, `/projects/${pipeline.project_id}/pipelines/${pipeline.id}/jobs`);
    return response;
}
exports.fetchJobsForPipeline = fetchJobsForPipeline;
async function fetchOpenMergeRequestForCurrentBranch(repositoryRoot) {
    const project = await fetchCurrentProject(repositoryRoot);
    const branchName = await git_extension_wrapper_1.gitExtensionWrapper
        .getRepository(repositoryRoot)
        .getTrackingBranchName();
    const path = `/projects/${project === null || project === void 0 ? void 0 : project.restId}/merge_requests?state=opened&source_branch=${encodeURIComponent(branchName)}`;
    const { response } = await fetch(repositoryRoot, path);
    const mrs = response;
    if (mrs.length > 0) {
        return mrs[0];
    }
    return undefined;
}
exports.fetchOpenMergeRequestForCurrentBranch = fetchOpenMergeRequestForCurrentBranch;
async function fetchLastPipelineForMr(repositoryRoot, mr) {
    const path = `/projects/${mr.project_id}/merge_requests/${mr.iid}/pipelines`;
    const { response: pipelines } = await fetch(repositoryRoot, path);
    return pipelines[0];
}
exports.fetchLastPipelineForMr = fetchLastPipelineForMr;
async function fetchPipelineAndMrForCurrentBranch(repositoryRoot) {
    // TODO: implement more granular approach to errors (deciding between expected and critical)
    // This can be done when we migrate the code to gitlab_new_service.ts
    const turnErrorToUndefined = p => p.catch(e => {
        (0, log_1.logError)(e);
        return undefined;
    });
    const mr = await turnErrorToUndefined(fetchOpenMergeRequestForCurrentBranch(repositoryRoot));
    if (mr) {
        const pipeline = await turnErrorToUndefined(fetchLastPipelineForMr(repositoryRoot, mr));
        if (pipeline)
            return { mr, pipeline };
    }
    const pipeline = await turnErrorToUndefined(fetchLastPipelineForCurrentBranch(repositoryRoot));
    return { mr, pipeline };
}
exports.fetchPipelineAndMrForCurrentBranch = fetchPipelineAndMrForCurrentBranch;
/**
 * Cancels or retries last pipeline or creates a new pipeline for current branch.
 *
 * @param {string} action create|retry|cancel
 */
async function handlePipelineAction(action, repositoryRoot) {
    const { pipeline } = await fetchPipelineAndMrForCurrentBranch(repositoryRoot);
    const project = await fetchCurrentProjectSwallowError(repositoryRoot);
    if (pipeline && project) {
        let endpoint = `/projects/${project.restId}/pipelines/${pipeline.id}/${action}`;
        if (action === 'create') {
            const branchName = await git_extension_wrapper_1.gitExtensionWrapper
                .getRepository(repositoryRoot)
                .getTrackingBranchName();
            endpoint = `/projects/${project.restId}/pipeline?ref=${encodeURIComponent(branchName)}`;
        }
        try {
            const { response } = await fetch(repositoryRoot, endpoint, 'POST');
            return response;
        }
        catch (e) {
            throw new user_friendly_error_1.UserFriendlyError(`Failed to ${action} pipeline.`, e);
        }
    }
    else {
        await vscode.window.showErrorMessage('GitLab Workflow: No project or pipeline found.');
        return undefined;
    }
}
exports.handlePipelineAction = handlePipelineAction;
async function fetchMRIssues(mrId, repositoryRoot) {
    const project = await fetchCurrentProjectSwallowError(repositoryRoot);
    let issues = [];
    if (project) {
        try {
            const { response } = await fetch(repositoryRoot, `/projects/${project.restId}/merge_requests/${mrId}/closes_issues`);
            issues = response;
        }
        catch (e) {
            (0, log_1.logError)(e);
        }
    }
    return issues;
}
exports.fetchMRIssues = fetchMRIssues;
// TODO specify the correct interface when we convert `create_snippet.js`
async function createSnippet(repositoryRoot, data) {
    try {
        const { response } = await fetch(repositoryRoot, `/projects/${data.id}/snippets`, 'POST', data);
        return response;
    }
    catch (e) {
        throw new user_friendly_error_1.UserFriendlyError('Failed to create your snippet.', e);
    }
}
exports.createSnippet = createSnippet;
async function renderMarkdown(markdown, repositoryRoot) {
    let rendered = { html: markdown };
    const version = await fetchVersion(repositoryRoot);
    if (!version) {
        return markdown;
    }
    const [major] = version.split('.');
    if (parseInt(major, 10) < 11) {
        return markdown;
    }
    try {
        const project = await fetchCurrentProject(repositoryRoot);
        const { response } = await fetch(repositoryRoot, '/markdown', 'POST', {
            text: markdown,
            project: project === null || project === void 0 ? void 0 : project.fullPath,
            gfm: 'true', // Needs to be a string for the API
        });
        rendered = response;
    }
    catch (e) {
        (0, log_1.logError)(e);
        return markdown;
    }
    return rendered.html;
}
exports.renderMarkdown = renderMarkdown;
//# sourceMappingURL=gitlab_service.js.map