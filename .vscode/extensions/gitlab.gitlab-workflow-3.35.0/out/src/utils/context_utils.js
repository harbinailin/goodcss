"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextUtils = void 0;
const assert_1 = __importDefault(require("assert"));
const vscode_1 = require("vscode");
class ContextUtils {
    init(context) {
        this.context = context;
    }
    getEmbededFileUri(...path) {
        (0, assert_1.default)(this.context, 'Context Utils is not initialized');
        return vscode_1.Uri.joinPath(this.context.extensionUri, ...path);
    }
}
exports.contextUtils = new ContextUtils();
//# sourceMappingURL=context_utils.js.map