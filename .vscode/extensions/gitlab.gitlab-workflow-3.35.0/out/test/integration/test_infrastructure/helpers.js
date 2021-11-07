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
exports.updateRepositoryStatus = exports.getRepositoryRoot = exports.simulateQuickPickChoice = exports.closeAndDeleteFile = exports.insertTextIntoActiveEditor = exports.createAndOpenFile = void 0;
const vscode = __importStar(require("vscode"));
const assert_1 = __importDefault(require("assert"));
const createAndOpenFile = async (testFileUri) => {
    const createFileEdit = new vscode.WorkspaceEdit();
    createFileEdit.createFile(testFileUri);
    await vscode.workspace.applyEdit(createFileEdit);
    await vscode.window.showTextDocument(testFileUri);
};
exports.createAndOpenFile = createAndOpenFile;
const insertTextIntoActiveEditor = async (text) => {
    const editor = vscode.window.activeTextEditor;
    (0, assert_1.default)(editor, 'no active editor');
    await editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.start, text);
    });
};
exports.insertTextIntoActiveEditor = insertTextIntoActiveEditor;
const closeAndDeleteFile = async (testFileUri) => {
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    const edit = new vscode.WorkspaceEdit();
    edit.deleteFile(testFileUri);
    await vscode.workspace.applyEdit(edit);
};
exports.closeAndDeleteFile = closeAndDeleteFile;
const simulateQuickPickChoice = (sandbox, nthItem) => {
    sandbox.stub(vscode.window, 'showQuickPick').callsFake(async (options) => {
        return (await options)[nthItem];
    });
};
exports.simulateQuickPickChoice = simulateQuickPickChoice;
const getRepositoryRoot = () => {
    var _a;
    const folders = vscode.workspace.workspaceFolders;
    const folder = folders && ((_a = folders[0]) === null || _a === void 0 ? void 0 : _a.uri.fsPath);
    (0, assert_1.default)(folder, 'There is no workspace folder in the test VS Code instance');
    return folder;
};
exports.getRepositoryRoot = getRepositoryRoot;
const updateRepositoryStatus = async () => {
    var _a, _b;
    const api = (_a = vscode.extensions.getExtension('vscode.git')) === null || _a === void 0 ? void 0 : _a.exports.getAPI(1);
    (0, assert_1.default)(api, 'Failed to retrieve Git Extension');
    return (_b = api.getRepository(vscode.Uri.file((0, exports.getRepositoryRoot)()))) === null || _b === void 0 ? void 0 : _b.status();
};
exports.updateRepositoryStatus = updateRepositoryStatus;
//# sourceMappingURL=helpers.js.map