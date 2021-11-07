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
const mr_item_model_1 = require("./mr_item_model");
const entities_1 = require("../../test_utils/entities");
const discussions_js_1 = require("../../../test/integration/fixtures/graphql/discussions.js");
const mrVersion = __importStar(require("../../../test/integration/fixtures/rest/mr_version.json"));
const commenting_range_provider_1 = require("../../review/commenting_range_provider");
const create_wrapped_repository_1 = require("../../test_utils/create_wrapped_repository");
const review_uri_1 = require("../../review/review_uri");
const constants_1 = require("../../constants");
const createCommentControllerMock = vscode.comments.createCommentController;
describe('MrItemModel', () => {
    let item;
    let commentThread;
    let canUserCommentOnMr = false;
    let commentController;
    let gitLabService;
    let repository;
    const createCommentThreadMock = jest.fn();
    beforeEach(() => {
        gitLabService = {
            getDiscussions: jest.fn().mockResolvedValue([discussions_js_1.discussionOnDiff, discussions_js_1.multipleNotes]),
            getMrDiff: jest.fn().mockResolvedValue({ diffs: [] }),
            canUserCommentOnMr: jest.fn(async () => canUserCommentOnMr),
        };
        repository = (0, create_wrapped_repository_1.createWrappedRepository)({
            gitLabService,
        });
        item = new mr_item_model_1.MrItemModel(entities_1.mr, repository);
        commentThread = {};
        commentController = {
            createCommentThread: createCommentThreadMock.mockReturnValue(commentThread),
            dispose: jest.fn(),
        };
        createCommentControllerMock.mockReturnValue(commentController);
    });
    afterEach(() => {
        createCommentControllerMock.mockReset();
        createCommentThreadMock.mockReset();
    });
    describe('MR item context', () => {
        it('should return return correct context when MR comes from the same project', () => {
            item = new mr_item_model_1.MrItemModel({ ...entities_1.mr, source_project_id: 1234, target_project_id: 1234 }, repository);
            expect(item.getTreeItem().contextValue).toBe('mr-item-from-same-project');
        });
        it('should return return correct context when MR comes from a fork', () => {
            item = new mr_item_model_1.MrItemModel({ ...entities_1.mr, source_project_id: 5678, target_project_id: 1234 }, repository);
            expect(item.getTreeItem().contextValue).toBe('mr-item-from-fork');
        });
    });
    it('should add comment thread to VS Code', async () => {
        await item.getChildren();
        expect(createCommentControllerMock).toBeCalledWith('gitlab-mr-gitlab-org/gitlab!2000', 'Issuable Title');
        const [_, range] = createCommentThreadMock.mock.calls[0];
        expect(range.start.line).toBe(47);
        expect(commentThread.comments.length).toBe(1);
        const firstComment = commentThread.comments[0];
        expect(firstComment.author.name).toBe('Tomas Vik');
        expect(firstComment.mode).toBe(vscode.CommentMode.Preview);
        expect(firstComment.body).toMatch(discussions_js_1.noteOnDiffTextSnippet);
    });
    it('should associate the thread with the correct URI', async () => {
        await item.getChildren();
        const [uri] = createCommentThreadMock.mock.calls[0];
        const { mrId, projectId, repositoryRoot, commit, path } = (0, review_uri_1.fromReviewUri)(uri);
        expect(mrId).toBe(entities_1.mr.id);
        expect(projectId).toBe(entities_1.mr.project_id);
        expect(repositoryRoot).toBe(repository.rootFsPath);
        const discussionPosition = discussions_js_1.discussionOnDiff.notes.nodes[0].position;
        expect(commit).toBe(discussionPosition.diffRefs.baseSha);
        expect(path).toBe(discussionPosition.oldPath);
    });
    it('should return changed file items as children', async () => {
        var _a, _b, _c;
        gitLabService.getMrDiff = jest.fn().mockResolvedValue(mrVersion);
        const [overview, changedItem] = await item.getChildren();
        expect((_a = changedItem.resourceUri) === null || _a === void 0 ? void 0 : _a.path).toBe('.deleted.yml');
        expect((_b = changedItem.resourceUri) === null || _b === void 0 ? void 0 : _b.query).toMatch(`${constants_1.CHANGE_TYPE_QUERY_KEY}=deleted`);
        expect((_c = changedItem.resourceUri) === null || _c === void 0 ? void 0 : _c.query).toMatch(`${constants_1.HAS_COMMENTS_QUERY_KEY}=false`);
    });
    describe('commenting range', () => {
        it('should not add a commenting range provider if user does not have permission to comment', async () => {
            canUserCommentOnMr = false;
            await item.getChildren();
            expect(commentController.commentingRangeProvider).toBe(undefined);
        });
        it('should add a commenting range provider if user has permission to comment', async () => {
            canUserCommentOnMr = true;
            await item.getChildren();
            expect(commentController.commentingRangeProvider).toBeInstanceOf(commenting_range_provider_1.CommentingRangeProvider);
        });
        it('keeps the same commentController regardless how many times we call getChildren', async () => {
            await item.getChildren();
            expect(createCommentControllerMock).toHaveBeenCalledTimes(1);
            await item.getChildren();
            expect(createCommentControllerMock).toHaveBeenCalledTimes(1);
            expect(commentController.dispose).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=mr_item_model.test.js.map