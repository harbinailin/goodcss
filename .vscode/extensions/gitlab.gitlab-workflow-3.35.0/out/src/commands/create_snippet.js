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
exports.createSnippet = exports.VISIBILITY_OPTIONS = void 0;
const vscode = __importStar(require("vscode"));
const openers = __importStar(require("../openers"));
const gitLabService = __importStar(require("../gitlab_service"));
const PRIVATE_VISIBILITY_ITEM = {
    label: '$(lock) Private',
    type: 'private',
    description: 'The snippet is visible only to project members.',
};
const PUBLIC_VISIBILITY_ITEM = {
    label: '$(globe) Public',
    type: 'public',
    description: 'The snippet can be accessed without any authentication.',
};
exports.VISIBILITY_OPTIONS = [PRIVATE_VISIBILITY_ITEM, PUBLIC_VISIBILITY_ITEM];
const contextOptions = [
    {
        label: 'Snippet from file',
        type: 'file',
    },
    {
        label: 'Snippet from selection',
        type: 'selection',
    },
];
async function uploadSnippet(project, editor, visibility, context, repositoryRoot) {
    let content = '';
    const fileName = editor.document.fileName.split('/').reverse()[0];
    if (context === 'selection' && editor.selection) {
        const { start, end } = editor.selection;
        const endLine = end.line + 1;
        const startPos = new vscode.Position(start.line, 0);
        const endPos = new vscode.Position(endLine, 0);
        const range = new vscode.Range(startPos, endPos);
        content = editor.document.getText(range);
    }
    else {
        content = editor.document.getText();
    }
    const data = {
        id: project.restId,
        title: fileName,
        file_name: fileName,
        visibility,
        content,
    };
    const snippet = await gitLabService.createSnippet(repositoryRoot, data);
    await openers.openUrl(snippet.web_url);
}
const createSnippet = async (repository) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        await vscode.window.showInformationMessage('GitLab Workflow: No open file.');
        return;
    }
    const project = await repository.getProject();
    const visibility = await vscode.window.showQuickPick(exports.VISIBILITY_OPTIONS);
    if (!visibility)
        return;
    const context = await vscode.window.showQuickPick(contextOptions);
    if (!context)
        return;
    await uploadSnippet(project, editor, visibility.type, context.type, repository.rootFsPath);
};
exports.createSnippet = createSnippet;
//# sourceMappingURL=create_snippet.js.map