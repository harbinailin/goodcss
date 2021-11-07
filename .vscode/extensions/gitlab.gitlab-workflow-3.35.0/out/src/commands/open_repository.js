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
exports.openRepository = void 0;
const vscode = __importStar(require("vscode"));
const constants_1 = require("../constants");
const gitlab_remote_file_system_1 = require("../remotefs/gitlab_remote_file_system");
const pick_instance_1 = require("../gitlab/pick_instance");
const pick_project_1 = require("../gitlab/pick_project");
const pick_git_ref_1 = require("../gitlab/pick_git_ref");
// eslint-disable-next-line no-shadow
var Action;
(function (Action) {
    Action[Action["None"] = 0] = "None";
    Action[Action["Replace"] = 1] = "Replace";
    Action[Action["AddRoot"] = 2] = "AddRoot";
    Action[Action["NewWindow"] = 3] = "NewWindow";
})(Action || (Action = {}));
async function openUrl(uri, action) {
    var _a;
    await gitlab_remote_file_system_1.GitLabRemoteFileSystem.parseUri(uri); // ensure the URI is a valid gitlab-remote URI
    switch (action) {
        case Action.Replace:
            await vscode.commands.executeCommand('vscode.openFolder', uri, false);
            break;
        case Action.NewWindow:
            await vscode.commands.executeCommand('vscode.openFolder', uri, true);
            break;
        case Action.AddRoot:
            vscode.workspace.updateWorkspaceFolders(((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a.length) || 0, 0, {
                uri,
            });
            break;
        default:
            throw new Error('Invalid action');
    }
}
async function enterUrl(action) {
    const uriStr = await vscode.window.showInputBox({
        prompt: 'gitlab-remote://{instance}/{label}?project={id}&ref={branch}',
        ignoreFocusOut: true,
    });
    if (!uriStr)
        return;
    await openUrl(vscode.Uri.parse(uriStr), action);
}
async function chooseProject(action) {
    const instance = await (0, pick_instance_1.pickInstance)();
    if (!instance)
        return;
    const remote = await (0, pick_project_1.pickProject)(instance);
    if (!remote)
        return;
    const ref = await (0, pick_git_ref_1.pickGitRef)(instance, remote.project.restId);
    if (!ref)
        return;
    const label = await vscode.window.showInputBox({
        value: remote.project.name,
        prompt: 'GitLab remote folder label',
        ignoreFocusOut: true,
        validateInput: gitlab_remote_file_system_1.GitLabRemoteFileSystem.validateLabel,
    });
    if (!label)
        return;
    const instanceUri = vscode.Uri.parse(instance);
    const remoteUri = vscode.Uri.joinPath(instanceUri, label).with({
        scheme: constants_1.REMOTE_URI_SCHEME,
        query: `project=${remote.project.restId}&ref=${ref.name}`,
    });
    await openUrl(remoteUri, action);
}
async function openRepository() {
    const { action } = (await vscode.window.showQuickPick([
        { label: '$(window) Open in current window', action: Action.Replace },
        { label: '$(empty-window) Open in new window', action: Action.NewWindow },
        { label: '$(root-folder) Add to workspace', action: Action.AddRoot },
    ])) || {};
    if (!action)
        return;
    const { next } = (await vscode.window.showQuickPick([
        { label: '$(repo) Choose a project', next: chooseProject },
        { label: '$(globe) Enter gitlab-remote URL', next: enterUrl },
    ])) || {};
    if (!next)
        return;
    await next(action);
}
exports.openRepository = openRepository;
//# sourceMappingURL=open_repository.js.map