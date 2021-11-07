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
exports.GitLabCommentThread = void 0;
const vscode = __importStar(require("vscode"));
const assert_1 = __importDefault(require("assert"));
const gitlab_comment_1 = require("./gitlab_comment");
const firstNoteFrom = (discussion) => {
    const note = discussion.notes.nodes[0];
    (0, assert_1.default)(note, 'discussion should contain at least one note');
    return note;
};
const isDiffNote = (note) => {
    return Boolean(note.position && note.position.positionType === 'text');
};
class GitLabCommentThread {
    /** Has a side-effect of populating the vsThread with all comments */
    constructor(vsThread, gqlDiscussion, gitlabService, mr) {
        this.vsThread = vsThread;
        this.gqlDiscussion = gqlDiscussion;
        this.gitlabService = gitlabService;
        this.mr = mr;
        // SIDE-EFFECT
        this.vsThread.comments = gqlDiscussion.notes.nodes.map(note => gitlab_comment_1.GitLabComment.fromGqlNote(note, this));
        this.vsThread.collapsibleState = vscode.CommentThreadCollapsibleState.Expanded;
        this.vsThread.canReply = firstNoteFrom(gqlDiscussion).userPermissions.createNote;
        this.resolved = gqlDiscussion.resolved;
        this.updateThreadContext();
    }
    async toggleResolved() {
        await this.gitlabService.setResolved(this.gqlDiscussion.replyId, !this.resolved);
        this.resolved = !this.resolved;
        this.updateThreadContext();
    }
    allowedToResolve() {
        const [firstNote] = this.gqlDiscussion.notes.nodes;
        (0, assert_1.default)(firstNote);
        return firstNote.userPermissions.resolveNote;
    }
    async deleteComment(comment) {
        await this.gitlabService.deleteNote(comment.id);
        this.vsThread.comments = this.vsThread.comments.filter(c => {
            if (c instanceof gitlab_comment_1.GitLabComment)
                return c.id !== comment.id;
            return true;
        });
        if (this.vsThread.comments.length === 0) {
            this.vsThread.dispose();
        }
    }
    startEdit(comment) {
        this.changeOneComment(comment.id, c => c.withMode(vscode.CommentMode.Editing));
    }
    cancelEdit(comment) {
        this.changeOneComment(comment.id, c => c.withMode(vscode.CommentMode.Preview).resetBody());
    }
    async submitEdit(comment) {
        await this.gitlabService.updateNoteBody(comment.id, comment.body, comment.gqlNote.body, // this is what we think is the latest version stored in API
        this.mr);
        this.changeOneComment(comment.id, c => c.markBodyAsSubmitted().withMode(vscode.CommentMode.Preview));
    }
    async reply(text) {
        const note = await this.gitlabService.createNote(this.mr, text, this.gqlDiscussion.replyId);
        (0, assert_1.default)(isDiffNote(note));
        this.vsThread.comments = [...this.vsThread.comments, gitlab_comment_1.GitLabComment.fromGqlNote(note, this)];
        // prevent mutating existing API response by making deeper copy
        this.gqlDiscussion = {
            ...this.gqlDiscussion,
            notes: {
                nodes: [...this.gqlDiscussion.notes.nodes, note],
            },
        };
    }
    changeOneComment(id, changeFn) {
        this.vsThread.comments = this.vsThread.comments.map(c => {
            if (c instanceof gitlab_comment_1.GitLabComment && c.id === id) {
                return changeFn(c);
            }
            return c;
        });
    }
    updateThreadContext() {
        // when user doesn't have permission to resolve the discussion we don't show the
        // resolve/unresolve buttons at all (`context` stays `undefined`) because otherwise
        // user would be presented with buttons that don't do anything when clicked
        if (this.gqlDiscussion.resolvable && this.allowedToResolve()) {
            this.vsThread.contextValue = this.resolved ? 'resolved' : 'unresolved';
        }
    }
}
exports.GitLabCommentThread = GitLabCommentThread;
//# sourceMappingURL=gitlab_comment_thread.js.map