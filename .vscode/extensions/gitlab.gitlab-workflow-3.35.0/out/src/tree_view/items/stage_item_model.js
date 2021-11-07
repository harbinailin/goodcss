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
exports.StageItemModel = void 0;
const vscode = __importStar(require("vscode"));
const ci_status_metadata_1 = require("../../gitlab/ci_status_metadata");
const compare_by_1 = require("../../utils/compare_by");
const create_job_item_1 = require("./create_job_item");
const item_model_1 = require("./item_model");
const first = (a) => a[0];
class StageItemModel extends item_model_1.ItemModel {
    constructor(stageName, jobs) {
        super();
        this.stageName = stageName;
        this.jobs = jobs;
    }
    getTreeItem() {
        const item = new vscode.TreeItem(this.stageName, vscode.TreeItemCollapsibleState.Expanded);
        const mostSevereStatusMetadata = first(this.jobs.map(ci_status_metadata_1.getJobMetadata).sort((0, compare_by_1.compareBy)('priority')).reverse());
        item.iconPath = mostSevereStatusMetadata === null || mostSevereStatusMetadata === void 0 ? void 0 : mostSevereStatusMetadata.icon;
        item.tooltip = mostSevereStatusMetadata === null || mostSevereStatusMetadata === void 0 ? void 0 : mostSevereStatusMetadata.name;
        return item;
    }
    async getChildren() {
        return this.jobs.map(create_job_item_1.createJobItem);
    }
}
exports.StageItemModel = StageItemModel;
//# sourceMappingURL=stage_item_model.js.map