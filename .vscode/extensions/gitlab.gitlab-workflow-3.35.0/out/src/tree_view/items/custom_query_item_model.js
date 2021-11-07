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
exports.CustomQueryItemModel = void 0;
const vscode = __importStar(require("vscode"));
const assert_1 = __importDefault(require("assert"));
const gitLabService = __importStar(require("../../gitlab_service"));
const log_1 = require("../../log");
const error_item_1 = require("./error_item");
const mr_item_model_1 = require("./mr_item_model");
const external_url_item_1 = require("./external_url_item");
const issue_item_1 = require("./issue_item");
const vulnerability_item_1 = require("./vulnerability_item");
const custom_query_type_1 = require("../../gitlab/custom_query_type");
const item_model_1 = require("./item_model");
class CustomQueryItemModel extends item_model_1.ItemModel {
    constructor(customQuery, repository) {
        super();
        this.repository = repository;
        this.customQuery = customQuery;
    }
    getTreeItem() {
        (0, assert_1.default)(this.repository.containsGitLabProject);
        const item = new vscode.TreeItem(this.customQuery.name, vscode.TreeItemCollapsibleState.Collapsed);
        item.iconPath = new vscode.ThemeIcon('filter');
        return item;
    }
    async getProjectIssues() {
        const issues = await gitLabService.fetchIssuables(this.customQuery, this.repository.rootFsPath);
        if (issues.length === 0) {
            const noItemText = this.customQuery.noItemText || 'No items found.';
            return [new vscode.TreeItem(noItemText)];
        }
        const { MR, ISSUE, SNIPPET, EPIC, VULNERABILITY } = custom_query_type_1.CustomQueryType;
        switch (this.customQuery.type) {
            case MR: {
                const mrModels = issues.map((mr) => new mr_item_model_1.MrItemModel(mr, this.repository));
                this.setDisposableChildren(mrModels);
                return mrModels;
            }
            case ISSUE:
                return issues.map((issue) => new issue_item_1.IssueItem(issue, this.repository.rootFsPath));
            case SNIPPET:
                return issues.map((snippet) => new external_url_item_1.ExternalUrlItem(`$${snippet.id} · ${snippet.title}`, snippet.web_url));
            case EPIC:
                return issues.map((epic) => new external_url_item_1.ExternalUrlItem(`&${epic.iid} · ${epic.title}`, epic.web_url));
            case VULNERABILITY:
                return issues.map((v) => new vulnerability_item_1.VulnerabilityItem(v));
            default:
                throw new Error(`unknown custom query type ${this.customQuery.type}`);
        }
    }
    async getChildren() {
        try {
            return await this.getProjectIssues();
        }
        catch (e) {
            (0, log_1.handleError)(e);
            return [new error_item_1.ErrorItem()];
        }
    }
}
exports.CustomQueryItemModel = CustomQueryItemModel;
//# sourceMappingURL=custom_query_item_model.js.map