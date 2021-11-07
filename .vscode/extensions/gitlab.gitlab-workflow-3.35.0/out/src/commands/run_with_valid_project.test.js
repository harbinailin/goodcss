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
const run_with_valid_project_1 = require("./run_with_valid_project");
const git_extension_wrapper_1 = require("../git/git_extension_wrapper");
const as_mock_1 = require("../test_utils/as_mock");
const create_wrapped_repository_1 = require("../test_utils/create_wrapped_repository");
const extension_configuration_1 = require("../utils/extension_configuration");
const entities_1 = require("../test_utils/entities");
const log_1 = require("../log");
jest.mock('../git/git_extension_wrapper');
jest.mock('../utils/extension_configuration');
jest.mock('../log');
describe('runWithValidProject', () => {
    let repository;
    beforeEach(() => {
        (0, as_mock_1.asMock)(extension_configuration_1.getExtensionConfiguration).mockReturnValue({ instanceUrl: 'https://gitlab.com' });
        (0, as_mock_1.asMock)(log_1.log).mockImplementation(m => console.log(m));
    });
    describe('with valid project', () => {
        beforeEach(() => {
            repository = (0, create_wrapped_repository_1.createWrappedRepository)({
                gitLabService: { getProject: async () => entities_1.project },
            });
            (0, as_mock_1.asMock)(git_extension_wrapper_1.gitExtensionWrapper.getActiveRepositoryOrSelectOne).mockResolvedValue(repository);
        });
        it('injects repository, remote, and GitLab project into the command', async () => {
            var _a;
            const command = jest.fn();
            await (0, run_with_valid_project_1.runWithValidProject)(command)();
            expect(command).toHaveBeenCalledWith(repository);
            expect((_a = repository.remote) === null || _a === void 0 ? void 0 : _a.project).toEqual('extension');
            expect(await repository.getProject()).toEqual(entities_1.project);
        });
    });
    describe('without project', () => {
        beforeEach(() => {
            repository = (0, create_wrapped_repository_1.createWrappedRepository)({
                gitLabService: { getProject: async () => undefined },
            });
            (0, as_mock_1.asMock)(git_extension_wrapper_1.gitExtensionWrapper.getActiveRepositoryOrSelectOne).mockResolvedValue(repository);
        });
        it('throws an error', async () => {
            const command = jest.fn();
            await expect((0, run_with_valid_project_1.runWithValidProject)(command)()).rejects.toThrowError(/Project \S+ was not found/);
            expect(command).not.toHaveBeenCalledWith(repository);
        });
    });
    describe('with ambiguous remotes ', () => {
        let repoSettings;
        let command;
        beforeEach(() => {
            repository = (0, create_wrapped_repository_1.createWrappedRepository)({
                gitLabService: { getProject: async () => entities_1.project },
                remotes: [
                    ['origin', 'git@a.com:gitlab/extension.git'],
                    ['security', 'git@b.com:gitlab/extension.git'],
                ],
            });
            (0, as_mock_1.asMock)(git_extension_wrapper_1.gitExtensionWrapper.getActiveRepositoryOrSelectOne).mockResolvedValue(repository);
            command = jest.fn();
            (0, as_mock_1.asMock)(vscode.window.showQuickPick).mockImplementation(options => options[0]);
            (0, as_mock_1.asMock)(extension_configuration_1.setPreferredRemote).mockImplementation((root, rn) => {
                repoSettings = { preferredRemoteName: rn };
            });
            (0, as_mock_1.asMock)(extension_configuration_1.getRepositorySettings).mockImplementation(() => repoSettings);
        });
        it('lets user select which remote to use', async () => {
            var _a;
            await (0, run_with_valid_project_1.runWithValidProject)(command)();
            expect(command).toHaveBeenCalledWith(repository);
            expect((_a = repository.remote) === null || _a === void 0 ? void 0 : _a.host).toEqual('a.com');
        });
        it('lets user select which remote to use if the configured remote does not exist', async () => {
            var _a;
            repoSettings = { preferredRemoteName: 'invalid' };
            await (0, run_with_valid_project_1.runWithValidProject)(command)();
            expect(command).toHaveBeenCalledWith(repository);
            expect((_a = repository.remote) === null || _a === void 0 ? void 0 : _a.host).toEqual('a.com');
        });
    });
});
//# sourceMappingURL=run_with_valid_project.test.js.map