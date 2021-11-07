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
const gitlab_comment_thread_1 = require("./gitlab_comment_thread");
const discussions_js_1 = require("../../test/integration/fixtures/graphql/discussions.js");
const gitlab_comment_1 = require("./gitlab_comment");
const entities_1 = require("../test_utils/entities");
const mr_discussion_commands_1 = require("../commands/mr_discussion_commands");
describe('GitLabCommentThread', () => {
    let gitlabCommentThread;
    let vsCommentThread;
    let gitlabService;
    const twoNotes = [
        {
            ...discussions_js_1.noteOnDiff,
            id: 'gid://gitlab/DiffNote/1',
            body: 'first body',
        },
        {
            ...discussions_js_1.noteOnDiff,
            id: 'gid://gitlab/DiffNote/2',
            body: 'second body',
        },
    ];
    const createGqlTextDiffDiscussion = (...notes) => {
        return {
            ...discussions_js_1.discussionOnDiff,
            notes: {
                ...discussions_js_1.discussionOnDiff.notes,
                nodes: notes,
            },
        };
    };
    const createGitLabCommentThread = (discussion) => {
        vsCommentThread = {
            uri: {},
            range: {},
            comments: {},
            collapsibleState: vscode.CommentThreadCollapsibleState.Collapsed,
            canReply: true,
            dispose: jest.fn(),
        };
        gitlabService = {
            setResolved: jest.fn(),
            deleteNote: jest.fn(),
            updateNoteBody: jest.fn(),
            createNote: jest.fn(),
        };
        gitlabCommentThread = new gitlab_comment_thread_1.GitLabCommentThread(vsCommentThread, discussion, gitlabService, entities_1.mr);
    };
    beforeEach(() => {
        createGitLabCommentThread(discussions_js_1.discussionOnDiff);
    });
    it('sets collapsible state on the VS thread', () => {
        expect(vsCommentThread.collapsibleState).toBe(vscode.CommentThreadCollapsibleState.Expanded);
    });
    describe('allowing replies to the thread', () => {
        const createNoteAndSetCreatePermissions = (createNote) => ({
            ...discussions_js_1.noteOnDiff,
            userPermissions: {
                ...discussions_js_1.noteOnDiff.userPermissions,
                createNote,
            },
        });
        it('allows replies if the first note has createNote permissions', () => {
            const note = createNoteAndSetCreatePermissions(true);
            createGitLabCommentThread(createGqlTextDiffDiscussion(note));
            expect(vsCommentThread.canReply).toBe(true);
        });
        it('disallows replies if the first note does not have createNote permissions', () => {
            const note = createNoteAndSetCreatePermissions(false);
            createGitLabCommentThread(createGqlTextDiffDiscussion(note));
            expect(vsCommentThread.canReply).toBe(false);
        });
    });
    describe('resolving discussions', () => {
        it('sets context to unresolved', () => {
            expect(vsCommentThread.contextValue).toBe('unresolved');
        });
        it('sets context to resolved', () => {
            createGitLabCommentThread({ ...discussions_js_1.discussionOnDiff, resolved: true });
            expect(vsCommentThread.contextValue).toBe('resolved');
        });
        it('toggles resolved', async () => {
            gitlabService.setResolved.mockResolvedValue(undefined);
            await gitlabCommentThread.toggleResolved();
            expect(vsCommentThread.contextValue).toBe('resolved');
            expect(gitlabService.setResolved).toHaveBeenLastCalledWith(discussions_js_1.discussionOnDiff.replyId, true);
        });
        it('does not toggle resolved if API call failed', async () => {
            const error = new Error();
            gitlabService.setResolved.mockRejectedValue(error);
            await expect(gitlabCommentThread.toggleResolved()).rejects.toBe(error);
            expect(vsCommentThread.contextValue).toBe('unresolved');
        });
        it("doesn't populate the context if user doesn't have permission to resolve the note", () => {
            const discussionWithoutPermission = createGqlTextDiffDiscussion({
                ...discussions_js_1.noteOnDiff,
                userPermissions: {
                    ...discussions_js_1.noteOnDiff.userPermissions,
                    resolveNote: false,
                },
            });
            createGitLabCommentThread(discussionWithoutPermission);
            expect(vsCommentThread.contextValue).toBe(undefined);
        });
    });
    it('creates GitLabComments', () => {
        expect(vsCommentThread.comments.length).toBe(1);
        const [comment] = vsCommentThread.comments;
        expect(comment).toBeInstanceOf(gitlab_comment_1.GitLabComment);
        expect(comment.body).toBe(discussions_js_1.noteOnDiff.body);
    });
    describe('deleting comments', () => {
        it('deletes a comment', async () => {
            createGitLabCommentThread(createGqlTextDiffDiscussion(...twoNotes));
            gitlabService.deleteNote.mockResolvedValue(undefined);
            await gitlabCommentThread.deleteComment(vsCommentThread.comments[0]);
            expect(gitlabService.deleteNote).toHaveBeenCalledWith('gid://gitlab/DiffNote/1');
            expect(vsCommentThread.dispose).not.toHaveBeenCalled();
            expect(vsCommentThread.comments.length).toBe(1);
            expect(vsCommentThread.comments[0].id).toBe('gid://gitlab/DiffNote/2');
        });
        it('disposes the thread if we delete the last comment', async () => {
            gitlabService.deleteNote.mockResolvedValue(undefined);
            await gitlabCommentThread.deleteComment(vsCommentThread.comments[0]);
            expect(vsCommentThread.dispose).toHaveBeenCalled();
            expect(vsCommentThread.comments.length).toBe(0);
        });
        it("doesn't delete the comment if the API call failed", async () => {
            const error = new Error();
            gitlabService.deleteNote.mockRejectedValue(error);
            await expect(gitlabCommentThread.deleteComment(vsCommentThread.comments[0])).rejects.toBe(error);
            expect(vsCommentThread.comments.length).toBe(1);
        });
    });
    describe('editing comments', () => {
        beforeEach(() => {
            createGitLabCommentThread(createGqlTextDiffDiscussion(...twoNotes));
        });
        it('starts editing comment', () => {
            gitlabCommentThread.startEdit(vsCommentThread.comments[0]);
            expect(vsCommentThread.comments[0].mode).toBe(vscode.CommentMode.Editing);
            expect(vsCommentThread.comments[1].mode).toBe(vscode.CommentMode.Preview);
        });
        it('replaces the original comments array when editing a comment', () => {
            const originalCommentArray = vsCommentThread.comments;
            gitlabCommentThread.startEdit(vsCommentThread.comments[0]);
            // this is important because the real vscode.CommentThread implementation listens
            // on `set comments()` and updates the visual representation when the array reference changes
            expect(vsCommentThread.comments).not.toBe(originalCommentArray);
        });
        it('stops editing the comment and resets the comment body', () => {
            gitlabCommentThread.startEdit(vsCommentThread.comments[0]);
            vsCommentThread.comments[0].body = 'new body'; // vs code updates the edited text in place
            gitlabCommentThread.cancelEdit(vsCommentThread.comments[0]);
            expect(vsCommentThread.comments[0].mode).toBe(vscode.CommentMode.Preview);
            expect(vsCommentThread.comments[0].body).toBe('first body');
            expect(vsCommentThread.comments[1].mode).toBe(vscode.CommentMode.Preview);
        });
    });
    describe('updating comments', () => {
        beforeEach(() => {
            createGitLabCommentThread(createGqlTextDiffDiscussion(...twoNotes));
            gitlabCommentThread.startEdit(vsCommentThread.comments[0]);
            vsCommentThread.comments[0].body = 'updated body';
        });
        it('submits updated comment', async () => {
            gitlabService.updateNoteBody.mockResolvedValue(undefined);
            await gitlabCommentThread.submitEdit(vsCommentThread.comments[0]);
            expect(vsCommentThread.comments[0].mode).toBe(vscode.CommentMode.Preview);
            expect(vsCommentThread.comments[0].body).toBe('updated body');
            expect(vsCommentThread.comments[0].gqlNote.body).toBe('updated body');
        });
        it("doesn't update the underlying GraphQL note body if API update fails", async () => {
            const error = new Error();
            gitlabService.updateNoteBody.mockRejectedValue(error);
            await expect(gitlabCommentThread.submitEdit(vsCommentThread.comments[0])).rejects.toBe(error);
            expect(vsCommentThread.comments[0].mode).toBe(vscode.CommentMode.Editing);
            expect(vsCommentThread.comments[0].body).toBe('updated body');
            expect(vsCommentThread.comments[0].gqlNote.body).toBe('first body');
        });
    });
    describe('replying to comments', () => {
        it('submits the reply', async () => {
            gitlabService.createNote.mockResolvedValue({
                ...discussions_js_1.noteOnDiff,
                id: 'gid://gitlab/DiffNote/3',
                body: 'reply text',
            });
            expect(vsCommentThread.comments.length).toBe(1);
            await gitlabCommentThread.reply('reply text');
            expect(vsCommentThread.comments.length).toBe(2);
            const { mode, body, gqlNote } = vsCommentThread.comments[1];
            expect(mode).toBe(vscode.CommentMode.Preview);
            expect(body).toBe('reply text');
            expect(gqlNote.body).toBe('reply text');
        });
        it('handles API error', async () => {
            const error = new Error();
            gitlabService.createNote.mockRejectedValue(error);
            expect(vsCommentThread.comments.length).toBe(1);
            await expect(gitlabCommentThread.reply('reply text')).rejects.toBe(error);
            expect(vsCommentThread.comments.length).toBe(1);
        });
    });
    describe('cancelFailedComment', () => {
        it('disposes the comment thread', () => {
            const thread = { dispose: jest.fn() };
            (0, mr_discussion_commands_1.cancelFailedComment)({ thread });
            expect(thread.dispose).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=gitlab_comment_thread.test.js.map