"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gitlab_comment_1 = require("./gitlab_comment");
const discussions_js_1 = require("../../test/integration/fixtures/graphql/discussions.js");
describe('GitLabComment', () => {
    let comment;
    const createGitLabComment = (note) => {
        comment = gitlab_comment_1.GitLabComment.fromGqlNote(note, {});
    };
    beforeEach(() => {
        createGitLabComment(discussions_js_1.noteOnDiff);
    });
    describe('context', () => {
        it('sets context to canAdmin if the user can edit the comment', () => {
            expect(comment.contextValue).toMatch('canAdmin');
        });
        it('leaves the context undefined if the user cannot edit the comment', () => {
            createGitLabComment({
                ...discussions_js_1.noteOnDiff,
                userPermissions: {
                    ...discussions_js_1.noteOnDiff.userPermissions,
                    adminNote: false, // user can't edit
                },
            });
            expect(comment.contextValue).not.toMatch('canAdmin');
        });
    });
});
//# sourceMappingURL=gitlab_comment.test.js.map