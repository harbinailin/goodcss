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
exports.currentBranchRefresher = exports.CurrentBranchRefresher = void 0;
const vscode = __importStar(require("vscode"));
const assert_1 = __importDefault(require("assert"));
const dayjs_1 = __importDefault(require("dayjs"));
const gitLabService = __importStar(require("./gitlab_service"));
const log_1 = require("./log");
const extension_state_1 = require("./extension_state");
const git_extension_wrapper_1 = require("./git/git_extension_wrapper");
const user_friendly_error_1 = require("./errors/user_friendly_error");
const INVALID_STATE = { valid: false };
const getJobs = async (repository, pipeline) => {
    if (!pipeline)
        return [];
    try {
        return await gitLabService.fetchJobsForPipeline(repository.rootFsPath, pipeline);
    }
    catch (e) {
        (0, log_1.logError)(new user_friendly_error_1.UserFriendlyError('Failed to fetch jobs for pipeline.', e));
        return [];
    }
};
class CurrentBranchRefresher {
    constructor() {
        this.lastRefresh = (0, dayjs_1.default)().subtract(1, 'minute');
        this.previousBranchName = '';
    }
    async init(statusBar, currentBranchProvider) {
        this.statusBar = statusBar;
        this.currentBranchProvider = currentBranchProvider;
        await this.clearAndSetInterval();
        extension_state_1.extensionState.onDidChangeValid(() => this.clearAndSetInterval());
        vscode.window.onDidChangeWindowState(async (state) => {
            if (!state.focused) {
                return;
            }
            if ((0, dayjs_1.default)().diff(this.lastRefresh, 'second') > 30) {
                await this.clearAndSetInterval();
            }
        });
        // This polling is not ideal. The alternative is to listen on repository state
        // changes. The logic becomes much more complex and the state changes
        // (Repository.state.onDidChange()) are triggered many times per second.
        // We wouldn't save any CPU cycles, just increased the complexity of this extension.
        this.branchTrackingTimer = setInterval(async () => {
            var _a;
            const currentBranch = (_a = git_extension_wrapper_1.gitExtensionWrapper.getActiveRepository()) === null || _a === void 0 ? void 0 : _a.branch;
            if (currentBranch && currentBranch !== this.previousBranchName) {
                this.previousBranchName = currentBranch;
                await this.clearAndSetInterval();
            }
        }, 1000);
    }
    async clearAndSetInterval() {
        global.clearInterval(this.refreshTimer);
        this.refreshTimer = setInterval(async () => {
            if (!vscode.window.state.focused)
                return;
            await this.refresh();
        }, 30000);
        await this.refresh();
    }
    async refresh(userInitiated = false) {
        (0, assert_1.default)(this.statusBar);
        (0, assert_1.default)(this.currentBranchProvider);
        const state = await CurrentBranchRefresher.getState(userInitiated);
        await this.statusBar.refresh(state);
        this.currentBranchProvider.refresh(state);
        this.lastRefresh = (0, dayjs_1.default)();
    }
    static async getState(userInitiated) {
        if (!extension_state_1.extensionState.isValid())
            return INVALID_STATE;
        const repository = git_extension_wrapper_1.gitExtensionWrapper.getActiveRepository();
        if (!repository)
            return INVALID_STATE;
        const gitlabProject = await repository.getProject();
        if (!gitlabProject)
            return INVALID_STATE;
        try {
            const { pipeline, mr } = await gitLabService.fetchPipelineAndMrForCurrentBranch(repository.rootFsPath);
            const jobs = await getJobs(repository, pipeline);
            const issues = mr ? await gitLabService.fetchMRIssues(mr.iid, repository.rootFsPath) : [];
            return { valid: true, repository, pipeline, mr, jobs, issues, userInitiated };
        }
        catch (e) {
            (0, log_1.logError)(e);
            return { valid: false, error: e };
        }
    }
    stopTimers() {
        global.clearInterval(this.refreshTimer);
        global.clearInterval(this.branchTrackingTimer);
    }
    dispose() {
        this.stopTimers();
    }
}
exports.CurrentBranchRefresher = CurrentBranchRefresher;
exports.currentBranchRefresher = new CurrentBranchRefresher();
//# sourceMappingURL=current_branch_refresher.js.map