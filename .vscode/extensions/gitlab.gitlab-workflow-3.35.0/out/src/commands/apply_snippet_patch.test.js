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
const vscode = __importStar(require("vscode"));
const fs_1 = require("fs");
const apply_snippet_patch_1 = require("./apply_snippet_patch");
const snippets_js_1 = require("../../test/integration/fixtures/graphql/snippets.js");
const as_mock_1 = require("../test_utils/as_mock");
jest.mock('../git/git_extension_wrapper');
jest.mock('../gitlab_service');
const DIFF_OUTPUT = 'diff --git a/.gitlab-ci.yml b/.gitlab-ci.yml';
describe('apply snippet patch', () => {
    let wrappedRepository;
    let gitlabService;
    const getAppliedPatchContent = async () => {
        const [[patchFile]] = (0, as_mock_1.asMock)(wrappedRepository.apply).mock.calls;
        const patchContent = await fs_1.promises.readFile(patchFile);
        return patchContent.toString();
    };
    beforeEach(() => {
        gitlabService = {};
        const mockRepository = {
            remote: {
                host: 'gitlab.com',
                namespace: 'gitlab-org',
                project: 'gitlab-vscode-extension',
            },
            getGitLabService: () => gitlabService,
            apply: jest.fn(),
        };
        wrappedRepository = mockRepository;
        (0, as_mock_1.asMock)(vscode.window.withProgress).mockImplementation((_, task) => task());
        (0, as_mock_1.asMock)(vscode.window.showQuickPick).mockImplementation(options => options[0]);
        fs_1.promises.unlink = jest.fn();
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    it('calls git apply with the selected snippet patch', async () => {
        gitlabService.getSnippets = async () => [snippets_js_1.patchSnippet];
        gitlabService.getSnippetContent = async () => DIFF_OUTPUT;
        await (0, apply_snippet_patch_1.applySnippetPatch)(wrappedRepository);
        expect(wrappedRepository.apply).toHaveBeenCalled();
        expect(await getAppliedPatchContent()).toBe(DIFF_OUTPUT);
        expect(fs_1.promises.unlink).toHaveBeenCalled();
    });
    it('shows information message when it cannot find any snippets', async () => {
        gitlabService.getSnippets = async () => [];
        await (0, apply_snippet_patch_1.applySnippetPatch)(wrappedRepository);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(apply_snippet_patch_1.NO_PATCH_SNIPPETS_MESSAGE);
    });
    it('shows information message when returned snippets are not patch snippets', async () => {
        gitlabService.getSnippets = async () => [snippets_js_1.testSnippet1, snippets_js_1.testSnippet2];
        await (0, apply_snippet_patch_1.applySnippetPatch)(wrappedRepository);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(apply_snippet_patch_1.NO_PATCH_SNIPPETS_MESSAGE);
    });
});
//# sourceMappingURL=apply_snippet_patch.test.js.map