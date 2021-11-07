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
exports.extensionState = exports.ExtensionState = void 0;
const vscode = __importStar(require("vscode"));
const assert_1 = __importDefault(require("assert"));
const git_extension_wrapper_1 = require("./git/git_extension_wrapper");
const hasOpenRepositories = () => git_extension_wrapper_1.gitExtensionWrapper.repositories.length > 0;
class ExtensionState {
    constructor() {
        this.changeValidEmitter = new vscode.EventEmitter();
        this.onDidChangeValid = this.changeValidEmitter.event;
        this.lastValid = false;
    }
    async init(tokenService) {
        this.tokenService = tokenService;
        this.lastValid = this.isValid();
        tokenService.onDidChange(this.updateExtensionStatus, this);
        git_extension_wrapper_1.gitExtensionWrapper.onRepositoryCountChanged(this.updateExtensionStatus, this);
        await this.updateExtensionStatus();
    }
    hasAnyTokens() {
        (0, assert_1.default)(this.tokenService, 'ExtensionState has not been initialized.');
        return this.tokenService.getInstanceUrls().length > 0;
    }
    isValid() {
        return this.hasAnyTokens() && hasOpenRepositories();
    }
    async updateExtensionStatus() {
        await vscode.commands.executeCommand('setContext', 'gitlab:noToken', !this.hasAnyTokens());
        await vscode.commands.executeCommand('setContext', 'gitlab:noRepository', !hasOpenRepositories());
        await vscode.commands.executeCommand('setContext', 'gitlab:validState', this.isValid());
        if (this.lastValid !== this.isValid()) {
            this.lastValid = this.isValid();
            this.changeValidEmitter.fire();
        }
    }
}
exports.ExtensionState = ExtensionState;
exports.extensionState = new ExtensionState();
//# sourceMappingURL=extension_state.js.map