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
exports.insertSnippet = exports.pickSnippet = void 0;
const vscode = __importStar(require("vscode"));
const pickSnippet = async (snippets) => {
    const quickPickItems = snippets.map(s => ({
        label: s.title,
        description: s.description,
        detail: s.blobs.nodes.map(blob => blob.name).join(','),
        original: s,
    }));
    return vscode.window.showQuickPick(quickPickItems);
};
exports.pickSnippet = pickSnippet;
const pickBlob = async (blobs) => {
    const quickPickItems = blobs.map(b => ({
        label: b.name,
        original: b,
    }));
    const result = await vscode.window.showQuickPick(quickPickItems);
    return result === null || result === void 0 ? void 0 : result.original;
};
const insertSnippet = async (gitlabRepository) => {
    if (!vscode.window.activeTextEditor) {
        await vscode.window.showInformationMessage('There is no open file.');
        return;
    }
    const { remote } = gitlabRepository;
    const snippets = await gitlabRepository
        .getGitLabService()
        .getSnippets(`${remote.namespace}/${remote.project}`);
    if (snippets.length === 0) {
        await vscode.window.showInformationMessage('There are no project snippets.');
        return;
    }
    const result = await (0, exports.pickSnippet)(snippets);
    if (!result) {
        return;
    }
    const blobs = result.original.blobs.nodes;
    const blob = blobs.length > 1 ? await pickBlob(blobs) : blobs[0];
    if (!blob) {
        return;
    }
    const snippet = await gitlabRepository
        .getGitLabService()
        .getSnippetContent(result.original, blob);
    const editor = vscode.window.activeTextEditor;
    await editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.start, snippet);
    });
};
exports.insertSnippet = insertSnippet;
//# sourceMappingURL=insert_snippet.js.map