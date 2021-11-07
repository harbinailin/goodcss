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
const entities_1 = require("../test_utils/entities");
const commenting_range_provider_1 = require("./commenting_range_provider");
const review_uri_1 = require("./review_uri");
describe('CommentingRangeProvider', () => {
    let commentingRangeProvider;
    const commonUriParams = {
        mrId: entities_1.mr.id,
        projectId: entities_1.mr.project_id,
        repositoryRoot: '/',
    };
    const oldFileUrl = (0, review_uri_1.toReviewUri)({
        ...commonUriParams,
        commit: entities_1.mrVersion.base_commit_sha,
        path: entities_1.diffFile.old_path,
    });
    const newFileUri = (0, review_uri_1.toReviewUri)({
        ...commonUriParams,
        commit: entities_1.mrVersion.head_commit_sha,
        path: entities_1.diffFile.new_path,
    });
    beforeEach(() => {
        commentingRangeProvider = new commenting_range_provider_1.CommentingRangeProvider(entities_1.mr, entities_1.mrVersion);
    });
    it('returns empty array for different URI schema', () => {
        const testDocument = {
            uri: vscode.Uri.parse('https://example.com'),
        };
        expect(commentingRangeProvider.provideCommentingRanges(testDocument)).toEqual([]);
    });
    it('returns full range (all lines in the document) for old file', () => {
        const testDocument = {
            uri: oldFileUrl,
            lineCount: 200,
            lineAt: () => ({
                isEmptyOrWhitespace: false,
            }),
        };
        expect(commentingRangeProvider.provideCommentingRanges(testDocument)).toEqual([
            new vscode.Range(new vscode.Position(0, 0), new vscode.Position(199, 0)),
        ]);
    });
    it('returns range without the last line for old file if the last line is empty', () => {
        const testDocument = {
            uri: oldFileUrl,
            lineCount: 200,
            lineAt: () => ({
                isEmptyOrWhitespace: true,
            }),
        };
        expect(commentingRangeProvider.provideCommentingRanges(testDocument)).toEqual([
            new vscode.Range(new vscode.Position(0, 0), new vscode.Position(198, 0)),
        ]);
    });
    const threeNewLinesHunk = ['@@ -0,0 +1,3 @@', '+new file 2', '+', '+12', ''].join('\n');
    it('shows correct commenting ranges for a new file', () => {
        commentingRangeProvider = new commenting_range_provider_1.CommentingRangeProvider(entities_1.mr, {
            ...entities_1.mrVersion,
            diffs: [{ ...entities_1.diffFile, diff: threeNewLinesHunk }],
        });
        const ranges = commentingRangeProvider.provideCommentingRanges({
            uri: newFileUri,
        });
        // VS Code indexes lines starting with zero
        expect(ranges.map(r => r.start.line)).toEqual([0, 1, 2]);
    });
});
//# sourceMappingURL=commenting_range_provider.test.js.map