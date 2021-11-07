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
const constants_1 = require("../constants");
const help_error_1 = require("../errors/help_error");
const pick_git_ref_1 = require("../gitlab/pick_git_ref");
const pick_instance_1 = require("../gitlab/pick_instance");
const pick_project_1 = require("../gitlab/pick_project");
const token_service_1 = require("../services/token_service");
const open_repository_1 = require("./open_repository");
jest.mock('../services/token_service');
jest.mock('../gitlab/pick_instance');
jest.mock('../gitlab/pick_project');
jest.mock('../gitlab/pick_git_ref');
describe('openRepository', () => {
    const instanceUrls = ['https://gitlab.com', 'https://example.com'];
    const cancelOnce = () => vscode.window.showQuickPick.mockImplementationOnce(() => undefined);
    const pickOnce = (label) => vscode.window.showQuickPick.mockImplementationOnce((items) => {
        const item = items.find(i => i.label.indexOf(label) >= 0);
        if (!item)
            throw new Error(`There is no item labeled ${label}!`);
        return item;
    });
    const alwaysInput = (url) => vscode.window.showInputBox.mockImplementation(() => url);
    beforeEach(() => {
        token_service_1.tokenService.getInstanceUrls = () => instanceUrls;
        vscode.window.createQuickPick.mockImplementation(() => {
            return {
                onDidChangeValue: jest.fn(),
                items: [],
            };
        });
    });
    it('stops if the open action quick pick is canceled', async () => {
        cancelOnce();
        await (0, open_repository_1.openRepository)();
        expect(vscode.commands.executeCommand).not.toHaveBeenCalled();
    });
    describe('enter a URL', () => {
        beforeEach(() => {
            pickOnce('Open in current window');
            pickOnce('Enter gitlab-remote URL');
        });
        it('stops if the URL input is canceled', async () => {
            alwaysInput(undefined);
            await (0, open_repository_1.openRepository)();
            expect(vscode.commands.executeCommand).not.toHaveBeenCalled();
        });
        it('opens the selected URL', async () => {
            const uri = `${constants_1.REMOTE_URI_SCHEME}://gitlab.com/GitLab?project=gitlab-org/gitlab&ref=main`;
            alwaysInput(uri);
            await (0, open_repository_1.openRepository)();
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('vscode.openFolder', vscode.Uri.parse(uri), false);
        });
        it('does not open a window for an invalid URL', async () => {
            const uri = `not-${constants_1.REMOTE_URI_SCHEME}://gitlab.com/GitLab?project=gitlab-org/gitlab&ref=main`;
            alwaysInput(uri);
            await expect(open_repository_1.openRepository).rejects.toThrow(help_error_1.HelpError);
            expect(vscode.commands.executeCommand).not.toHaveBeenCalled();
        });
    });
    describe('choose a project', () => {
        beforeEach(() => {
            pickOnce('Open in current window');
            pickOnce('Choose a project');
        });
        const remote = {
            name: '$(repo) Foo Bar',
            url: ['https://example.com/foo/bar.git'],
            wikiUrl: ['https://example.com/foo/bar.wiki.git'],
            project: {
                restId: 1,
                name: 'Foo Bar',
            },
        };
        const branch = {
            refType: 'branch',
            name: 'main',
        };
        it('constructs and opens the correct URL', async () => {
            pick_instance_1.pickInstance.mockImplementation(() => 'https://example.com');
            pick_project_1.pickProject.mockImplementation(() => remote);
            pick_git_ref_1.pickGitRef.mockImplementation(() => branch);
            alwaysInput('FooBar');
            await (0, open_repository_1.openRepository)();
            expect(pick_instance_1.pickInstance).toHaveBeenCalled();
            expect(pick_project_1.pickProject).toHaveBeenCalled();
            expect(pick_git_ref_1.pickGitRef).toHaveBeenCalled();
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith('vscode.openFolder', vscode.Uri.parse('gitlab-remote://example.com/FooBar?project=1&ref=main'), false);
        });
    });
});
//# sourceMappingURL=open_repository.test.js.map