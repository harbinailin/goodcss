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
const git_extension_wrapper_1 = require("./git_extension_wrapper");
const gitlab_remote_source_provider_repository_1 = require("../gitlab/clone/gitlab_remote_source_provider_repository");
const gitlab_credentials_provider_1 = require("../gitlab/clone/gitlab_credentials_provider");
const fake_git_extension_1 = require("../test_utils/fake_git_extension");
const wrapped_repository_1 = require("./wrapped_repository");
jest.mock('../gitlab/clone/gitlab_credentials_provider');
jest.mock('../gitlab/clone/gitlab_remote_source_provider_repository');
describe('GitExtensionWrapper', () => {
    let fakeExtension;
    let wrapper;
    beforeEach(async () => {
        wrapper = new git_extension_wrapper_1.GitExtensionWrapper();
        fakeExtension = new fake_git_extension_1.FakeGitExtension();
        vscode.extensions.getExtension.mockReturnValue({ exports: fakeExtension });
    });
    describe('initialization', () => {
        it('creates a new GitLabRemoteSourceProviderRepository', async () => {
            await wrapper.init();
            expect(gitlab_remote_source_provider_repository_1.GitLabRemoteSourceProviderRepository).toHaveBeenCalledWith(fakeExtension.gitApi);
        });
        it('adds credentials provider to the Git Extension', async () => {
            await wrapper.init();
            expect(fakeExtension.gitApi.credentialsProviders).toEqual([gitlab_credentials_provider_1.gitlabCredentialsProvider]);
        });
    });
    describe('repositories', () => {
        const fakeRepository = (0, fake_git_extension_1.createFakeRepository)({ rootUriPath: '/repository/root/path/' });
        const fakeRepository2 = (0, fake_git_extension_1.createFakeRepository)({ rootUriPath: '/repository/root/path2/' });
        const createPromiseThatResolvesWhenRepoCountChanges = () => new Promise(resolve => {
            const sub = wrapper.onRepositoryCountChanged(() => {
                sub.dispose();
                resolve(undefined);
            });
        });
        it('returns no repositories when the extension is disabled', async () => {
            fakeExtension.gitApi.repositories = [fakeRepository];
            fakeExtension.enabled = false;
            await wrapper.init();
            expect(wrapper.repositories).toEqual([]);
        });
        it('returns wrapped repositories when the extension is enabled', async () => {
            fakeExtension.gitApi.repositories = [fakeRepository];
            await wrapper.init();
            expect(wrapper.repositories).toEqual([new wrapped_repository_1.WrappedRepository(fakeRepository)]);
        });
        describe('reacts to changes to repository count', () => {
            it.each `
        scenario                    | fireEvent
        ${'repository was opened'}  | ${() => fakeExtension.gitApi.onDidOpenRepositoryEmitter.fire(fakeRepository)}
        ${'repository was closed'}  | ${() => fakeExtension.gitApi.onDidCloseRepositoryEmitter.fire(fakeRepository)}
        ${'extension was disabled'} | ${() => fakeExtension.onDidChangeEnablementEmitter.fire(false)}
        ${'extension was enabled'}  | ${() => fakeExtension.onDidChangeEnablementEmitter.fire(true)}
      `('calls onRepositoryCountChanged listener when $scenario', async ({ fireEvent }) => {
                const onRepositoryCountChangedListener = jest.fn();
                await wrapper.init();
                wrapper.onRepositoryCountChanged(onRepositoryCountChangedListener);
                const countChangedPromise = createPromiseThatResolvesWhenRepoCountChanges();
                await fireEvent();
                await countChangedPromise;
                expect(onRepositoryCountChangedListener).toHaveBeenCalled();
            });
        });
        it('adds a new wrapped repository when repository is opened', async () => {
            fakeExtension.gitApi.repositories = [fakeRepository];
            await wrapper.init();
            const countChangedPromise = createPromiseThatResolvesWhenRepoCountChanges();
            fakeExtension.gitApi.onDidOpenRepositoryEmitter.fire(fakeRepository2);
            await countChangedPromise;
            expect(wrapper.repositories.map(r => r.rootFsPath)).toEqual([
                fakeRepository.rootUri.fsPath,
                fakeRepository2.rootUri.fsPath,
            ]);
        });
        it('removes wrapped repository when repository is closed', async () => {
            fakeExtension.gitApi.repositories = [fakeRepository, fakeRepository2];
            await wrapper.init();
            fakeExtension.gitApi.onDidCloseRepositoryEmitter.fire(fakeRepository);
            expect(wrapper.repositories.map(r => r.rootFsPath)).toEqual([fakeRepository2.rootUri.fsPath]);
        });
        it('adds all repositories when the git extension gets enabled', async () => {
            fakeExtension.gitApi.repositories = [fakeRepository, fakeRepository2];
            fakeExtension.enabled = false;
            await wrapper.init();
            const countChangedPromise = createPromiseThatResolvesWhenRepoCountChanges();
            fakeExtension.onDidChangeEnablementEmitter.fire(true);
            await countChangedPromise;
            expect(wrapper.repositories.map(r => r.rootFsPath)).toEqual([
                fakeRepository.rootUri.fsPath,
                fakeRepository2.rootUri.fsPath,
            ]);
        });
        it('returns repository wrapped repository for a repositoryRootPath', async () => {
            fakeExtension.gitApi.repositories = [fakeRepository, fakeRepository2];
            await wrapper.init();
            const repository = wrapper.getRepository('/repository/root/path/');
            expect(repository.rootFsPath).toBe('/repository/root/path/');
        });
    });
});
//# sourceMappingURL=git_extension_wrapper.test.js.map