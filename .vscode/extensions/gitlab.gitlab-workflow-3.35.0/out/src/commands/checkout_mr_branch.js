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
exports.checkoutMrBranch = void 0;
const vscode = __importStar(require("vscode"));
const assert_1 = __importDefault(require("assert"));
const command_names_1 = require("../command_names");
const handleGitError = async (e) => {
    const SEE_GIT_LOG = 'See Git Log';
    const choice = await vscode.window.showErrorMessage(`Checkout failed: ${e.stderr}`, SEE_GIT_LOG);
    if (choice === SEE_GIT_LOG) {
        await vscode.commands.executeCommand(command_names_1.VS_COMMANDS.GIT_SHOW_OUTPUT);
    }
};
/**
 * Command will checkout source branch for merge request. Merge request must be from local branch.
 */
const checkoutMrBranch = async (mrItemModel) => {
    const { mr } = mrItemModel;
    (0, assert_1.default)(mr.target_project_id === mr.source_project_id, 'this command is only available for same-project MRs');
    try {
        const { repository } = mrItemModel;
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: `Checking out ${mr.source_branch}` }, async () => {
            await repository.fetch();
            await repository.checkout(mr.source_branch);
        });
        if (repository.lastCommitSha !== mr.sha) {
            await vscode.window.showWarningMessage(`Branch changed to ${mr.source_branch}, but it's out of sync with the remote branch. Synchronize it by pushing or pulling.`);
            return;
        }
        await vscode.window.showInformationMessage(`Branch changed to ${mr.source_branch}`);
    }
    catch (e) {
        if (e.gitErrorCode) {
            await handleGitError(e);
            return;
        }
        throw e;
    }
};
exports.checkoutMrBranch = checkoutMrBranch;
//# sourceMappingURL=checkout_mr_branch.js.map