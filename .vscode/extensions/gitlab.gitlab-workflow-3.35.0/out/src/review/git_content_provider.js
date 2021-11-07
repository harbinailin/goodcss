"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitContentProvider = void 0;
const review_uri_1 = require("./review_uri");
const api_content_provider_1 = require("./api_content_provider");
const git_extension_wrapper_1 = require("../git/git_extension_wrapper");
const provideApiContentAsFallback = (uri, token) => new api_content_provider_1.ApiContentProvider().provideTextDocumentContent(uri, token);
class GitContentProvider {
    // eslint-disable-next-line class-methods-use-this
    async provideTextDocumentContent(uri, token) {
        const params = (0, review_uri_1.fromReviewUri)(uri);
        if (!params.path || !params.commit)
            return '';
        const repository = git_extension_wrapper_1.gitExtensionWrapper.getRepository(params.repositoryRoot);
        const result = await repository.getFileContent(params.path, params.commit);
        return result || provideApiContentAsFallback(uri, token);
    }
}
exports.GitContentProvider = GitContentProvider;
//# sourceMappingURL=git_content_provider.js.map