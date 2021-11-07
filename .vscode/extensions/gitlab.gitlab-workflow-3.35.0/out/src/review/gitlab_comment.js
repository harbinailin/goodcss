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
exports.GitLabComment = void 0;
const vscode = __importStar(require("vscode"));
const constants_1 = require("../constants");
class GitLabComment {
    constructor(gqlNote, mode, thread, body) {
        this.gqlNote = gqlNote;
        this.mode = mode;
        this.thread = thread;
        this.body = body;
    }
    get id() {
        return this.gqlNote.id;
    }
    get contextValue() {
        return `${constants_1.SYNCED_COMMENT_CONTEXT}${this.gqlNote.userPermissions.adminNote ? ';canAdmin' : undefined}`;
    }
    get author() {
        const { name, avatarUrl } = this.gqlNote.author;
        return {
            name,
            iconPath: avatarUrl !== null ? vscode.Uri.parse(avatarUrl) : undefined,
        };
    }
    resetBody() {
        return this.copyWith({ body: this.gqlNote.body });
    }
    markBodyAsSubmitted() {
        return this.copyWith({
            note: {
                ...this.gqlNote,
                body: this.body, // this synchronizes the API response with the latest body
            },
        });
    }
    withMode(mode) {
        return this.copyWith({ mode });
    }
    copyWith({ mode, body, note }) {
        return new GitLabComment(note !== null && note !== void 0 ? note : this.gqlNote, mode !== null && mode !== void 0 ? mode : this.mode, this.thread, body !== null && body !== void 0 ? body : this.body);
    }
    static fromGqlNote(gqlNote, thread) {
        return new GitLabComment(gqlNote, vscode.CommentMode.Preview, thread, gqlNote.body);
    }
}
exports.GitLabComment = GitLabComment;
//# sourceMappingURL=gitlab_comment.js.map