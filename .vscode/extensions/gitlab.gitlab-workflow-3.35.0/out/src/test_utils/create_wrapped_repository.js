"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWrappedRepository = void 0;
const wrapped_repository_1 = require("../git/wrapped_repository");
const fake_git_extension_1 = require("./fake_git_extension");
const defaultOptions = {
    ...fake_git_extension_1.fakeRepositoryOptions,
    gitLabService: {},
};
const createWrappedRepository = (options = {}) => {
    const repository = new wrapped_repository_1.WrappedRepository((0, fake_git_extension_1.createFakeRepository)({ ...defaultOptions, ...options }));
    if (options.gitLabService) {
        repository.getGitLabService = () => options.gitLabService;
    }
    return repository;
};
exports.createWrappedRepository = createWrappedRepository;
//# sourceMappingURL=create_wrapped_repository.js.map