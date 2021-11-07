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
exports.applySnippetPatch = exports.NO_PATCH_SNIPPETS_MESSAGE = void 0;
const vscode = __importStar(require("vscode"));
const temp = __importStar(require("temp"));
const assert_1 = __importDefault(require("assert"));
const fs_1 = require("fs");
const insert_snippet_1 = require("./insert_snippet");
const constants_1 = require("../constants");
const FETCHING_PROJECT_SNIPPETS = 'Fetching all project snippets.';
exports.NO_PATCH_SNIPPETS_MESSAGE = 'There are no patch snippets (patch snippet must contain a file which name ends with ".patch").';
const getFirstPatchBlob = (snippet) => snippet.blobs.nodes.find(b => b.name.endsWith(constants_1.PATCH_FILE_SUFFIX));
const applySnippetPatch = async (repository) => {
    const { remote } = repository;
    const snippets = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: FETCHING_PROJECT_SNIPPETS }, () => repository.getGitLabService().getSnippets(`${remote.namespace}/${remote.project}`));
    const patchSnippets = snippets.filter(s => getFirstPatchBlob(s));
    if (patchSnippets.length === 0) {
        await vscode.window.showInformationMessage(exports.NO_PATCH_SNIPPETS_MESSAGE);
        return;
    }
    const result = await (0, insert_snippet_1.pickSnippet)(patchSnippets);
    if (!result) {
        return;
    }
    const blob = getFirstPatchBlob(result.original);
    (0, assert_1.default)(blob, 'blob should be here, we filtered out all snippets without patch blob');
    const snippet = await repository.getGitLabService().getSnippetContent(result.original, blob);
    const tmpFilePath = temp.path({ suffix: constants_1.PATCH_FILE_SUFFIX });
    await fs_1.promises.writeFile(tmpFilePath, snippet);
    await repository.apply(tmpFilePath);
    await fs_1.promises.unlink(tmpFilePath);
};
exports.applySnippetPatch = applySnippetPatch;
//# sourceMappingURL=apply_snippet_patch.js.map