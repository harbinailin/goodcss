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
exports.CiCompletionProvider = void 0;
const vscode = __importStar(require("vscode"));
const gitlabCiVariables = require("./ci_variables.json");
const findDollarSignIndex = (document, position) => {
    const textUntilPosition = document.lineAt(position).text.substr(0, position.character);
    return textUntilPosition.lastIndexOf('$');
};
class CiCompletionProvider {
    // eslint-disable-next-line class-methods-use-this
    provideCompletionItems(document, position) {
        const linePrefix = findDollarSignIndex(document, position);
        return gitlabCiVariables.map(({ name, description }) => {
            const item = new vscode.CompletionItem(`$${name}`, vscode.CompletionItemKind.Constant);
            item.documentation = new vscode.MarkdownString(description);
            item.range = new vscode.Range(position.with(undefined, linePrefix), position);
            return item;
        });
    }
}
exports.CiCompletionProvider = CiCompletionProvider;
//# sourceMappingURL=ci_completion_provider.js.map