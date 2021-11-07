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
exports.getUserAgentHeader = void 0;
const vscode = __importStar(require("vscode"));
const getUserAgentHeader = () => {
    var _a;
    const extension = vscode.extensions.getExtension('GitLab.gitlab-workflow');
    const extensionVersion = (_a = extension === null || extension === void 0 ? void 0 : extension.packageJSON) === null || _a === void 0 ? void 0 : _a.version;
    const nodePlatform = `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
    const vsCodeVersion = vscode.version;
    return {
        'User-Agent': `vs-code-gitlab-workflow/${extensionVersion} VSCode/${vsCodeVersion} ${nodePlatform}`,
    };
};
exports.getUserAgentHeader = getUserAgentHeader;
//# sourceMappingURL=get_user_agent_header.js.map