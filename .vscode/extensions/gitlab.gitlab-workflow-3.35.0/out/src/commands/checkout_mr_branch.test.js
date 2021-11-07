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
const mr_item_model_1 = require("../tree_view/items/mr_item_model");
const checkout_mr_branch_1 = require("./checkout_mr_branch");
const entities_1 = require("../test_utils/entities");
describe('checkout MR branch', () => {
    let mrItemModel;
    let wrappedRepository;
    beforeEach(() => {
        const mockRepository = {
            fetch: jest.fn().mockResolvedValue(undefined),
            checkout: jest.fn().mockResolvedValue(undefined),
            lastCommitSha: entities_1.mr.sha,
        };
        wrappedRepository = mockRepository;
        vscode.window.withProgress.mockImplementation((_, task) => task());
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('with branch from the same project', () => {
        beforeEach(() => {
            const mrFromTheSameProject = {
                ...entities_1.mr,
                source_project_id: 123,
                target_project_id: 123,
                source_branch_name: 'feature-a',
            };
            mrItemModel = new mr_item_model_1.MrItemModel(mrFromTheSameProject, wrappedRepository);
        });
        it('checks out the local branch', async () => {
            await (0, checkout_mr_branch_1.checkoutMrBranch)(mrItemModel);
            expect(wrappedRepository.fetch).toBeCalled();
            expect(wrappedRepository.checkout).toBeCalledWith('feature-a');
        });
        it('shows a success message', async () => {
            await (0, checkout_mr_branch_1.checkoutMrBranch)(mrItemModel);
            expect(vscode.window.showInformationMessage).toBeCalledWith('Branch changed to feature-a');
        });
        it('rejects with an error if error occurred', async () => {
            wrappedRepository.checkout.mockRejectedValue(new Error('error'));
            await expect((0, checkout_mr_branch_1.checkoutMrBranch)(mrItemModel)).rejects.toEqual(new Error('error'));
        });
        it('handles errors from the Git Extension', async () => {
            wrappedRepository.checkout.mockRejectedValue({
                gitErrorCode: "DirtyWorkTree" /* DirtyWorkTree */,
                stderr: 'Git standard output',
            });
            await (0, checkout_mr_branch_1.checkoutMrBranch)(mrItemModel);
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Checkout failed: Git standard output', 'See Git Log');
        });
        it('warns user that their local branch is not in sync', async () => {
            wrappedRepository.lastCommitSha = 'abdef'; // simulate local sha being different from mr.sha
            await (0, checkout_mr_branch_1.checkoutMrBranch)(mrItemModel);
            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith("Branch changed to feature-a, but it's out of sync with the remote branch. Synchronize it by pushing or pulling.");
        });
    });
    describe('with branch from a forked project', () => {
        beforeEach(() => {
            const mrFromAFork = {
                ...entities_1.mr,
                source_project_id: 123,
                target_project_id: 456,
                source_branch_name: 'feature-a',
            };
            mrItemModel = new mr_item_model_1.MrItemModel(mrFromAFork, wrappedRepository);
        });
        it('throws an error', async () => {
            await expect((0, checkout_mr_branch_1.checkoutMrBranch)(mrItemModel)).rejects.toMatchObject({
                message: 'this command is only available for same-project MRs',
            });
        });
    });
});
//# sourceMappingURL=checkout_mr_branch.test.js.map