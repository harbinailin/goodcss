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
exports.handleError = exports.logError = exports.log = exports.initializeLogging = void 0;
const vscode = __importStar(require("vscode"));
const command_names_1 = require("./command_names");
const help_error_1 = require("./errors/help_error");
const help_1 = require("./utils/help");
function isDetailedError(object) {
    return Boolean(object.details);
}
function isHelpError(object) {
    return object instanceof help_error_1.HelpError;
}
let globalLog = console.error;
const initializeLogging = (logLine) => {
    globalLog = logLine;
};
exports.initializeLogging = initializeLogging;
const log = (line) => globalLog(line);
exports.log = log;
const logError = (e) => isDetailedError(e) ? globalLog(e.details) : globalLog(`${e.message}\n${e.stack}`);
exports.logError = logError;
const handleError = (e) => {
    // This is probably the only place where we want to ignore a floating promise.
    // We don't want to block the app and wait for user click on the "Show Logs"
    // button or close the message However, for testing this method, we need to
    // keep the promise.
    (0, exports.logError)(e);
    if (isHelpError(e)) {
        return { onlyForTesting: help_1.Help.showError(e, help_1.HelpMessageSeverity.Error) };
    }
    const showErrorMessage = async () => {
        const choice = await vscode.window.showErrorMessage(e.message, 'Show Logs');
        if (choice === 'Show Logs') {
            await vscode.commands.executeCommand(command_names_1.USER_COMMANDS.SHOW_OUTPUT);
        }
    };
    return { onlyForTesting: showErrorMessage() };
};
exports.handleError = handleError;
//# sourceMappingURL=log.js.map