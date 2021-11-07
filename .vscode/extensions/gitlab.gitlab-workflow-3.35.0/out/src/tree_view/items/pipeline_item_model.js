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
exports.PipelineItemModel = void 0;
const vscode = __importStar(require("vscode"));
const dayjs_1 = __importDefault(require("dayjs"));
const relativeTime_1 = __importDefault(require("dayjs/plugin/relativeTime"));
const ci_status_metadata_1 = require("../../gitlab/ci_status_metadata");
const open_in_browser_command_1 = require("../../utils/open_in_browser_command");
const item_model_1 = require("./item_model");
const stage_item_model_1 = require("./stage_item_model");
const compare_by_1 = require("../../utils/compare_by");
dayjs_1.default.extend(relativeTime_1.default);
/** removes duplicates based on === equality. Can be replaced with lodash. */
const uniq = (duplicated) => [...new Set(duplicated)];
const getUniqueStages = (jobs) => uniq(jobs.map(j => j.stage));
class PipelineItemModel extends item_model_1.ItemModel {
    constructor(pipeline, jobs, repository) {
        super();
        this.pipeline = pipeline;
        this.jobs = jobs;
        this.repository = repository;
    }
    getTreeItem() {
        const timeAgo = (0, dayjs_1.default)(this.pipeline.updated_at).fromNow();
        const label = `Pipeline #${this.pipeline.id}`;
        const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.Expanded);
        const statusMetadata = (0, ci_status_metadata_1.getPipelineMetadata)(this.pipeline);
        item.tooltip = `${label} · ${statusMetadata.name} · ${timeAgo}`;
        item.description = statusMetadata.name;
        item.iconPath = statusMetadata.icon;
        item.command = (0, open_in_browser_command_1.openInBrowserCommand)(this.pipeline.web_url);
        return item;
    }
    async getChildren() {
        const jobsAsc = this.jobs.sort((0, compare_by_1.compareBy)('id'));
        const stages = getUniqueStages(jobsAsc);
        const stagesWithJobs = stages.map(stageName => ({
            name: stageName,
            jobs: jobsAsc.filter(j => j.stage === stageName),
        }));
        return stagesWithJobs.map(sj => new stage_item_model_1.StageItemModel(sj.name, sj.jobs));
    }
}
exports.PipelineItemModel = PipelineItemModel;
//# sourceMappingURL=pipeline_item_model.js.map