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
exports.createSnippetPatch = void 0;
const vscode = __importStar(require("vscode"));
const assert_1 = __importDefault(require("assert"));
const gitLabService = __importStar(require("../gitlab_service"));
const openers = __importStar(require("../openers"));
const create_snippet_1 = require("./create_snippet");
const constants_1 = require("../constants");
const getSnippetPatchDescription = (branch, commit, patchFileName) => `
This snippet contains suggested changes for branch ${branch} (commit: ${commit}).

Apply this snippet:

- In VS Code with the GitLab Workflow extension installed:
  - Run \`GitLab: Apply snippet patch\` and select this snippet
- Using the \`git\` command:
  - Download the \`${patchFileName}\` file to your project folder
  - In your project folder, run

    ~~~sh
    git apply '${patchFileName}'
    ~~~

*This snippet was created with the [GitLab Workflow VS Code extension](https://marketplace.visualstudio.com/items?itemName=GitLab.gitlab-workflow).*
`;
const createSnippetPatch = async (repository) => {
    (0, assert_1.default)(repository.lastCommitSha);
    const patch = await repository.diff();
    const name = await vscode.window.showInputBox({
        placeHolder: 'patch name',
        prompt: 'The name is used as the snippet title and also as the filename (with .patch appended).',
    });
    if (!name)
        return;
    const visibility = await vscode.window.showQuickPick(create_snippet_1.VISIBILITY_OPTIONS);
    if (!visibility)
        return;
    const project = await repository.getProject();
    const patchFileName = `${name}${constants_1.PATCH_FILE_SUFFIX}`;
    const data = {
        id: project.restId,
        title: `${constants_1.PATCH_TITLE_PREFIX}${name}`,
        description: getSnippetPatchDescription(await repository.getTrackingBranchName(), repository.lastCommitSha, patchFileName),
        file_name: patchFileName,
        visibility: visibility.type,
        content: patch,
    };
    const snippet = await gitLabService.createSnippet(repository.rootFsPath, data);
    await openers.openUrl(snippet.web_url);
};
exports.createSnippetPatch = createSnippetPatch;
//# sourceMappingURL=create_snippet_patch.js.map