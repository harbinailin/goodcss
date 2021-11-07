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
const clone_wiki_1 = require("./clone_wiki");
const token_service_1 = require("../services/token_service");
const pick_instance_1 = require("../gitlab/pick_instance");
const pick_project_1 = require("../gitlab/pick_project");
jest.mock('../services/token_service');
jest.mock('../gitlab/pick_instance');
jest.mock('../gitlab/pick_project');
const wikiRemoteSource = {
    name: `$(repo) gitlab-org/gitlab-vscode-extension`,
    description: 'description',
    wikiUrl: [
        'git@gitlab.com:gitlab-org/gitlab-vscode-extension.wiki.git',
        'https://gitlab.com/gitlab-org/gitlab-vscode-extension.wiki.git',
    ],
};
describe('cloneWiki', () => {
    it('calls git.clone command with selected URL', async () => {
        token_service_1.tokenService.getInstanceUrls = () => ['https://gitlab.com'];
        pick_instance_1.pickInstance.mockImplementation(() => 'https://gitlab.com');
        pick_project_1.pickProject.mockImplementation(() => wikiRemoteSource);
        vscode.window.showQuickPick.mockImplementation(([option]) => option);
        await (0, clone_wiki_1.cloneWiki)();
        expect(vscode.commands.executeCommand).toBeCalledWith('git.clone', 'git@gitlab.com:gitlab-org/gitlab-vscode-extension.wiki.git');
    });
});
//# sourceMappingURL=clone_wiki.test.js.map