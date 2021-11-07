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
exports.validate = void 0;
const vscode = __importStar(require("vscode"));
const assert_1 = __importDefault(require("assert"));
const git_extension_wrapper_1 = require("./git/git_extension_wrapper");
const do_not_await_1 = require("./utils/do_not_await");
async function validate() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        await vscode.window.showInformationMessage('GitLab Workflow: No open file.');
        return;
    }
    const content = editor.document.getText();
    const repository = git_extension_wrapper_1.gitExtensionWrapper.getActiveRepository();
    (0, assert_1.default)(repository);
    const project = await repository.getProject();
    (0, assert_1.default)(project, "Current folder doesn't contain a GitLab project");
    const { valid, errors } = await repository.getGitLabService().validateCIConfig(project, content);
    if (valid) {
        (0, do_not_await_1.doNotAwait)(vscode.window.showInformationMessage('GitLab Workflow: Your CI configuration is valid.'));
        return;
    }
    (0, do_not_await_1.doNotAwait)(vscode.window.showErrorMessage('GitLab Workflow: Invalid CI configuration.'));
    if (errors[0]) {
        (0, do_not_await_1.doNotAwait)(vscode.window.showErrorMessage(errors[0]));
    }
}
exports.validate = validate;
//# sourceMappingURL=ci_config_validator.js.map