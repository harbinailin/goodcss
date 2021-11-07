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
exports.statusBar = exports.StatusBar = void 0;
const vscode = __importStar(require("vscode"));
const assert = require("assert");
const openers = __importStar(require("./openers"));
const user_friendly_error_1 = require("./errors/user_friendly_error");
const log_1 = require("./log");
const command_names_1 = require("./command_names");
const MAXIMUM_DISPLAYED_JOBS = 4;
// FIXME: if you are touching this configuration statement, move the configuration to extension_configuration.ts
const { showStatusBarLinks, showIssueLinkOnStatusBar, showMrStatusOnStatusBar, showPipelineUpdateNotifications, } = vscode.workspace.getConfiguration('gitlab');
const iconForStatus = {
    running: { icon: 'pulse' },
    pending: { icon: 'clock' },
    success: { icon: 'check', text: 'passed' },
    failed: { icon: 'x' },
    canceled: { icon: 'circle-slash' },
    skipped: { icon: 'diff-renamed' },
};
const getStatusText = (status) => { var _a; return ((_a = iconForStatus[status]) === null || _a === void 0 ? void 0 : _a.text) || status; };
const createStatusTextFromJobs = (jobs, status) => {
    let statusText = getStatusText(status);
    const jobNames = jobs.filter(job => job.status === status).map(job => job.name);
    if (jobNames.length > MAXIMUM_DISPLAYED_JOBS) {
        statusText += ' (';
        statusText += jobNames.slice(0, MAXIMUM_DISPLAYED_JOBS).join(', ');
        statusText += `, +${jobNames.length - MAXIMUM_DISPLAYED_JOBS} jobs`;
        statusText += ')';
    }
    else if (jobNames.length > 0) {
        statusText += ` (${jobNames.join(', ')})`;
    }
    return statusText;
};
const createStatusBarItem = (text, command) => {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBarItem.text = text;
    statusBarItem.show();
    if (command) {
        statusBarItem.command = command;
    }
    return statusBarItem;
};
const openIssuableOnTheWebCommand = (issuable) => ({
    title: '',
    command: 'vscode.open',
    arguments: [vscode.Uri.parse(issuable.web_url)],
});
const sortAndDeduplicate = (jobs) => {
    const alreadyProcessedJob = new Set();
    const compareTimeNewFirst = (a, b) => Date.parse(a.created_at) < Date.parse(b.created_at) ? -1 : 1;
    return jobs.sort(compareTimeNewFirst).filter(job => {
        if (alreadyProcessedJob.has(job.name)) {
            return false;
        }
        alreadyProcessedJob.add(job.name);
        return true;
    });
};
class StatusBar {
    constructor() {
        this.firstRun = true;
    }
    async refresh(state) {
        if (state.valid) {
            await this.updatePipelineItem(state.pipeline, state.jobs, state.repository.rootFsPath);
            this.updateMrItem(state.mr);
            this.fetchMrClosingIssue(state.mr, state.issues);
        }
        else {
            this.hideAllItems();
        }
    }
    hideAllItems() {
        var _a, _b, _c;
        (_a = this.pipelineStatusBarItem) === null || _a === void 0 ? void 0 : _a.hide();
        (_b = this.mrStatusBarItem) === null || _b === void 0 ? void 0 : _b.hide();
        (_c = this.mrIssueStatusBarItem) === null || _c === void 0 ? void 0 : _c.hide();
    }
    async updatePipelineItem(pipeline, jobs, repositoryRoot) {
        var _a;
        if (!this.pipelineStatusBarItem)
            return;
        if (!pipeline) {
            this.pipelineStatusBarItem.text = 'GitLab: No pipeline.';
            this.pipelineStatusBarItem.show();
            this.firstRun = false;
            return;
        }
        const { status } = pipeline;
        let statusText = getStatusText(status);
        if (status === 'running' || status === 'failed') {
            try {
                const processedJobs = sortAndDeduplicate(jobs);
                statusText = createStatusTextFromJobs(processedJobs, status);
            }
            catch (e) {
                (0, log_1.logError)(new user_friendly_error_1.UserFriendlyError('Failed to fetch jobs for pipeline.', e));
            }
        }
        const msg = `$(${(_a = iconForStatus[status]) === null || _a === void 0 ? void 0 : _a.icon}) GitLab: Pipeline ${statusText}`;
        if (showPipelineUpdateNotifications &&
            this.pipelineStatusBarItem.text !== msg &&
            !this.firstRun) {
            const message = `Pipeline ${statusText}.`;
            await vscode.window
                .showInformationMessage(message, { modal: false }, 'View in Gitlab')
                .then(async (selection) => {
                if (selection === 'View in Gitlab') {
                    await openers.openCurrentPipeline(repositoryRoot);
                }
            });
        }
        this.pipelineStatusBarItem.text = msg;
        this.pipelineStatusBarItem.show();
        this.firstRun = false;
    }
    fetchMrClosingIssue(mr, closingIssues) {
        if (!this.mrIssueStatusBarItem)
            return;
        if (mr) {
            let text = `$(code) GitLab: No issue.`;
            let command;
            const firstIssue = closingIssues[0];
            if (firstIssue) {
                text = `$(code) GitLab: Issue #${firstIssue.iid}`;
                command = openIssuableOnTheWebCommand(firstIssue);
            }
            this.mrIssueStatusBarItem.text = text;
            this.mrIssueStatusBarItem.command = command;
        }
        else {
            this.mrIssueStatusBarItem.hide();
        }
    }
    updateMrItem(mr) {
        if (!this.mrStatusBarItem)
            return;
        this.mrStatusBarItem.show();
        this.mrStatusBarItem.command = mr
            ? openIssuableOnTheWebCommand(mr)
            : command_names_1.USER_COMMANDS.OPEN_CREATE_NEW_MR;
        this.mrStatusBarItem.text = mr
            ? `$(git-pull-request) GitLab: MR !${mr.iid}`
            : '$(git-pull-request) GitLab: Create MR.';
    }
    init() {
        assert(!this.pipelineStatusBarItem, 'The status bar is already initialized');
        if (showStatusBarLinks) {
            this.pipelineStatusBarItem = createStatusBarItem('$(info) GitLab: Fetching pipeline...', command_names_1.USER_COMMANDS.PIPELINE_ACTIONS);
            if (showMrStatusOnStatusBar) {
                this.mrStatusBarItem = createStatusBarItem('$(info) GitLab: Finding MR...');
                if (showIssueLinkOnStatusBar) {
                    this.mrIssueStatusBarItem = createStatusBarItem('$(info) GitLab: Fetching closing issue...');
                }
            }
        }
    }
    dispose() {
        var _a, _b, _c;
        if (showStatusBarLinks) {
            (_a = this.pipelineStatusBarItem) === null || _a === void 0 ? void 0 : _a.dispose();
            if (showIssueLinkOnStatusBar) {
                (_b = this.mrIssueStatusBarItem) === null || _b === void 0 ? void 0 : _b.dispose();
            }
            if (showMrStatusOnStatusBar) {
                (_c = this.mrStatusBarItem) === null || _c === void 0 ? void 0 : _c.dispose();
            }
        }
    }
}
exports.StatusBar = StatusBar;
exports.statusBar = new StatusBar();
//# sourceMappingURL=status_bar.js.map