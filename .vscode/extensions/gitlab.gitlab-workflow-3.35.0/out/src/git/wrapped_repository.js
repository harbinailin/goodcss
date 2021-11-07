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
exports.WrappedRepository = void 0;
const url = __importStar(require("url"));
const path_1 = require("path");
const assert_1 = __importDefault(require("assert"));
const constants_1 = require("../constants");
const token_service_1 = require("../services/token_service");
const log_1 = require("../log");
const git_remote_parser_1 = require("./git_remote_parser");
const extension_configuration_1 = require("../utils/extension_configuration");
const gitlab_new_service_1 = require("../gitlab/gitlab_new_service");
function intersectionOfInstanceAndTokenUrls(gitRemoteHosts) {
    const instanceUrls = token_service_1.tokenService.getInstanceUrls();
    return instanceUrls.filter(instanceUrl => gitRemoteHosts.includes(url.parse(instanceUrl).host || ''));
}
function heuristicInstanceUrl(gitRemoteHosts) {
    // if the intersection of git remotes and configured PATs exists and is exactly
    // one hostname, use it
    const intersection = intersectionOfInstanceAndTokenUrls(gitRemoteHosts);
    if (intersection.length === 1) {
        const heuristicUrl = intersection[0];
        (0, log_1.log)(`Found ${heuristicUrl} in the PAT list and git remotes, using it as the instanceUrl`);
        return heuristicUrl;
    }
    if (intersection.length > 1) {
        (0, log_1.log)(`Found more than one intersection of git remotes and configured PATs, ${intersection}`);
    }
    return null;
}
function getInstanceUrlFromRemotes(gitRemoteUrls) {
    const { instanceUrl } = (0, extension_configuration_1.getExtensionConfiguration)();
    // if the workspace setting exists, use it
    if (instanceUrl) {
        return instanceUrl;
    }
    // try to determine the instance URL heuristically
    const gitRemoteHosts = gitRemoteUrls
        .map((uri) => { var _a; return (_a = (0, git_remote_parser_1.parseGitRemote)(uri)) === null || _a === void 0 ? void 0 : _a.host; })
        .filter((h) => Boolean(h));
    const heuristicUrl = heuristicInstanceUrl(gitRemoteHosts);
    if (heuristicUrl) {
        return heuristicUrl;
    }
    // default to Gitlab cloud
    return constants_1.GITLAB_COM_URL;
}
class WrappedRepository {
    constructor(rawRepository) {
        this.mrCache = {};
        this.rawRepository = rawRepository;
    }
    get remoteName() {
        var _a;
        if (this.remoteNames.length === 0) {
            (0, log_1.log)(`Repository ${this.rootFsPath} doesn't have any remotes.`);
            return undefined;
        }
        if (this.remoteNames.length === 1) {
            return this.remoteNames[0];
        }
        const preferred = (_a = (0, extension_configuration_1.getRepositorySettings)(this.rootFsPath)) === null || _a === void 0 ? void 0 : _a.preferredRemoteName;
        if (!preferred) {
            (0, log_1.log)(`No preferred remote for ${this.rootFsPath}.`);
            return undefined;
        }
        if (!this.remoteNames.includes(preferred)) {
            (0, log_1.log)(`Saved preferred remote ${preferred} doesn't exist in repository ${this.rootFsPath}`);
            return undefined;
        }
        return preferred;
    }
    get remoteNames() {
        return this.rawRepository.state.remotes.map(r => r.name);
    }
    async fetch() {
        await this.rawRepository.fetch();
    }
    async checkout(branchName) {
        await this.rawRepository.checkout(branchName);
        (0, assert_1.default)(this.rawRepository.state.HEAD, "We can't read repository HEAD. We suspect that your `git head` command fails and we can't continue till it succeeds");
        const currentBranchName = this.rawRepository.state.HEAD.name;
        (0, assert_1.default)(currentBranchName === branchName, `The branch name after the checkout (${currentBranchName}) is not the branch that the extension tried to check out (${branchName}). Inspect your repository before making any more changes.`);
    }
    getRemoteByName(remoteName) {
        var _a;
        const remoteUrl = (_a = this.rawRepository.state.remotes.find(r => r.name === remoteName)) === null || _a === void 0 ? void 0 : _a.fetchUrl;
        (0, assert_1.default)(remoteUrl, `could not find any URL for git remote with name '${this.remoteName}'`);
        const parsedRemote = (0, git_remote_parser_1.parseGitRemote)(remoteUrl, this.instanceUrl);
        (0, assert_1.default)(parsedRemote, `git remote "${remoteUrl}" could not be parsed`);
        return parsedRemote;
    }
    async getProject() {
        if (!this.remote)
            return undefined;
        if (!this.cachedProject) {
            const { namespace, project } = this.remote;
            this.cachedProject = await this.getGitLabService().getProject(`${namespace}/${project}`);
        }
        return this.cachedProject;
    }
    get containsGitLabProject() {
        return Boolean(this.cachedProject);
    }
    get branch() {
        var _a;
        return (_a = this.rawRepository.state.HEAD) === null || _a === void 0 ? void 0 : _a.name;
    }
    async reloadMr(mr) {
        const mrVersion = await this.getGitLabService().getMrDiff(mr);
        const cachedMr = {
            mr,
            mrVersion,
        };
        this.mrCache[mr.id] = cachedMr;
        return cachedMr;
    }
    getMr(id) {
        return this.mrCache[id];
    }
    get remote() {
        if (!this.remoteName)
            return undefined;
        return this.getRemoteByName(this.remoteName);
    }
    get lastCommitSha() {
        var _a;
        return (_a = this.rawRepository.state.HEAD) === null || _a === void 0 ? void 0 : _a.commit;
    }
    get instanceUrl() {
        const remoteUrls = this.rawRepository.state.remotes
            .map(r => r.fetchUrl)
            .filter((r) => Boolean(r));
        return getInstanceUrlFromRemotes(remoteUrls);
    }
    getGitLabService() {
        return new gitlab_new_service_1.GitLabNewService(this.instanceUrl);
    }
    get name() {
        var _a, _b;
        return (_b = (_a = this.cachedProject) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : (0, path_1.basename)(this.rawRepository.rootUri.fsPath);
    }
    get rootFsPath() {
        return this.rawRepository.rootUri.fsPath;
    }
    async getFileContent(path, sha) {
        // even on Windows, the git show command accepts only POSIX paths
        const absolutePath = (0, path_1.join)(this.rootFsPath, path).replace(/\\/g, '/');
        // null sufficiently signalises that the file has not been found
        // this scenario is going to happen often (for open and squashed MRs)
        return this.rawRepository.show(sha, absolutePath).catch(() => null);
    }
    async diff() {
        return this.rawRepository.diff();
    }
    async apply(patchPath) {
        return this.rawRepository.apply(patchPath);
    }
    async getTrackingBranchName() {
        var _a;
        const branchName = (_a = this.rawRepository.state.HEAD) === null || _a === void 0 ? void 0 : _a.name;
        (0, assert_1.default)(branchName, 'The repository seems to be in a detached HEAD state. Please checkout a branch.');
        const trackingBranch = await this.rawRepository
            .getConfig(`branch.${branchName}.merge`)
            .catch(() => ''); // the tracking branch is going to be empty most of the time, we'll swallow the error instead of logging it every time
        return trackingBranch.replace('refs/heads/', '') || branchName;
    }
    /**
     * Compares, whether this wrapper contains repository for the
     * same folder as the method argument.
     *
     * The VS Code Git extension can produce more instances of `Repository`
     * interface for the same git folder. We can't simply compare references with `===`.
     */
    hasSameRootAs(repository) {
        return this.rootFsPath === repository.rootUri.fsPath;
    }
    getVersion() {
        return this.getGitLabService().getVersion();
    }
}
exports.WrappedRepository = WrappedRepository;
//# sourceMappingURL=wrapped_repository.js.map