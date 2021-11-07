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
exports.currentBranchDataProvider = exports.CurrentBranchDataProvider = void 0;
const vscode = __importStar(require("vscode"));
const error_item_1 = require("./items/error_item");
const item_model_1 = require("./items/item_model");
const mr_item_model_1 = require("./items/mr_item_model");
const issue_item_1 = require("./items/issue_item");
const pipeline_item_model_1 = require("./items/pipeline_item_model");
class CurrentBranchDataProvider {
    constructor() {
        this.eventEmitter = new vscode.EventEmitter();
        this.onDidChangeTreeData = this.eventEmitter.event;
        this.state = { valid: false };
    }
    createPipelineItem(repository, pipeline, jobs) {
        if (!pipeline) {
            return new vscode.TreeItem('No pipeline found');
        }
        this.pipelineItem = new pipeline_item_model_1.PipelineItemModel(pipeline, jobs, repository);
        return this.pipelineItem;
    }
    disposeMrItem() {
        var _a;
        (_a = this.mrState) === null || _a === void 0 ? void 0 : _a.item.dispose();
        this.mrState = undefined;
    }
    createMrItem(state) {
        var _a;
        if (!state.userInitiated && this.mrState && this.mrState.mr.id === ((_a = state.mr) === null || _a === void 0 ? void 0 : _a.id))
            return this.mrState.item;
        this.disposeMrItem();
        if (!state.mr)
            return new vscode.TreeItem('No merge request found');
        const item = new mr_item_model_1.MrItemModel(state.mr, state.repository);
        this.mrState = { mr: state.mr, item };
        return item;
    }
    static createClosingIssueItems(repository, issues) {
        if (issues.length === 0)
            return [new vscode.TreeItem('No closing issue found')];
        return issues.map(issue => new issue_item_1.IssueItem(issue, repository.rootFsPath));
    }
    renderValidState(state) {
        const pipelineItem = this.createPipelineItem(state.repository, state.pipeline, state.jobs);
        const closingIssuesItems = CurrentBranchDataProvider.createClosingIssueItems(state.repository, state.issues);
        return { pipelineItem, closingIssuesItems };
    }
    static renderInvalidState(state) {
        if (state.error) {
            return [new error_item_1.ErrorItem()];
        }
        return [];
    }
    async getChildren(item) {
        var _a;
        if (item)
            return item.getChildren();
        (_a = this.pipelineItem) === null || _a === void 0 ? void 0 : _a.dispose();
        this.pipelineItem = undefined;
        if (this.state.valid) {
            const mrItem = this.createMrItem(this.state);
            const { pipelineItem, closingIssuesItems } = this.renderValidState(this.state);
            return [pipelineItem, mrItem, ...closingIssuesItems];
        }
        this.disposeMrItem();
        return CurrentBranchDataProvider.renderInvalidState(this.state);
    }
    // eslint-disable-next-line class-methods-use-this
    getTreeItem(item) {
        if (item instanceof item_model_1.ItemModel)
            return item.getTreeItem();
        return item;
    }
    refresh(state) {
        this.state = state;
        this.eventEmitter.fire();
    }
}
exports.CurrentBranchDataProvider = CurrentBranchDataProvider;
exports.currentBranchDataProvider = new CurrentBranchDataProvider();
//# sourceMappingURL=current_branch_data_provider.js.map