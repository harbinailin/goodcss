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
exports.Help = exports.HelpMessageSeverity = void 0;
const vscode = __importStar(require("vscode"));
const command_names_1 = require("../command_names");
const context_utils_1 = require("./context_utils");
// eslint-disable-next-line no-shadow
var HelpMessageSeverity;
(function (HelpMessageSeverity) {
    HelpMessageSeverity[HelpMessageSeverity["Info"] = 0] = "Info";
    HelpMessageSeverity[HelpMessageSeverity["Warning"] = 1] = "Warning";
    HelpMessageSeverity[HelpMessageSeverity["Error"] = 2] = "Error";
})(HelpMessageSeverity = exports.HelpMessageSeverity || (exports.HelpMessageSeverity = {}));
class Help {
    static async show(section) {
        const help = context_utils_1.contextUtils.getEmbededFileUri('README.md').with({ fragment: section });
        await vscode.commands.executeCommand(command_names_1.VS_COMMANDS.MARKDOWN_SHOW_PREVIEW, help);
    }
    static async showError(error, severity = HelpMessageSeverity.Info) {
        var _a;
        let shouldShow = false;
        switch (severity) {
            default:
                shouldShow = !!(await vscode.window.showInformationMessage(error.message, 'Show Help'));
                break;
            case HelpMessageSeverity.Warning:
                shouldShow = !!(await vscode.window.showWarningMessage(error.message, 'Show Help'));
                break;
            case HelpMessageSeverity.Error:
                shouldShow = !!(await vscode.window.showErrorMessage(error.message, 'Show Help'));
                break;
        }
        if (shouldShow) {
            await Help.show((_a = error.options) === null || _a === void 0 ? void 0 : _a.section);
        }
    }
}
exports.Help = Help;
//# sourceMappingURL=help.js.map