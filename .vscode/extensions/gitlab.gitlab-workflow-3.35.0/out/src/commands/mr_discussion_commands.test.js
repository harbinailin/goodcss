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
const utils_1 = require("ts-jest/utils");
const discussions_js_1 = require("../../test/integration/fixtures/graphql/discussions.js");
const git_extension_wrapper_1 = require("../git/git_extension_wrapper");
const gitlab_comment_1 = require("../review/gitlab_comment");
const review_uri_1 = require("../review/review_uri");
const mr_discussion_commands_1 = require("./mr_discussion_commands");
const entities_1 = require("../test_utils/entities");
const constants_1 = require("../constants");
jest.mock('../git/git_extension_wrapper');
describe('MR discussion commands', () => {
    describe('deleteComment', () => {
        let mockedComment;
        beforeEach(() => {
            mockedComment = {
                thread: {
                    deleteComment: jest.fn(),
                },
            };
        });
        afterEach(() => {
            vscode.window.showWarningMessage.mockReset();
        });
        it('calls deleteComment on the thread if the user confirms deletion', async () => {
            vscode.window.showWarningMessage.mockResolvedValue('Delete'); // user clicked Delete
            await (0, mr_discussion_commands_1.deleteComment)(mockedComment);
            expect(mockedComment.thread.deleteComment).toHaveBeenCalledWith(mockedComment);
            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('Delete comment?', { modal: true }, 'Delete');
        });
        it("doesn't call deleteComment on the thread if the user cancels deletion", async () => {
            vscode.window.showWarningMessage.mockResolvedValue(undefined); // user clicked cancel
            await (0, mr_discussion_commands_1.deleteComment)(mockedComment);
            expect(mockedComment.thread.deleteComment).not.toHaveBeenCalled();
        });
    });
    describe('create comment', () => {
        describe('responding in a thread', () => {
            it('responds if the thread already contains comments', async () => {
                const mockedGitLabThread = {
                    reply: jest.fn(),
                };
                const comment = gitlab_comment_1.GitLabComment.fromGqlNote(discussions_js_1.noteOnDiff, mockedGitLabThread);
                const mockedVsThread = {
                    comments: [comment],
                };
                await (0, mr_discussion_commands_1.createComment)({
                    text: 'reply text',
                    thread: mockedVsThread,
                });
                expect(comment.thread.reply).toHaveBeenCalledWith('reply text');
            });
        });
        describe('creating a new thread', () => {
            // this diff hunk represents the diff where we create a new comment thread
            const diff = [
                '@@ -1,10 +1,10 @@',
                ' 1',
                '-2',
                '-3',
                ' 4',
                ' 5',
                ' 6',
                ' 7',
                ' 8',
                '+8.1',
                '+8.2',
                ' 9',
                ' 10',
            ].join('\n');
            const mrDiff = {
                ...entities_1.mrVersion.diffs[0],
                diff,
                old_path: 'old/path/to/file.js',
                new_path: 'new/path/to/file.js',
            };
            const customMrVersion = {
                ...entities_1.mrVersion,
                base_commit_sha: 'aaaaa',
                head_commit_sha: 'bbbbb',
                start_commit_sha: 'ccccc',
                diffs: [mrDiff],
            };
            const createVsThread = (filePath, fileCommit, lineNumber) => {
                const uri = (0, review_uri_1.toReviewUri)({
                    path: filePath,
                    commit: fileCommit,
                    repositoryRoot: 'root',
                    projectId: entities_1.mr.project_id,
                    mrId: entities_1.mr.id,
                });
                return {
                    comments: [],
                    uri,
                    range: {
                        start: new vscode.Position(lineNumber - 1, 0), // VS Code indexes lines starting from 0
                    },
                };
            };
            let mockedCreateDiffNote;
            beforeEach(() => {
                mockedCreateDiffNote = jest.fn().mockResolvedValue(discussions_js_1.discussionOnDiff);
                const mockedWrappedRepository = {
                    getMr: () => ({ mr: entities_1.mr, mrVersion: customMrVersion }),
                    getGitLabService: () => ({
                        createDiffNote: mockedCreateDiffNote,
                    }),
                };
                (0, utils_1.mocked)(git_extension_wrapper_1.gitExtensionWrapper).getRepository.mockReturnValue(mockedWrappedRepository);
            });
            it.each `
        scenario            | filePath           | fileCommit                         | lineNumber | expectedOldLine | expectedNewLine
        ${'old line'}       | ${mrDiff.old_path} | ${customMrVersion.base_commit_sha} | ${2}       | ${2}            | ${undefined}
        ${'new line'}       | ${mrDiff.new_path} | ${customMrVersion.head_commit_sha} | ${7}       | ${undefined}    | ${7}
        ${'unchanged line'} | ${mrDiff.old_path} | ${customMrVersion.base_commit_sha} | ${4}       | ${4}            | ${2}
      `('creates thread correctly for $scenario', async ({ filePath, fileCommit, lineNumber, expectedOldLine, expectedNewLine }) => {
                await (0, mr_discussion_commands_1.createComment)({
                    text: 'new thread text',
                    thread: createVsThread(filePath, fileCommit, lineNumber),
                });
                expect(mockedCreateDiffNote).toHaveBeenCalledWith(entities_1.mr.id, 'new thread text', {
                    baseSha: 'aaaaa',
                    headSha: 'bbbbb',
                    startSha: 'ccccc',
                    paths: {
                        oldPath: 'old/path/to/file.js',
                        newPath: 'new/path/to/file.js',
                    },
                    oldLine: expectedOldLine,
                    newLine: expectedNewLine,
                });
            });
            describe('retryFailedComment', () => {
                let thread;
                let comment;
                beforeEach(() => {
                    thread = createVsThread(mrDiff.old_path, customMrVersion.base_commit_sha, 2);
                    comment = {
                        contextValue: constants_1.FAILED_COMMENT_CONTEXT,
                        body: 'failed comment body',
                        thread,
                    };
                    thread.comments = [comment];
                });
                it('when retry succeeds, it will replace failed comment with synced comment', async () => {
                    await (0, mr_discussion_commands_1.retryFailedComment)(comment);
                    expect(thread.comments.length).toBe(1);
                    expect(thread.comments[0].body).toBe(discussions_js_1.discussionOnDiff.notes.nodes[0].body);
                    expect(thread.comments[0].contextValue).toMatch(constants_1.SYNCED_COMMENT_CONTEXT);
                });
                it('when retry fails, it will leave the failed comment in the thread', async () => {
                    mockedCreateDiffNote.mockRejectedValue(new Error('failure to create a comment'));
                    await expect(async () => (0, mr_discussion_commands_1.retryFailedComment)(comment)).rejects.toBeInstanceOf(Error);
                    expect(thread.comments.length).toBe(1);
                    expect(thread.comments[0].body).toBe('failed comment body');
                    expect(thread.comments[0].contextValue).toMatch(constants_1.FAILED_COMMENT_CONTEXT);
                });
            });
        });
    });
});
//# sourceMappingURL=mr_discussion_commands.test.js.map