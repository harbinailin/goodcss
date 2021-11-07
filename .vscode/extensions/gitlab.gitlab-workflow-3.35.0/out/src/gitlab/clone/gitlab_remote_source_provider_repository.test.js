"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_service_1 = require("../../services/token_service");
const gitlab_remote_source_provider_repository_1 = require("./gitlab_remote_source_provider_repository");
const fake_git_extension_1 = require("../../test_utils/fake_git_extension");
jest.mock('../../services/token_service');
describe('GitLabRemoteSourceProviderRepository', () => {
    let fakeExtension;
    let tokenChangeListener;
    beforeEach(async () => {
        fakeExtension = new fake_git_extension_1.FakeGitExtension();
        token_service_1.tokenService.onDidChange = (listener, bindThis) => {
            tokenChangeListener = () => listener.call(bindThis);
        };
    });
    it('remote source provider created for new token', async () => {
        token_service_1.tokenService.getInstanceUrls = () => ['https://test2.gitlab.com'];
        // TODO: maybe introduce something like an initialize method instead of doing the work in constructor
        // eslint-disable-next-line no-new
        new gitlab_remote_source_provider_repository_1.GitLabRemoteSourceProviderRepository(fakeExtension.gitApi);
        expect(fakeExtension.gitApi.remoteSourceProviders.length).toBe(1);
        token_service_1.tokenService.getInstanceUrls = () => ['https://test2.gitlab.com', 'https://test3.gitlab.com'];
        tokenChangeListener();
        expect(fakeExtension.gitApi.remoteSourceProviders.length).toBe(2);
    });
    it('remote source providers disposed after token removal', async () => {
        token_service_1.tokenService.getInstanceUrls = () => ['https://test2.gitlab.com', 'https://test3.gitlab.com'];
        // TODO: maybe introduce something like an initialize method instead of doing the work in constructor
        // eslint-disable-next-line no-new
        new gitlab_remote_source_provider_repository_1.GitLabRemoteSourceProviderRepository(fakeExtension.gitApi);
        expect(fakeExtension.gitApi.remoteSourceProviders.length).toBe(2);
        token_service_1.tokenService.getInstanceUrls = () => ['https://test2.gitlab.com'];
        tokenChangeListener();
        expect(fakeExtension.gitApi.remoteSourceProviders.length).toBe(1);
    });
});
//# sourceMappingURL=gitlab_remote_source_provider_repository.test.js.map