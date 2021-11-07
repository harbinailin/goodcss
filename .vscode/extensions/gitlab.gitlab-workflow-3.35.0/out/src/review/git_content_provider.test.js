"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("ts-jest/utils");
const git_content_provider_1 = require("./git_content_provider");
const git_extension_wrapper_1 = require("../git/git_extension_wrapper");
const api_content_provider_1 = require("./api_content_provider");
const review_uri_1 = require("./review_uri");
jest.mock('../git/git_extension_wrapper');
jest.mock('./api_content_provider');
describe('GitContentProvider', () => {
    const gitContentProvider = new git_content_provider_1.GitContentProvider();
    const reviewUriParams = {
        commit: 'abcdef',
        path: '/review',
        projectId: 1234,
        mrId: 2345,
        repositoryRoot: 'path/to/workspace',
    };
    let getFileContent;
    beforeEach(() => {
        getFileContent = jest.fn();
        git_extension_wrapper_1.gitExtensionWrapper.getRepository = () => ({ getFileContent });
    });
    it('provides file content from a git repository', async () => {
        getFileContent.mockReturnValue('Test text');
        const result = await gitContentProvider.provideTextDocumentContent((0, review_uri_1.toReviewUri)(reviewUriParams), null);
        expect(result).toBe('Test text');
    });
    it('falls back to the API provider if file does not exist in the git repository', async () => {
        getFileContent.mockReturnValue(null);
        const apiContentProvider = new api_content_provider_1.ApiContentProvider();
        apiContentProvider.provideTextDocumentContent = jest.fn().mockReturnValue('Api content');
        (0, utils_1.mocked)(api_content_provider_1.ApiContentProvider).mockReturnValue(apiContentProvider);
        const result = await gitContentProvider.provideTextDocumentContent((0, review_uri_1.toReviewUri)(reviewUriParams), null);
        expect(result).toBe('Api content');
    });
});
//# sourceMappingURL=git_content_provider.test.js.map