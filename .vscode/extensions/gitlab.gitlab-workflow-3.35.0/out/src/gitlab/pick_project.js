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
exports.pickProject = void 0;
const vscode = __importStar(require("vscode"));
const pick_with_query_1 = require("../utils/pick_with_query");
const gitlab_remote_source_provider_1 = require("./clone/gitlab_remote_source_provider");
async function pickProject(instanceUrl) {
    const provider = new gitlab_remote_source_provider_1.GitLabRemoteSourceProvider(instanceUrl);
    const other = {
        label: '$(globe) Other',
        description: 'Enter the path of a public project',
        alwaysShow: true,
    };
    // Return the user's projects which match the query
    async function getItems(query) {
        const sources = await provider.getRemoteSources(query);
        // The remote provider already adds $(repo) to the name
        const items = sources.map(s => ({ ...s, label: s.name }));
        return [other, ...items];
    }
    // Lookup a specific project by path
    async function lookupItem(path) {
        const remote = await provider.lookupByPath(path);
        if (remote)
            return { ...remote, label: remote.name };
        await vscode.window.showWarningMessage(`Cannot find project with path '${path}'`);
        return undefined;
    }
    // Show the quick pick
    const { picked, query } = await (0, pick_with_query_1.pickWithQuery)({
        ignoreFocusOut: true,
        placeholder: 'Select GitLab project',
    }, getItems);
    // If the user picked an item other than `other`, return it
    if (picked !== other) {
        return picked;
    }
    // If the user typed something in, resolve that as a project without prompting
    // them for input. This provides a similar UX to 'Git: Switch Branch'.
    if (query) {
        return lookupItem(query);
    }
    // The user selected 'Other' without typing anything in. Prompt them to
    // provide the path of a project.
    const input = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        prompt: 'Enter the path of a GitLab project',
    });
    if (input) {
        return lookupItem(input);
    }
    // The user canceled the input box
    return undefined;
}
exports.pickProject = pickProject;
//# sourceMappingURL=pick_project.js.map