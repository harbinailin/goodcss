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
const command_names_1 = require("../command_names");
const context_utils_1 = require("./context_utils");
const help_1 = require("./help");
describe('Help', () => {
    describe('show', () => {
        beforeAll(() => {
            context_utils_1.contextUtils.init({
                extensionUri: vscode.Uri.parse(`file:///path/to/extension`),
            });
        });
        it('opens the file', async () => {
            await help_1.Help.show();
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith(command_names_1.VS_COMMANDS.MARKDOWN_SHOW_PREVIEW, vscode.Uri.parse(`file:///path/to/extension/README.md`));
        });
        it('opens the file to the correct section', async () => {
            await help_1.Help.show('foobar');
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith(command_names_1.VS_COMMANDS.MARKDOWN_SHOW_PREVIEW, vscode.Uri.parse(`file:///path/to/extension/README.md#foobar`));
        });
    });
});
//# sourceMappingURL=help.test.js.map