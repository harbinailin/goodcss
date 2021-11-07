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
exports.cloneWiki = void 0;
const vscode = __importStar(require("vscode"));
const command_names_1 = require("../command_names");
const pick_instance_1 = require("../gitlab/pick_instance");
const pick_project_1 = require("../gitlab/pick_project");
async function cloneWiki() {
    const instance = await (0, pick_instance_1.pickInstance)();
    if (!instance) {
        return;
    }
    const selectedSource = await (0, pick_project_1.pickProject)(instance);
    if (!selectedSource) {
        return;
    }
    const selectedUrl = await vscode.window.showQuickPick(selectedSource.wikiUrl, {
        ignoreFocusOut: true,
        placeHolder: 'Select URL to clone from',
    });
    if (!selectedUrl) {
        return;
    }
    await vscode.commands.executeCommand(command_names_1.VS_COMMANDS.GIT_CLONE, selectedUrl);
}
exports.cloneWiki = cloneWiki;
//# sourceMappingURL=clone_wiki.js.map