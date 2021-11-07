"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromReviewUri = exports.toReviewUri = void 0;
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
function toReviewUri({ path = '', commit, repositoryRoot, projectId, mrId, }) {
    const query = { commit, repositoryRoot, projectId, mrId };
    return vscode_1.Uri.file(path).with({
        scheme: constants_1.REVIEW_URI_SCHEME,
        query: JSON.stringify(query, Object.keys(query).sort()),
    });
}
exports.toReviewUri = toReviewUri;
function fromReviewUri(uri) {
    const { commit, repositoryRoot, projectId, mrId } = JSON.parse(uri.query);
    return {
        path: uri.path || undefined,
        commit,
        repositoryRoot,
        projectId,
        mrId,
    };
}
exports.fromReviewUri = fromReviewUri;
//# sourceMappingURL=review_uri.js.map