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
exports.setPreferredRemote = exports.getRepositorySettings = exports.setExtensionConfiguration = exports.getExtensionConfiguration = void 0;
const vscode = __importStar(require("vscode"));
const constants_1 = require("../constants");
// VS Code returns a value or `null` but undefined is better for using default function arguments
const turnNullToUndefined = (val) => val !== null && val !== void 0 ? val : undefined;
function getExtensionConfiguration() {
    const workspaceConfig = vscode.workspace.getConfiguration(constants_1.CONFIG_NAMESPACE);
    return {
        instanceUrl: turnNullToUndefined(workspaceConfig.instanceUrl),
        remoteName: turnNullToUndefined(workspaceConfig.remoteName),
        pipelineGitRemoteName: turnNullToUndefined(workspaceConfig.pipelineGitRemoteName),
        featureFlags: turnNullToUndefined(workspaceConfig.featureFlags),
        customQueries: workspaceConfig.customQueries || [],
        repositories: workspaceConfig.repositories,
    };
}
exports.getExtensionConfiguration = getExtensionConfiguration;
async function setExtensionConfiguration(name, value) {
    const workspaceConfig = vscode.workspace.getConfiguration(constants_1.CONFIG_NAMESPACE);
    await workspaceConfig.update(name, value);
}
exports.setExtensionConfiguration = setExtensionConfiguration;
function getRepositorySettings(repositoryRoot) {
    return getExtensionConfiguration().repositories[repositoryRoot];
}
exports.getRepositorySettings = getRepositorySettings;
const setPreferredRemote = async (repositoryRoot, remoteName) => {
    const { repositories } = getExtensionConfiguration();
    const updatedRemotes = {
        ...repositories,
        [repositoryRoot]: { preferredRemoteName: remoteName },
    };
    await setExtensionConfiguration('repositories', updatedRemotes);
};
exports.setPreferredRemote = setPreferredRemote;
//# sourceMappingURL=extension_configuration.js.map