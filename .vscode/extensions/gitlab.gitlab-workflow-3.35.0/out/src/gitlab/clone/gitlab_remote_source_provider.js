"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitLabRemoteSourceProvider = exports.convertUrlToWikiUrl = void 0;
const gitlab_new_service_1 = require("../gitlab_new_service");
const SEARCH_LIMIT = 30;
const getProjectQueryAttributes = {
    membership: true,
    limit: SEARCH_LIMIT,
    searchNamespaces: true,
};
function convertUrlToWikiUrl(url) {
    return url.replace(/\.git$/, '.wiki.git');
}
exports.convertUrlToWikiUrl = convertUrlToWikiUrl;
function remoteForProject(project) {
    const url = [project.sshUrlToRepo, project.httpUrlToRepo];
    return {
        name: `$(repo) ${project.fullPath}`,
        description: project.description,
        url,
        wikiUrl: url.map(convertUrlToWikiUrl),
        project,
    };
}
class GitLabRemoteSourceProvider {
    constructor(url) {
        this.url = url;
        this.icon = 'project';
        this.supportsQuery = true;
        this.name = `GitLab (${url})`;
        this.gitlabService = new gitlab_new_service_1.GitLabNewService(this.url);
    }
    async lookupByPath(path) {
        const project = await this.gitlabService.getProject(path);
        if (!project)
            return undefined;
        return remoteForProject(project);
    }
    async getRemoteSources(query) {
        const projects = await this.gitlabService.getProjects({
            search: query,
            ...getProjectQueryAttributes,
        });
        return projects.filter(project => !project.empty).map(project => remoteForProject(project));
    }
}
exports.GitLabRemoteSourceProvider = GitLabRemoteSourceProvider;
//# sourceMappingURL=gitlab_remote_source_provider.js.map