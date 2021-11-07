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
exports.openMrFile = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const assert_1 = __importDefault(require("assert"));
const fs_1 = require("fs");
const command_names_1 = require("../command_names");
const review_uri_1 = require("../review/review_uri");
const git_extension_wrapper_1 = require("../git/git_extension_wrapper");
const remove_leading_slash_1 = require("../utils/remove_leading_slash");
/** returns true if file exists, false if it doesn't */
const tryToOpen = async (filePath) => {
    try {
        await fs_1.promises.access(filePath); // throws if file doesn't exist
    }
    catch (e) {
        return false;
    }
    await vscode.commands.executeCommand(command_names_1.VS_COMMANDS.OPEN, vscode.Uri.file(filePath));
    return true;
};
const findDiffWithPath = (diffs, relativePath) => diffs.find(d => d.new_path === relativePath || d.old_path === relativePath);
const openMrFile = async (uri) => {
    const params = (0, review_uri_1.fromReviewUri)(uri);
    (0, assert_1.default)(params.path);
    const repository = git_extension_wrapper_1.gitExtensionWrapper.getRepository(params.repositoryRoot);
    const cachedMr = repository.getMr(params.mrId);
    (0, assert_1.default)(cachedMr);
    const diff = findDiffWithPath(cachedMr.mrVersion.diffs, (0, remove_leading_slash_1.removeLeadingSlash)(params.path));
    (0, assert_1.default)(diff, 'Extension did not find the file in the MR, please refresh the side panel.');
    const getFullPath = (relative) => path.join(params.repositoryRoot, relative);
    const opened = (await tryToOpen(getFullPath(diff.new_path))) || (await tryToOpen(getFullPath(diff.old_path)));
    if (!opened)
        await vscode.window.showWarningMessage(`The file ${params.path} doesn't exist in your local project`);
};
exports.openMrFile = openMrFile;
//# sourceMappingURL=open_mr_file.js.map