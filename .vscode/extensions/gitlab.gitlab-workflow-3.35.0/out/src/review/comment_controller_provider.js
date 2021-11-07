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
exports.commentControllerProvider = exports.CommentControllerProvider = void 0;
const vscode = __importStar(require("vscode"));
class CommentControllerProvider {
    constructor() {
        this.controllers = {};
    }
    /**
     * Creates comment controller and ensures it is the only existing controller for given MR
     * This method exists for several reasons:
     * - if we open MR multiple times,  we want to prevent multiple comments being displayed
     * - multiple comment controllers for the same MR make commenting on MR harder
     * - we want to make sure that we add commentingRangeProvider correctly
     */
    borrowCommentController(mrFullReference, title, commentingRangeProvider) {
        const existingController = this.controllers[mrFullReference];
        if (existingController) {
            existingController.dispose();
        }
        const controller = vscode.comments.createCommentController(`gitlab-mr-${mrFullReference}`, title);
        // we must assign commentingRangeProvider right after we create the controller
        // if there was an `async` call between, VS Code wouldn't show the commenting range
        // this bug has been reported https://github.com/microsoft/vscode/issues/126475
        controller.commentingRangeProvider = commentingRangeProvider;
        this.controllers[mrFullReference] = controller;
        return controller;
    }
}
exports.CommentControllerProvider = CommentControllerProvider;
exports.commentControllerProvider = new CommentControllerProvider();
//# sourceMappingURL=comment_controller_provider.js.map