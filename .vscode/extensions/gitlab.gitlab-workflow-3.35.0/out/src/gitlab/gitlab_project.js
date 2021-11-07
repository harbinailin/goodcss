"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitLabProject = void 0;
const get_rest_id_from_graphql_id_1 = require("../utils/get_rest_id_from_graphql_id");
class GitLabProject {
    constructor(gqlProject) {
        this.gqlProject = gqlProject;
    }
    get gqlId() {
        return this.gqlProject.id;
    }
    get restId() {
        return (0, get_rest_id_from_graphql_id_1.getRestIdFromGraphQLId)(this.gqlProject.id);
    }
    get name() {
        return this.gqlProject.name;
    }
    get description() {
        return this.gqlProject.description;
    }
    get httpUrlToRepo() {
        return this.gqlProject.httpUrlToRepo;
    }
    get sshUrlToRepo() {
        return this.gqlProject.sshUrlToRepo;
    }
    get fullPath() {
        return this.gqlProject.fullPath;
    }
    get webUrl() {
        return this.gqlProject.webUrl;
    }
    get groupRestId() {
        return this.gqlProject.group && (0, get_rest_id_from_graphql_id_1.getRestIdFromGraphQLId)(this.gqlProject.group.id);
    }
    get wikiEnabled() {
        return this.gqlProject.wikiEnabled;
    }
    get empty() {
        var _a;
        return Boolean((_a = this.gqlProject.repository) === null || _a === void 0 ? void 0 : _a.empty);
    }
}
exports.GitLabProject = GitLabProject;
//# sourceMappingURL=gitlab_project.js.map