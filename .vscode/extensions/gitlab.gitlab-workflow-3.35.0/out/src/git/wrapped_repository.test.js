"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extension_configuration_1 = require("../utils/extension_configuration");
const token_service_1 = require("../services/token_service");
const constants_1 = require("../constants");
const entities_1 = require("../test_utils/entities");
const create_wrapped_repository_1 = require("../test_utils/create_wrapped_repository");
const as_mock_1 = require("../test_utils/as_mock");
jest.mock('../utils/extension_configuration');
describe('WrappedRepository', () => {
    let wrappedRepository;
    beforeEach(() => {
        jest.resetAllMocks();
        wrappedRepository = (0, create_wrapped_repository_1.createWrappedRepository)();
        const repositories = {
            [wrappedRepository.rootFsPath]: { preferredRemoteName: 'first' },
        };
        extension_configuration_1.getExtensionConfiguration.mockReturnValue({
            repositories,
        });
    });
    describe('instanceUrl', () => {
        let tokens = {};
        const fakeContext = {
            globalState: {
                get: () => tokens,
            },
        };
        beforeEach(() => {
            tokens = {};
            token_service_1.tokenService.init(fakeContext);
        });
        it('should return configured instanceUrl', async () => {
            extension_configuration_1.getExtensionConfiguration.mockReturnValue({
                instanceUrl: 'https://test.com',
            });
            expect(wrappedRepository.instanceUrl).toBe('https://test.com');
        });
        it('returns default instanceUrl when there is no configuration', async () => {
            extension_configuration_1.getExtensionConfiguration.mockReturnValue({});
            expect(wrappedRepository.instanceUrl).toBe(constants_1.GITLAB_COM_URL);
        });
        describe('heuristic', () => {
            it('returns instanceUrl when there is exactly one match between remotes and token URLs', async () => {
                tokens = {
                    'https://test-instance.com': 'abc',
                };
                wrappedRepository = (0, create_wrapped_repository_1.createWrappedRepository)({
                    remotes: [
                        ['a', 'https://git@gitlab.com/gitlab-org/gitlab-vscode-extension.git'],
                        ['b', 'https://git@test-instance.com/g/extension.git'],
                    ],
                });
                expect(wrappedRepository.instanceUrl).toBe('https://test-instance.com');
            });
            it('returns default instanceUrl when there is multiple matches between remotes and token URLs', async () => {
                tokens = {
                    'https://test-instance.com': 'abc',
                    'https://gitlab.com': 'def',
                };
                wrappedRepository = (0, create_wrapped_repository_1.createWrappedRepository)({
                    remotes: [
                        ['a', 'https://git@gitlab.com/gitlab-org/gitlab-vscode-extension.git'],
                        ['b', 'https://git@test-instance.com/g/extension.git'],
                    ],
                });
                expect(wrappedRepository.instanceUrl).toBe(constants_1.GITLAB_COM_URL);
            });
        });
    });
    describe('remote', () => {
        const firstRemote = ['first', 'git@test.gitlab.com:gitlab-org/first.git'];
        const secondRemote = ['second', 'git@test.gitlab.com:gitlab-org/second.git'];
        it.each `
      scenario                            | preferredRemoteName | remotes                        | expectedRemoteProject
      ${'single remote'}                  | ${undefined}        | ${[firstRemote]}               | ${'first'}
      ${'user preferred remote'}          | ${'second'}         | ${[firstRemote, secondRemote]} | ${'second'}
      ${'no remotes'}                     | ${undefined}        | ${[]}                          | ${undefined}
      ${'multiple remotes, no preferred'} | ${undefined}        | ${[firstRemote, secondRemote]} | ${undefined}
      ${'wrong preferred remote'}         | ${'third'}          | ${[firstRemote, secondRemote]} | ${undefined}
    `('behaves correctly with $scenario', ({ preferredRemoteName, remotes, expectedRemoteProject }) => {
            (0, as_mock_1.asMock)(extension_configuration_1.getRepositorySettings).mockReturnValue({
                preferredRemoteName,
            });
            wrappedRepository = (0, create_wrapped_repository_1.createWrappedRepository)({
                remotes,
            });
            const result = wrappedRepository.remote;
            expect(result === null || result === void 0 ? void 0 : result.project).toBe(expectedRemoteProject);
        });
    });
    describe('name', () => {
        it('uses folder name when there is no cached GitLab project', () => {
            wrappedRepository = (0, create_wrapped_repository_1.createWrappedRepository)({ rootUriPath: '/path/to/gitlab-project' });
            expect(wrappedRepository.name).toEqual('gitlab-project');
        });
        it('uses GitLab project name if the project is cached', async () => {
            wrappedRepository = (0, create_wrapped_repository_1.createWrappedRepository)({
                gitLabService: {
                    getProject: () => Promise.resolve(entities_1.project),
                },
                remotes: [['first', 'git@test.gitlab.com:gitlab-org/gitlab.git']],
            });
            await wrappedRepository.getProject();
            expect(wrappedRepository.name).toEqual(entities_1.project.name);
        });
    });
    describe('cached MRs', () => {
        it('returns undefined if the MR is not cached', () => {
            wrappedRepository = (0, create_wrapped_repository_1.createWrappedRepository)();
            expect(wrappedRepository.getMr(1)).toBe(undefined);
        });
        it('fetches MR versions when we reload MR', async () => {
            wrappedRepository = (0, create_wrapped_repository_1.createWrappedRepository)({
                gitLabService: {
                    getMrDiff: async () => entities_1.mrVersion,
                },
            });
            const result = await wrappedRepository.reloadMr(entities_1.mr);
            expect(result).toEqual({ mr: entities_1.mr, mrVersion: entities_1.mrVersion });
        });
        it('returns MR when it was cached', async () => {
            wrappedRepository = (0, create_wrapped_repository_1.createWrappedRepository)({
                gitLabService: {
                    getMrDiff: async () => entities_1.mrVersion,
                },
            });
            await wrappedRepository.reloadMr(entities_1.mr);
            expect(wrappedRepository.getMr(entities_1.mr.id)).toEqual({ mr: entities_1.mr, mrVersion: entities_1.mrVersion });
        });
    });
});
//# sourceMappingURL=wrapped_repository.test.js.map