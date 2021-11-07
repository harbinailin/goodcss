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
exports.runWithValidProjectFile = exports.runWithValidProject = void 0;
const vscode = __importStar(require("vscode"));
const git_extension_wrapper_1 = require("../git/git_extension_wrapper");
const do_not_await_1 = require("../utils/do_not_await");
const extension_configuration_1 = require("../utils/extension_configuration");
const getRemoteOrSelectOne = async (repository) => {
    const { remote } = repository;
    if (remote)
        return remote;
    if (repository.remoteNames.length === 0) {
        throw new Error(`Repository "${repository.rootFsPath}" has no remotes. Add a git remote that points to a GitLab project to continue.`);
    }
    const result = await vscode.window.showQuickPick(repository.remoteNames.map(n => ({ label: n })), { placeHolder: 'Select which git remote contains your GitLab project.' });
    if (!result)
        return undefined;
    await (0, extension_configuration_1.setPreferredRemote)(repository.rootFsPath, result.label);
    (0, do_not_await_1.doNotAwait)(vscode.window.showInformationMessage(`Remote "${result.label}" has been added to your settings as your preferred remote.`));
    return repository.remote;
};
const ensureGitLabProject = async (repository) => {
    const remote = await getRemoteOrSelectOne(repository);
    if (!remote)
        return undefined;
    const project = await repository.getProject();
    if (!project)
        throw new Error(`Project "${remote.namespace}/${remote.project}" was not found on "${repository.instanceUrl}" GitLab instance.
      Make sure your git remote points to an existing GitLab project.`);
    return repository;
};
const runWithValidProject = (command) => {
    return async () => {
        const repository = await git_extension_wrapper_1.gitExtensionWrapper.getActiveRepositoryOrSelectOne();
        if (!repository) {
            return undefined;
        }
        const repositoryWithProject = await ensureGitLabProject(repository);
        if (!repositoryWithProject)
            return undefined;
        return command(repositoryWithProject);
    };
};
exports.runWithValidProject = runWithValidProject;
const runWithValidProjectFile = (command) => {
    return async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            await vscode.window.showInformationMessage('GitLab Workflow: No open file.');
            return undefined;
        }
        const repository = git_extension_wrapper_1.gitExtensionWrapper.getActiveRepository();
        if (!repository) {
            await vscode.window.showInformationMessage('GitLab Workflow: Open file isn’t part of a repository.');
            return undefined;
        }
        const gitlabRepository = await ensureGitLabProject(repository);
        if (!gitlabRepository)
            return undefined;
        return command({ activeEditor, repository: gitlabRepository });
    };
};
exports.runWithValidProjectFile = runWithValidProjectFile;
//# sourceMappingURL=run_with_valid_project.js.map