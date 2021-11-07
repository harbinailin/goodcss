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
exports.ChangedFileItem = void 0;
const vscode = __importStar(require("vscode"));
const path_1 = require("path");
const review_uri_1 = require("../../review/review_uri");
const command_names_1 = require("../../command_names");
const constants_1 = require("../../constants");
const getChangeType = (file) => {
    if (file.new_file)
        return constants_1.ADDED;
    if (file.deleted_file)
        return constants_1.DELETED;
    if (file.renamed_file)
        return constants_1.RENAMED;
    return constants_1.MODIFIED;
};
// Common image types https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.tiff',
    '.bmp',
    '.avif',
    '.apng',
];
const looksLikeImage = (filePath) => imageExtensions.includes(path_1.posix.extname(filePath).toLowerCase());
const getBaseAndHeadUri = (mr, mrVersion, file, repositoryPath) => {
    const commonParams = {
        repositoryRoot: repositoryPath,
        projectId: mr.project_id,
        mrId: mr.id,
    };
    const emptyFileUri = (0, review_uri_1.toReviewUri)(commonParams);
    const baseFileUri = file.new_file
        ? emptyFileUri
        : (0, review_uri_1.toReviewUri)({
            ...commonParams,
            path: file.old_path,
            commit: mrVersion.base_commit_sha,
        });
    const headFileUri = file.deleted_file
        ? emptyFileUri
        : (0, review_uri_1.toReviewUri)({
            ...commonParams,
            path: file.new_path,
            commit: mrVersion.head_commit_sha,
        });
    return { baseFileUri, headFileUri };
};
class ChangedFileItem extends vscode.TreeItem {
    constructor(mr, mrVersion, file, repositoryPath, hasComment) {
        var _a;
        super(vscode.Uri.file(file.new_path));
        this.description = path_1.posix.dirname(`/${file.new_path}`).split('/').slice(1).join('/');
        const { baseFileUri, headFileUri } = getBaseAndHeadUri(mr, mrVersion, file, repositoryPath);
        const hasComments = hasComment(baseFileUri) || hasComment(headFileUri);
        const query = new URLSearchParams([
            [constants_1.CHANGE_TYPE_QUERY_KEY, getChangeType(file)],
            [constants_1.HAS_COMMENTS_QUERY_KEY, String(hasComments)],
        ]).toString();
        this.resourceUri = (_a = this.resourceUri) === null || _a === void 0 ? void 0 : _a.with({ query });
        if (looksLikeImage(file.old_path) || looksLikeImage(file.new_path)) {
            this.command = {
                title: 'Images are not supported',
                command: command_names_1.PROGRAMMATIC_COMMANDS.NO_IMAGE_REVIEW,
            };
            return;
        }
        this.command = {
            title: 'Show changes',
            command: command_names_1.VS_COMMANDS.DIFF,
            arguments: [baseFileUri, headFileUri, `${path_1.posix.basename(file.new_path)} (!${mr.iid})`],
        };
    }
}
exports.ChangedFileItem = ChangedFileItem;
//# sourceMappingURL=changed_file_item.js.map