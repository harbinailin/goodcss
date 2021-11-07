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
const create_snippet_patch_1 = require("./create_snippet_patch");
const entities_1 = require("../test_utils/entities");
const as_mock_1 = require("../test_utils/as_mock");
const gitlab_service_1 = require("../gitlab_service");
const openers_1 = require("../openers");
jest.mock('../git/git_extension_wrapper');
jest.mock('../gitlab_service');
jest.mock('../openers');
const SNIPPET_URL = 'https://gitlab.com/test-group/test-project/-/snippets/2146265';
const DIFF_OUTPUT = 'diff --git a/.gitlab-ci.yml b/.gitlab-ci.yml';
describe('create snippet patch', () => {
    let wrappedRepository;
    beforeEach(() => {
        const mockRepository = {
            lastCommitSha: 'abcd1234567',
            getTrackingBranchName: async () => 'tracking-branch-name',
            getProject: async () => entities_1.project,
            diff: async () => DIFF_OUTPUT,
        };
        wrappedRepository = mockRepository;
        (0, as_mock_1.asMock)(vscode.window.showInputBox).mockResolvedValue('snippet_name');
        (0, as_mock_1.asMock)(vscode.window.showQuickPick).mockImplementation(options => options.filter((o) => o.type === 'private').pop());
        (0, as_mock_1.asMock)(gitlab_service_1.createSnippet).mockResolvedValue({
            web_url: SNIPPET_URL,
        });
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    it('creates a snippet patch and opens it in a browser', async () => {
        await (0, create_snippet_patch_1.createSnippetPatch)(wrappedRepository);
        expect(openers_1.openUrl).toHaveBeenCalledWith(SNIPPET_URL);
    });
    describe('populating the create snippet request', () => {
        let formData;
        beforeEach(async () => {
            await (0, create_snippet_patch_1.createSnippetPatch)(wrappedRepository);
            [[, formData]] = (0, as_mock_1.asMock)(gitlab_service_1.createSnippet).mock.calls;
        });
        it('prepends "patch: " to the user input to create snippet title', () => {
            expect(formData.title).toBe('patch: snippet_name');
        });
        it('appends ".patch" to the user input to create snippet file name', () => {
            expect(formData.file_name).toBe('snippet_name.patch');
        });
        it("sets user's choice of visibility (private selected in test setup)", () => {
            expect(formData.visibility).toBe('private');
        });
        it('sets the diff command output as the blob content', () => {
            expect(formData.content).toBe(DIFF_OUTPUT);
        });
    });
});
//# sourceMappingURL=create_snippet_patch.test.js.map