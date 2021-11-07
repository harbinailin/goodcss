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
exports.MrItemModel = void 0;
const vscode = __importStar(require("vscode"));
const assert_1 = __importDefault(require("assert"));
const command_names_1 = require("../../command_names");
const changed_file_item_1 = require("./changed_file_item");
const item_model_1 = require("./item_model");
const log_1 = require("../../log");
const user_friendly_error_1 = require("../../errors/user_friendly_error");
const gitlab_comment_thread_1 = require("../../review/gitlab_comment_thread");
const commenting_range_provider_1 = require("../../review/commenting_range_provider");
const comment_controller_provider_1 = require("../../review/comment_controller_provider");
const review_uri_1 = require("../../review/review_uri");
const gql_position_parser_1 = require("../../review/gql_position_parser");
const unsupported_version_error_1 = require("../../errors/unsupported_version_error");
const isTextDiffDiscussion = (discussion) => {
    var _a;
    const firstNote = discussion.notes.nodes[0];
    return ((_a = firstNote === null || firstNote === void 0 ? void 0 : firstNote.position) === null || _a === void 0 ? void 0 : _a.positionType) === 'text';
};
const firstNoteFrom = (discussion) => {
    const note = discussion.notes.nodes[0];
    (0, assert_1.default)(note, 'discussion should contain at least one note');
    return note;
};
const uriForDiscussion = (repository, mr, discussion) => {
    const { position } = firstNoteFrom(discussion);
    return (0, review_uri_1.toReviewUri)({
        path: (0, gql_position_parser_1.pathFromPosition)(position),
        commit: (0, gql_position_parser_1.commitFromPosition)(position),
        repositoryRoot: repository.rootFsPath,
        projectId: mr.project_id,
        mrId: mr.id,
    });
};
class MrItemModel extends item_model_1.ItemModel {
    constructor(mr, repository) {
        super();
        this.mr = mr;
        this.repository = repository;
    }
    getTreeItem() {
        const { iid, title, author } = this.mr;
        const item = new vscode.TreeItem(`!${iid} · ${title}`, vscode.TreeItemCollapsibleState.Collapsed);
        if (author.avatar_url) {
            item.iconPath = vscode.Uri.parse(author.avatar_url);
        }
        item.contextValue = `mr-item-from-${this.isFromFork ? 'fork' : 'same-project'}`;
        return item;
    }
    get overviewItem() {
        const result = new vscode.TreeItem('Overview');
        result.iconPath = new vscode.ThemeIcon('note');
        result.command = {
            command: command_names_1.PROGRAMMATIC_COMMANDS.SHOW_RICH_CONTENT,
            arguments: [this.mr, this.repository.rootFsPath],
            title: 'Show MR Overview',
        };
        return result;
    }
    async getMrDiscussions() {
        try {
            const discussions = await this.repository.getGitLabService().getDiscussions({
                issuable: this.mr,
            });
            return discussions.filter(isTextDiffDiscussion);
        }
        catch (e) {
            const error = e instanceof unsupported_version_error_1.UnsupportedVersionError
                ? e
                : new user_friendly_error_1.UserFriendlyError(`The extension failed to preload discussions on the MR diff.
            It's possible that you've encountered
            https://gitlab.com/gitlab-org/gitlab/-/issues/298827.`, e);
            (0, log_1.handleError)(error);
        }
        return [];
    }
    async getChildren() {
        if (this.cachedChildren)
            return this.cachedChildren; // don't initialize comments twice
        const { mrVersion } = await this.repository.reloadMr(this.mr);
        const discussions = await this.getMrDiscussions();
        await this.addAllCommentsToVsCode(mrVersion, discussions);
        const allUrisWithComments = discussions.map(d => uriForDiscussion(this.repository, this.mr, d).toString());
        const changedFiles = mrVersion.diffs.map(diff => new changed_file_item_1.ChangedFileItem(this.mr, mrVersion, diff, this.repository.rootFsPath, uri => allUrisWithComments.includes(uri.toString())));
        this.cachedChildren = [this.overviewItem, ...changedFiles];
        return this.cachedChildren;
    }
    async addAllCommentsToVsCode(mrVersion, discussions) {
        const gitlabService = this.repository.getGitLabService();
        const userCanComment = await gitlabService.canUserCommentOnMr(this.mr);
        const commentController = comment_controller_provider_1.commentControllerProvider.borrowCommentController(this.mr.references.full, this.mr.title, userCanComment ? new commenting_range_provider_1.CommentingRangeProvider(this.mr, mrVersion) : undefined);
        this.setDisposableChildren([commentController]);
        discussions.forEach(discussion => {
            const { position } = firstNoteFrom(discussion);
            const vsThread = commentController.createCommentThread(uriForDiscussion(this.repository, this.mr, discussion), (0, gql_position_parser_1.commentRangeFromPosition)(position), 
            // the comments need to know about the thread, so we first
            // create empty thread to be able to create comments
            []);
            return new gitlab_comment_thread_1.GitLabCommentThread(vsThread, discussion, this.repository.getGitLabService(), this.mr);
        });
    }
    get isFromFork() {
        return this.mr.target_project_id !== this.mr.source_project_id;
    }
}
exports.MrItemModel = MrItemModel;
//# sourceMappingURL=mr_item_model.js.map