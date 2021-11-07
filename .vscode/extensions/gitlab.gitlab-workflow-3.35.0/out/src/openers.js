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
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareCurrentBranch = exports.openCurrentPipeline = exports.openProjectPage = exports.openCreateNewMr = exports.openCreateNewIssue = exports.openCurrentMergeRequest = exports.copyLinkToActiveFile = exports.openActiveFile = exports.showMergeRequests = exports.showIssues = exports.openUrl = void 0;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const gitLabService = __importStar(require("./gitlab_service"));
const command_names_1 = require("./command_names");
const openUrl = async (url) => vscode.commands.executeCommand(command_names_1.VS_COMMANDS.OPEN, vscode.Uri.parse(url));
exports.openUrl = openUrl;
/**
 * Fetches user and project before opening a link.
 * Link can contain some placeholders which will be replaced by this method
 * with relevant information. Implemented placeholders below.
 *
 * $projectUrl
 * $userId
 *
 * An example link is `$projectUrl/issues?assignee_id=$userId` which will be
 * `gitlab.com/gitlab-org/gitlab-ce/issues?assignee_id=502136`.
 *
 * @param {string} linkTemplate
 * @param {GitLabRepository} repository with valid gitlab project
 */
async function getLink(linkTemplate, repository) {
    const user = await gitLabService.fetchCurrentUser(repository.rootFsPath);
    const project = await repository.getProject();
    return linkTemplate.replace('$userId', user.id.toString()).replace('$projectUrl', project.webUrl);
}
async function openTemplatedLink(linkTemplate, repository) {
    await (0, exports.openUrl)(await getLink(linkTemplate, repository));
}
const showIssues = async (gitlabRepository) => {
    await openTemplatedLink('$projectUrl/issues?assignee_id=$userId', gitlabRepository);
};
exports.showIssues = showIssues;
const showMergeRequests = async (gitlabRepository) => {
    await openTemplatedLink('$projectUrl/merge_requests?assignee_id=$userId', gitlabRepository);
};
exports.showMergeRequests = showMergeRequests;
async function getActiveFile({ repository, activeEditor }) {
    const branchName = await repository.getTrackingBranchName();
    const filePath = path
        .relative(repository.rootFsPath, activeEditor.document.uri.fsPath)
        .replace(/\\/g, '/');
    const project = await repository.getProject();
    const fileUrl = `${project.webUrl}/blob/${encodeURIComponent(branchName)}/${filePath}`;
    let anchor = '';
    if (activeEditor.selection) {
        const { start, end } = activeEditor.selection;
        anchor = `#L${start.line + 1}`;
        if (end.line > start.line) {
            anchor += `-${end.line + 1}`;
        }
    }
    return `${fileUrl}${anchor}`;
}
const openActiveFile = async (repositoryWithProjectFile) => {
    await (0, exports.openUrl)(await getActiveFile(repositoryWithProjectFile));
};
exports.openActiveFile = openActiveFile;
const copyLinkToActiveFile = async (repositoryWithProjectFile) => {
    const fileUrl = await getActiveFile(repositoryWithProjectFile);
    await vscode.env.clipboard.writeText(fileUrl);
};
exports.copyLinkToActiveFile = copyLinkToActiveFile;
const openCurrentMergeRequest = async (gitlabRepository) => {
    const mr = await gitLabService.fetchOpenMergeRequestForCurrentBranch(gitlabRepository.rootFsPath);
    if (mr) {
        await (0, exports.openUrl)(mr.web_url);
    }
};
exports.openCurrentMergeRequest = openCurrentMergeRequest;
const openCreateNewIssue = async (gitlabRepository) => {
    await openTemplatedLink('$projectUrl/issues/new', gitlabRepository);
};
exports.openCreateNewIssue = openCreateNewIssue;
const openCreateNewMr = async (gitlabRepository) => {
    const project = await gitlabRepository.getProject();
    const branchName = await gitlabRepository.getTrackingBranchName();
    await (0, exports.openUrl)(`${project.webUrl}/merge_requests/new?merge_request%5Bsource_branch%5D=${encodeURIComponent(branchName)}`);
};
exports.openCreateNewMr = openCreateNewMr;
const openProjectPage = async (gitlabRepository) => {
    await openTemplatedLink('$projectUrl', gitlabRepository);
};
exports.openProjectPage = openProjectPage;
async function openCurrentPipeline(repositoryRoot) {
    const { pipeline } = await gitLabService.fetchPipelineAndMrForCurrentBranch(repositoryRoot);
    if (pipeline) {
        await (0, exports.openUrl)(pipeline.web_url);
    }
}
exports.openCurrentPipeline = openCurrentPipeline;
const compareCurrentBranch = async (gitlabRepository) => {
    const project = await gitlabRepository.getProject();
    if (gitlabRepository.lastCommitSha) {
        await (0, exports.openUrl)(`${project.webUrl}/compare/master...${gitlabRepository.lastCommitSha}`);
    }
};
exports.compareCurrentBranch = compareCurrentBranch;
//# sourceMappingURL=openers.js.map