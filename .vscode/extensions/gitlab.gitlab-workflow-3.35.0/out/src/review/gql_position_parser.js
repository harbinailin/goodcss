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
exports.commentRangeFromPosition = exports.commitFromPosition = exports.pathFromPosition = void 0;
const vscode = __importStar(require("vscode"));
const isOld = (position) => position.oldLine !== null;
const pathFromPosition = (position) => {
    return isOld(position) ? position.oldPath : position.newPath;
};
exports.pathFromPosition = pathFromPosition;
const commitFromPosition = (position) => {
    return isOld(position) ? position.diffRefs.baseSha : position.diffRefs.headSha;
};
exports.commitFromPosition = commitFromPosition;
const commentRangeFromPosition = (position) => {
    var _a;
    const glLine = (_a = position.oldLine) !== null && _a !== void 0 ? _a : position.newLine;
    const vsPosition = new vscode.Position(glLine - 1, 0); // VS Code numbers lines starting with 0, GitLab starts with 1
    return new vscode.Range(vsPosition, vsPosition);
};
exports.commentRangeFromPosition = commentRangeFromPosition;
//# sourceMappingURL=gql_position_parser.js.map