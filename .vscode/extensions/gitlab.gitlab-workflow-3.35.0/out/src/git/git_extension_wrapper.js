"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
exports.gitExtensionWrapper = exports.GitExtensionWrapper = void 0;
const assert_1 = __importDefault(require("assert"));
const vscode = __importStar(require("vscode"));
const gitlab_credentials_provider_1 = require("../gitlab/clone/gitlab_credentials_provider");
const gitlab_remote_source_provider_repository_1 = require("../gitlab/clone/gitlab_remote_source_provider_repository");
const wrapped_repository_1 = require("./wrapped_repository");
const log_1 = require("../log");
class GitExtensionWrapper {
    constructor() {
        this.apiListeners = [];
        this.wrappedRepositories = [];
        this.repositoryCountChangedEmitter = new vscode.EventEmitter();
        /** Gets triggered when user adds or removes repository or when user enables and disables the git extension */
        this.onRepositoryCountChanged = this.repositoryCountChangedEmitter.event;
    }
    async onDidChangeGitExtensionEnablement(enabled) {
        var _a, _b;
        if (enabled) {
            this.register();
            await this.addRepositories((_b = (_a = this.gitApi) === null || _a === void 0 ? void 0 : _a.repositories) !== null && _b !== void 0 ? _b : []);
        }
        else {
            this.wrappedRepositories = [];
            this.repositoryCountChangedEmitter.fire();
            this.disposeApiListeners();
        }
    }
    get gitBinaryPath() {
        var _a;
        const path = (_a = this.gitApi) === null || _a === void 0 ? void 0 : _a.git.path;
        (0, assert_1.default)(path, 'Could not get git binary path from the Git extension.');
        return path;
    }
    get repositories() {
        return this.wrappedRepositories;
    }
    getRepository(repositoryRoot) {
        var _a;
        const rawRepository = (_a = this.gitApi) === null || _a === void 0 ? void 0 : _a.getRepository(vscode.Uri.file(repositoryRoot));
        (0, assert_1.default)(rawRepository, `Git Extension doesn't have repository with root ${repositoryRoot}`);
        const result = this.repositories.find(r => r.hasSameRootAs(rawRepository));
        (0, assert_1.default)(result, `GitExtensionWrapper is missing repository for ${repositoryRoot}`);
        return result;
    }
    register() {
        (0, assert_1.default)(this.gitExtension);
        try {
            this.gitApi = this.gitExtension.getAPI(1);
            [
                new gitlab_remote_source_provider_repository_1.GitLabRemoteSourceProviderRepository(this.gitApi),
                this.gitApi.registerCredentialsProvider(gitlab_credentials_provider_1.gitlabCredentialsProvider),
                this.gitApi.onDidOpenRepository(r => this.addRepositories([r])),
                this.gitApi.onDidCloseRepository(r => this.removeRepository(r)),
            ];
        }
        catch (err) {
            (0, log_1.handleError)(err);
        }
    }
    async addRepositories(repositories) {
        await Promise.all(repositories.map(r => r.status())); // make sure the repositories are initialized
        this.wrappedRepositories = [
            ...this.wrappedRepositories,
            ...repositories.map(r => new wrapped_repository_1.WrappedRepository(r)),
        ];
        this.repositoryCountChangedEmitter.fire();
    }
    removeRepository(repository) {
        this.wrappedRepositories = this.wrappedRepositories.filter(wr => !wr.hasSameRootAs(repository));
        this.repositoryCountChangedEmitter.fire();
    }
    disposeApiListeners() {
        this.gitApi = undefined;
        this.apiListeners.forEach(d => d === null || d === void 0 ? void 0 : d.dispose());
        this.apiListeners = [];
    }
    dispose() {
        var _a;
        this.disposeApiListeners();
        (_a = this.enablementListener) === null || _a === void 0 ? void 0 : _a.dispose();
    }
    async init() {
        var _a;
        try {
            this.gitExtension = (_a = vscode.extensions.getExtension('vscode.git')) === null || _a === void 0 ? void 0 : _a.exports;
            if (!this.gitExtension) {
                (0, log_1.log)('Could not get Git Extension');
                return;
            }
            this.enablementListener = this.gitExtension.onDidChangeEnablement(this.onDidChangeGitExtensionEnablement, this);
            await this.onDidChangeGitExtensionEnablement(this.gitExtension.enabled);
        }
        catch (error) {
            (0, log_1.handleError)(error);
        }
    }
    getRepositoryForActiveEditor() {
        var _a;
        const editor = vscode.window.activeTextEditor;
        if (!(editor === null || editor === void 0 ? void 0 : editor.document.uri)) {
            return undefined;
        }
        const repositoryForActiveFile = (_a = this.gitApi) === null || _a === void 0 ? void 0 : _a.getRepository(editor.document.uri);
        if (!repositoryForActiveFile)
            return undefined;
        return this.repositories.find(wr => wr.hasSameRootAs(repositoryForActiveFile));
    }
    /**
     * This method doesn't require any user input and should be used only for automated functionality.
     * (e.g. periodical status bar refresh). If there is any uncertainty about which repository to choose,
     * (i.e. there's multiple repositories and no open editor) we return undefined.
     */
    getActiveRepository() {
        const activeEditorRepository = this.getRepositoryForActiveEditor();
        if (activeEditorRepository) {
            return activeEditorRepository;
        }
        if (this.repositories.length === 1) {
            return this.repositories[0];
        }
        return undefined;
    }
    /**
     * Returns active repository, user-selected repository or undefined if there
     * are no repositories or user didn't select one.
     */
    async getActiveRepositoryOrSelectOne() {
        const activeRepository = this.getActiveRepository();
        if (activeRepository) {
            return activeRepository;
        }
        if (this.repositories.length === 0) {
            return undefined;
        }
        const repositoryOptions = this.repositories.map(wr => ({
            label: wr.name,
            repository: wr,
        }));
        const selection = await vscode.window.showQuickPick(repositoryOptions, {
            placeHolder: 'Select a repository',
        });
        return selection === null || selection === void 0 ? void 0 : selection.repository;
    }
}
exports.GitExtensionWrapper = GitExtensionWrapper;
exports.gitExtensionWrapper = new GitExtensionWrapper();
//# sourceMappingURL=git_extension_wrapper.js.map