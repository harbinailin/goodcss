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
exports.RepositoryItemModel = void 0;
const vscode = __importStar(require("vscode"));
const custom_query_item_model_1 = require("./custom_query_item_model");
const item_model_1 = require("./item_model");
const error_item_1 = require("./error_item");
class RepositoryItemModel extends item_model_1.ItemModel {
    constructor(repository, customQueries) {
        super();
        this.repository = repository;
        this.customQueries = customQueries;
    }
    getTreeItem() {
        if (!this.repository.containsGitLabProject) {
            return new error_item_1.ErrorItem(`${this.repository.name}: Project failed to load`);
        }
        const item = new vscode.TreeItem(this.repository.name, vscode.TreeItemCollapsibleState.Collapsed);
        item.iconPath = new vscode.ThemeIcon('project');
        return item;
    }
    async getChildren() {
        const children = this.customQueries.map(q => new custom_query_item_model_1.CustomQueryItemModel(q, this.repository));
        this.setDisposableChildren(children);
        return children;
    }
}
exports.RepositoryItemModel = RepositoryItemModel;
//# sourceMappingURL=repository_item_model.js.map