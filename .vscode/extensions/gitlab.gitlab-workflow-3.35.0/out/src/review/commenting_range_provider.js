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
exports.CommentingRangeProvider = void 0;
const vscode = __importStar(require("vscode"));
const constants_1 = require("../constants");
const diff_line_count_1 = require("../git/diff_line_count");
const review_uri_1 = require("./review_uri");
const lastLineEmpty = (document) => {
    const lastLIne = document.lineAt(document.lineCount - 1);
    return lastLIne.isEmptyOrWhitespace;
};
class CommentingRangeProvider {
    constructor(mr, mrVersion) {
        this.mr = mr;
        this.mrVersion = mrVersion;
    }
    provideCommentingRanges(document) {
        const { uri } = document;
        if (uri.scheme !== constants_1.REVIEW_URI_SCHEME)
            return [];
        const params = (0, review_uri_1.fromReviewUri)(uri);
        if (params.mrId !== this.mr.id || params.projectId !== this.mr.project_id || !params.path) {
            return [];
        }
        const oldFile = params.commit === this.mrVersion.base_commit_sha;
        if (oldFile) {
            const endOfRange = lastLineEmpty(document) ? document.lineCount - 2 : document.lineCount - 1;
            return [new vscode.Range(new vscode.Position(0, 0), new vscode.Position(endOfRange, 0))];
        }
        const result = (0, diff_line_count_1.getAddedLinesForFile)(this.mrVersion, params.path);
        return result.map(l => new vscode.Range(new vscode.Position(l - 1, 0), new vscode.Position(l - 1, 0)));
    }
}
exports.CommentingRangeProvider = CommentingRangeProvider;
//# sourceMappingURL=commenting_range_provider.js.map