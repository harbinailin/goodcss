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
const gitLabService = __importStar(require("./gitlab_service"));
const current_branch_refresher_1 = require("./current_branch_refresher");
const git_extension_wrapper_1 = require("./git/git_extension_wrapper");
const extension_state_1 = require("./extension_state");
const as_mock_1 = require("./test_utils/as_mock");
const entities_1 = require("./test_utils/entities");
jest.mock('./gitlab_service');
jest.mock('./git/git_extension_wrapper');
jest.mock('./extension_state');
describe('CurrentBranchRefrehser', () => {
    beforeEach(() => {
        (0, as_mock_1.asMock)(extension_state_1.extensionState.isValid).mockReturnValue(true);
    });
    describe('invalid state', () => {
        it('returns invalid state if the current repo does not contain GitLab project', async () => {
            (0, as_mock_1.asMock)(git_extension_wrapper_1.gitExtensionWrapper.getActiveRepository).mockReturnValue({
                rootFsPath: '/folder',
                getProject: async () => undefined,
            });
            const state = await current_branch_refresher_1.CurrentBranchRefresher.getState(false);
            expect(state.valid).toBe(false);
        });
    });
    describe('valid state', () => {
        beforeEach(() => {
            (0, as_mock_1.asMock)(git_extension_wrapper_1.gitExtensionWrapper.getActiveRepository).mockReturnValue({
                rootFsPath: '/folder',
                getProject: async () => entities_1.project,
            });
        });
        it('fetches pipeline', async () => {
            (0, as_mock_1.asMock)(gitLabService.fetchPipelineAndMrForCurrentBranch).mockResolvedValue({ pipeline: entities_1.pipeline });
            const state = await current_branch_refresher_1.CurrentBranchRefresher.getState(false);
            expect(state.valid).toBe(true);
            expect(state.pipeline).toEqual(entities_1.pipeline);
        });
        it('fetches MR', async () => {
            (0, as_mock_1.asMock)(gitLabService.fetchPipelineAndMrForCurrentBranch).mockResolvedValue({ mr: entities_1.mr });
            (0, as_mock_1.asMock)(gitLabService.fetchMRIssues).mockReturnValue([]);
            const state = await current_branch_refresher_1.CurrentBranchRefresher.getState(false);
            expect(state.valid).toBe(true);
            expect(state.mr).toEqual(entities_1.mr);
        });
        it('fetches closing issues', async () => {
            (0, as_mock_1.asMock)(gitLabService.fetchPipelineAndMrForCurrentBranch).mockResolvedValue({ mr: entities_1.mr });
            (0, as_mock_1.asMock)(gitLabService.fetchMRIssues).mockReturnValue([entities_1.issue]);
            const state = await current_branch_refresher_1.CurrentBranchRefresher.getState(false);
            expect(state.valid).toBe(true);
            expect(state.issues).toEqual([entities_1.issue]);
        });
    });
});
//# sourceMappingURL=current_branch_refresher.test.js.map