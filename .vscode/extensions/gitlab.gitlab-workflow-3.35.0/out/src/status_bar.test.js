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
const gitLabService = __importStar(require("./gitlab_service"));
const entities_1 = require("./test_utils/entities");
const command_names_1 = require("./command_names");
const as_mock_1 = require("./test_utils/as_mock");
jest.mock('./gitlab_service');
jest.mock('./git/git_extension_wrapper');
jest.mock('./extension_state');
(0, as_mock_1.asMock)(vscode.workspace.getConfiguration).mockReturnValue({
    showStatusBarLinks: true,
    showIssueLinkOnStatusBar: true,
    showMrStatusOnStatusBar: true,
});
// StatusBar needs to be imported after we mock the configuration because it uses the configuration
// during module initialization
// eslint-disable-next-line import/first
const status_bar_1 = require("./status_bar");
const createFakeItem = () => ({
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn(),
});
const createBranchInfo = (partialInfo = {}) => ({
    valid: true,
    repository: entities_1.repository,
    issues: [],
    jobs: [],
    userInitiated: true,
    ...partialInfo,
});
describe('status_bar', () => {
    let fakeItems;
    let statusBar;
    const getPipelineItem = () => fakeItems[0];
    const getMrItem = () => fakeItems[1];
    const getClosingIssueItem = () => fakeItems[2];
    beforeEach(() => {
        fakeItems = [];
        (0, as_mock_1.asMock)(vscode.window.createStatusBarItem).mockImplementation(() => {
            const fakeItem = createFakeItem();
            fakeItems.push(fakeItem);
            return fakeItem;
        });
        statusBar = new status_bar_1.StatusBar();
        statusBar.init();
    });
    afterEach(() => {
        statusBar.dispose();
    });
    it('hides all items when the state is not valid', async () => {
        await statusBar.refresh({ valid: false });
        expect(getPipelineItem().hide).toHaveBeenCalled();
        expect(getMrItem().hide).toHaveBeenCalled();
        expect(getClosingIssueItem().hide).toHaveBeenCalled();
    });
    describe('pipeline item', () => {
        beforeEach(() => {
            (0, as_mock_1.asMock)(gitLabService.fetchJobsForPipeline).mockReset();
        });
        it('initializes the pipeline item with success', async () => {
            (0, as_mock_1.asMock)(gitLabService.fetchPipelineAndMrForCurrentBranch).mockResolvedValue({ pipeline: entities_1.pipeline });
            await statusBar.refresh(createBranchInfo({ pipeline: entities_1.pipeline }));
            expect(getPipelineItem().show).toHaveBeenCalled();
            expect(getPipelineItem().hide).not.toHaveBeenCalled();
            expect(getPipelineItem().text).toBe('$(check) GitLab: Pipeline passed');
        });
        it('prints jobs for running pipeline', async () => {
            const jobs = [
                {
                    ...entities_1.job,
                    status: 'running',
                    name: 'Unit Tests',
                },
                {
                    ...entities_1.job,
                    status: 'running',
                    name: 'Integration Tests',
                },
                {
                    ...entities_1.job,
                    status: 'success',
                    name: 'Lint',
                },
            ];
            await statusBar.refresh(createBranchInfo({ pipeline: { ...entities_1.pipeline, status: 'running' }, jobs }));
            expect(getPipelineItem().text).toBe('$(pulse) GitLab: Pipeline running (Unit Tests, Integration Tests)');
        });
        it('sorts by created time (starts with newer) and deduplicates jobs for running pipeline', async () => {
            const jobs = [
                {
                    ...entities_1.job,
                    status: 'running',
                    name: 'Integration Tests',
                    created_at: '2021-07-19T12:00:00.000Z',
                },
                {
                    ...entities_1.job,
                    status: 'running',
                    name: 'Unit Tests',
                    created_at: '2021-07-19T10:00:00.000Z',
                },
                {
                    ...entities_1.job,
                    status: 'running',
                    name: 'Unit Tests',
                    created_at: '2021-07-19T11:00:00.000Z',
                },
            ];
            await statusBar.refresh(createBranchInfo({ pipeline: { ...entities_1.pipeline, status: 'running' }, jobs }));
            expect(getPipelineItem().text).toBe('$(pulse) GitLab: Pipeline running (Unit Tests, Integration Tests)');
        });
        it('shows no pipeline text when there is no pipeline', async () => {
            await statusBar.refresh(createBranchInfo());
            expect(getPipelineItem().text).toBe('GitLab: No pipeline.');
        });
        it.each `
      status        | itemText
      ${'running'}  | ${'$(pulse) GitLab: Pipeline running'}
      ${'success'}  | ${'$(check) GitLab: Pipeline passed'}
      ${'pending'}  | ${'$(clock) GitLab: Pipeline pending'}
      ${'failed'}   | ${'$(x) GitLab: Pipeline failed'}
      ${'canceled'} | ${'$(circle-slash) GitLab: Pipeline canceled'}
      ${'skipped'}  | ${'$(diff-renamed) GitLab: Pipeline skipped'}
    `('shows $itemText for pipeline with status $status', async ({ status, itemText }) => {
            (0, as_mock_1.asMock)(gitLabService.fetchPipelineAndMrForCurrentBranch).mockResolvedValue({
                pipeline: {
                    ...entities_1.pipeline,
                    status,
                },
            });
            await statusBar.refresh(createBranchInfo({ pipeline: { ...entities_1.pipeline, status } }));
            expect(getPipelineItem().text).toBe(itemText);
        });
    });
    describe('MR item', () => {
        it('shows MR item', async () => {
            var _a;
            await statusBar.refresh(createBranchInfo({ mr: entities_1.mr }));
            expect(getMrItem().show).toHaveBeenCalled();
            expect(getMrItem().hide).not.toHaveBeenCalled();
            expect(getMrItem().text).toBe('$(git-pull-request) GitLab: MR !2000');
            const command = getMrItem().command;
            expect(command.command).toBe('vscode.open');
            expect((_a = command.arguments) === null || _a === void 0 ? void 0 : _a[0]).toEqual(vscode.Uri.parse(entities_1.mr.web_url));
        });
        it('shows create MR text when there is no MR', async () => {
            await statusBar.refresh(createBranchInfo());
            expect(getMrItem().text).toBe('$(git-pull-request) GitLab: Create MR.');
            expect(getMrItem().command).toBe(command_names_1.USER_COMMANDS.OPEN_CREATE_NEW_MR);
        });
    });
    describe('MR closing issue item', () => {
        it('shows closing issue for an MR', async () => {
            var _a;
            await statusBar.refresh(createBranchInfo({ mr: entities_1.mr, issues: [entities_1.issue] }));
            expect(getClosingIssueItem().show).toHaveBeenCalled();
            expect(getClosingIssueItem().hide).not.toHaveBeenCalled();
            expect(getClosingIssueItem().text).toBe('$(code) GitLab: Issue #1000');
            const command = getClosingIssueItem().command;
            expect(command.command).toBe('vscode.open');
            expect((_a = command.arguments) === null || _a === void 0 ? void 0 : _a[0]).toEqual(vscode.Uri.parse(entities_1.issue.web_url));
        });
        it('shows no issue when there is not a closing issue', async () => {
            await statusBar.refresh(createBranchInfo({ mr: entities_1.mr, issues: [] }));
            expect(getClosingIssueItem().text).toBe('$(code) GitLab: No issue.');
            expect(getClosingIssueItem().command).toBe(undefined);
        });
        it('hides the item when there is is no MR', async () => {
            await statusBar.refresh(createBranchInfo());
            expect(getClosingIssueItem().hide).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=status_bar.test.js.map