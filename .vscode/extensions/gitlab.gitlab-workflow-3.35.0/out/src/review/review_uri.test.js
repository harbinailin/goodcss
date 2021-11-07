"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const review_uri_1 = require("./review_uri");
describe('review_uri.ts', () => {
    const reviewUriParams = {
        commit: 'abcdef',
        path: '/review',
        projectId: 1234,
        mrId: 2345,
        repositoryRoot: 'path/to/workspace',
    };
    describe('toReviewUri', () => {
        it('returns the correct Uri', () => {
            const result = (0, review_uri_1.toReviewUri)(reviewUriParams);
            expect(result.toString()).toEqual('gl-review:///review?{"commit":"abcdef","mrId":2345,"projectId":1234,"repositoryRoot":"path/to/workspace"}');
        });
    });
    describe('fromReviewUri', () => {
        it('returns the correct string', () => {
            const result = (0, review_uri_1.fromReviewUri)((0, review_uri_1.toReviewUri)(reviewUriParams));
            expect(result).toEqual(reviewUriParams);
        });
    });
});
//# sourceMappingURL=review_uri.test.js.map