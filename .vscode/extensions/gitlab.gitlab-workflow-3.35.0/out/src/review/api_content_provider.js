"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiContentProvider = void 0;
const review_uri_1 = require("./review_uri");
const log_1 = require("../log");
const service_factory_1 = require("../service_factory");
class ApiContentProvider {
    // eslint-disable-next-line class-methods-use-this
    async provideTextDocumentContent(uri, token) {
        const params = (0, review_uri_1.fromReviewUri)(uri);
        if (!params.path || !params.commit)
            return '';
        const service = await (0, service_factory_1.createGitLabNewService)(params.repositoryRoot);
        try {
            return await service.getFileContent(params.path, params.commit, params.projectId);
        }
        catch (e) {
            (0, log_1.logError)(e);
            throw e;
        }
    }
}
exports.ApiContentProvider = ApiContentProvider;
//# sourceMappingURL=api_content_provider.js.map