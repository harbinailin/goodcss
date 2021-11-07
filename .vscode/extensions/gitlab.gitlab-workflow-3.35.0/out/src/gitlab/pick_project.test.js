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
const token_service_1 = require("../services/token_service");
const show_quickpick_1 = require("../utils/show_quickpick");
const gitlab_remote_source_provider_1 = require("./clone/gitlab_remote_source_provider");
const pick_project_1 = require("./pick_project");
jest.mock('../utils/show_quickpick');
jest.mock('../services/token_service');
jest.mock('./clone/gitlab_remote_source_provider');
describe('pickProject', () => {
    const instanceUrls = ['https://gitlab.com'];
    const projects = [
        { name: 'foo', label: 'foo' },
        { name: 'bar', label: 'bar' },
        { name: 'baz', label: 'baz' },
    ];
    const alwaysPickOptionN = (n, v) => {
        show_quickpick_1.showQuickPick.mockImplementation(async (picker) => {
            // Wait for a moment for the list to be populated
            await new Promise(r => setTimeout(r, 1));
            // eslint-disable-next-line no-param-reassign
            if (v)
                picker.value = v;
            return picker.items[n];
        });
    };
    const alwaysInput = (answer) => {
        vscode.window.showInputBox.mockImplementation(() => answer);
    };
    beforeEach(() => {
        token_service_1.tokenService.getInstanceUrls = () => instanceUrls;
        vscode.window.createQuickPick.mockImplementation(() => {
            return {
                onDidChangeValue: jest.fn(),
                items: [],
            };
        });
        gitlab_remote_source_provider_1.GitLabRemoteSourceProvider.mockImplementation(() => ({
            getRemoteSources(query) {
                if (!query)
                    return projects;
                return projects.filter(p => p.name.indexOf(query) >= 0);
            },
            lookupByPath(path) {
                return projects.find(p => p.name === path);
            },
        }));
    });
    it('returns undefined when the picker is canceled', async () => {
        alwaysPickOptionN(-1);
        const r = await (0, pick_project_1.pickProject)('https://gitlab.com');
        expect(r).toBeUndefined();
    });
    it('returns the selected item', async () => {
        alwaysPickOptionN(1);
        const r = await (0, pick_project_1.pickProject)('https://gitlab.com');
        expect(r).toStrictEqual(projects[0]);
    });
    describe('when other is selected', () => {
        beforeEach(() => alwaysPickOptionN(0));
        it('resolves the user-provided value', async () => {
            alwaysInput(projects[2].name);
            const r = await (0, pick_project_1.pickProject)('https://gitlab.com');
            expect(r).toStrictEqual(projects[2]);
        });
        describe('when a value is provided', () => {
            beforeEach(() => alwaysPickOptionN(0, projects[2].name));
            it('does not show an input box', async () => {
                await (0, pick_project_1.pickProject)('https://gitlab.com');
                expect(vscode.window.showInputBox).toHaveBeenCalledTimes(0);
            });
        });
        describe('when no value is provided', () => {
            beforeEach(() => alwaysInput(undefined));
            it('shows an input box', async () => {
                await (0, pick_project_1.pickProject)('https://gitlab.com');
                expect(vscode.window.showInputBox).toHaveBeenCalledTimes(1);
            });
            it('returns undefined when the input box is canceled', async () => {
                const r = await (0, pick_project_1.pickProject)('https://gitlab.com');
                expect(vscode.window.showInputBox).toHaveBeenCalledTimes(1);
                expect(r).toStrictEqual(undefined);
            });
        });
    });
});
//# sourceMappingURL=pick_project.test.js.map