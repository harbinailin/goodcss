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
exports.retryFailedComment = exports.createComment = exports.submitEdit = exports.cancelFailedComment = exports.cancelEdit = exports.editComment = exports.deleteComment = exports.toggleResolved = void 0;
const assert_1 = __importDefault(require("assert"));
const vscode = __importStar(require("vscode"));
const constants_1 = require("../constants");
const diff_line_count_1 = require("../git/diff_line_count");
const git_extension_wrapper_1 = require("../git/git_extension_wrapper");
const gitlab_comment_1 = require("../review/gitlab_comment");
const gitlab_comment_thread_1 = require("../review/gitlab_comment_thread");
const review_uri_1 = require("../review/review_uri");
const find_file_in_diffs_1 = require("../utils/find_file_in_diffs");
const getLineNumber = (thread) => thread.range.start.line + 1;
const createNewComment = async (text, thread) => {
    const { path, commit, repositoryRoot, mrId } = (0, review_uri_1.fromReviewUri)(thread.uri);
    const repository = git_extension_wrapper_1.gitExtensionWrapper.getRepository(repositoryRoot);
    const cachedMr = repository.getMr(mrId);
    (0, assert_1.default)(cachedMr);
    const { mr, mrVersion } = cachedMr;
    const isOld = commit === mrVersion.base_commit_sha;
    const diff = (0, find_file_in_diffs_1.findFileInDiffs)(mrVersion.diffs, isOld ? { oldPath: path } : { newPath: path });
    (0, assert_1.default)(diff);
    const positionFragment = isOld
        ? {
            oldLine: getLineNumber(thread),
            // we let user comment on any line on the old version of the diff
            // this means some of the lines might be unchanged
            // till https://gitlab.com/gitlab-org/gitlab/-/issues/325161 gets fixed, we need to compute
            // the new line index for unchanged line.
            newLine: (0, diff_line_count_1.getNewLineForOldUnchangedLine)(mrVersion, path, getLineNumber(thread)),
        }
        : { newLine: getLineNumber(thread) };
    const discussion = await repository.getGitLabService().createDiffNote(mrId, text, {
        baseSha: mrVersion.base_commit_sha,
        headSha: mrVersion.head_commit_sha,
        startSha: mrVersion.start_commit_sha,
        paths: {
            oldPath: diff.old_path,
            newPath: diff.new_path,
        },
        ...positionFragment,
    });
    return new gitlab_comment_thread_1.GitLabCommentThread(thread, discussion, repository.getGitLabService(), mr);
};
const createFailedComment = (body, thread) => ({
    author: { name: '' },
    body,
    mode: vscode.CommentMode.Editing,
    contextValue: constants_1.FAILED_COMMENT_CONTEXT,
    thread,
});
const addFailedCommentToThread = (text, vsThread) => {
    vsThread.comments = [createFailedComment(text, vsThread)]; // eslint-disable-line no-param-reassign
    vsThread.canReply = false; // eslint-disable-line no-param-reassign
};
const toggleResolved = async (vsThread) => {
    const firstComment = vsThread.comments[0];
    (0, assert_1.default)(firstComment instanceof gitlab_comment_1.GitLabComment);
    const gitlabThread = firstComment.thread;
    return gitlabThread.toggleResolved();
};
exports.toggleResolved = toggleResolved;
const deleteComment = async (comment) => {
    const DELETE_ACTION = 'Delete';
    const shouldDelete = await vscode.window.showWarningMessage('Delete comment?', { modal: true }, DELETE_ACTION);
    if (shouldDelete !== DELETE_ACTION) {
        return undefined;
    }
    return comment.thread.deleteComment(comment);
};
exports.deleteComment = deleteComment;
const editComment = (comment) => {
    comment.thread.startEdit(comment);
};
exports.editComment = editComment;
const cancelEdit = (comment) => {
    comment.thread.cancelEdit(comment);
};
exports.cancelEdit = cancelEdit;
const cancelFailedComment = (comment) => {
    const { thread } = comment;
    thread.dispose();
};
exports.cancelFailedComment = cancelFailedComment;
const submitEdit = async (comment) => {
    return comment.thread.submitEdit(comment);
};
exports.submitEdit = submitEdit;
const createComment = async ({ text, thread, }) => {
    var _a;
    const firstComment = thread.comments[0];
    if (!firstComment || ((_a = firstComment.contextValue) === null || _a === void 0 ? void 0 : _a.match(constants_1.FAILED_COMMENT_CONTEXT))) {
        try {
            await createNewComment(text, thread);
            return;
        }
        catch (e) {
            addFailedCommentToThread(text, thread);
            throw e;
        }
    }
    (0, assert_1.default)(firstComment instanceof gitlab_comment_1.GitLabComment);
    const gitlabThread = firstComment.thread;
    await gitlabThread.reply(text);
};
exports.createComment = createComment;
const retryFailedComment = async (comment) => {
    const { thread } = comment;
    const text = comment.body;
    return (0, exports.createComment)({ text, thread });
};
exports.retryFailedComment = retryFailedComment;
//# sourceMappingURL=mr_discussion_commands.js.map