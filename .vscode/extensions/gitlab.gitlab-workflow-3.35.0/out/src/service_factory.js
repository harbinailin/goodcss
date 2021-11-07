"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGitLabNewService = void 0;
const gitlab_new_service_1 = require("./gitlab/gitlab_new_service");
const get_instance_url_1 = require("./utils/get_instance_url");
async function createGitLabNewService(repositoryRoot) {
    return new gitlab_new_service_1.GitLabNewService(await (0, get_instance_url_1.getInstanceUrl)(repositoryRoot));
}
exports.createGitLabNewService = createGitLabNewService;
//# sourceMappingURL=service_factory.js.map