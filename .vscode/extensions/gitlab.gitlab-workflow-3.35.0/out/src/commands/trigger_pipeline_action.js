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
exports.triggerPipelineAction = void 0;
const vscode = __importStar(require("vscode"));
const gitLabService = __importStar(require("../gitlab_service"));
const openers_1 = require("../openers");
const current_branch_refresher_1 = require("../current_branch_refresher");
const triggerPipelineAction = async (repository) => {
    const items = [
        {
            label: 'View latest pipeline on GitLab',
            action: 'view',
        },
        {
            label: 'Create a new pipeline from current branch',
            action: 'create',
        },
        {
            label: 'Retry last pipeline',
            action: 'retry',
        },
        {
            label: 'Cancel last pipeline',
            action: 'cancel',
        },
    ];
    const selected = await vscode.window.showQuickPick(items);
    if (selected) {
        if (selected.action === 'view') {
            await (0, openers_1.openCurrentPipeline)(repository.rootFsPath);
            return;
        }
        const newPipeline = await gitLabService.handlePipelineAction(selected.action, repository.rootFsPath);
        if (newPipeline)
            await current_branch_refresher_1.currentBranchRefresher.refresh();
    }
};
exports.triggerPipelineAction = triggerPipelineAction;
//# sourceMappingURL=trigger_pipeline_action.js.map