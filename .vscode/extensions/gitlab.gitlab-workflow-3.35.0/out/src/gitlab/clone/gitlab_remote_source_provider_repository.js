"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitLabRemoteSourceProviderRepository = void 0;
const token_service_1 = require("../../services/token_service");
const gitlab_remote_source_provider_1 = require("./gitlab_remote_source_provider");
/**
 * This class manages the creation and deletion of RemoteSourceProviders for the git.clone command for each configured instance url
 */
class GitLabRemoteSourceProviderRepository {
    constructor(gitAPI) {
        this.gitAPI = gitAPI;
        this.remoteSourceProviders = new Map();
        this.update();
        this.tokenServiceListener = token_service_1.tokenService.onDidChange(this.update, this);
    }
    update() {
        const urls = token_service_1.tokenService.getInstanceUrls();
        // create provider(s) for the missing url(s)
        urls.forEach(url => {
            if (!this.remoteSourceProviders.has(url)) {
                const provider = new gitlab_remote_source_provider_1.GitLabRemoteSourceProvider(url);
                const disposable = this.gitAPI.registerRemoteSourceProvider(provider);
                this.remoteSourceProviders.set(url, { provider, disposable });
            }
        });
        // delete provider(s) for removed url(s)
        this.remoteSourceProviders.forEach((provider, providerUrl) => {
            if (urls.indexOf(providerUrl) === -1) {
                this.remoteSourceProviders.delete(providerUrl);
                provider.disposable.dispose();
            }
        });
    }
    dispose() {
        this.remoteSourceProviders.forEach(({ disposable }) => disposable === null || disposable === void 0 ? void 0 : disposable.dispose());
        this.remoteSourceProviders.clear();
        this.tokenServiceListener.dispose();
    }
}
exports.GitLabRemoteSourceProviderRepository = GitLabRemoteSourceProviderRepository;
//# sourceMappingURL=gitlab_remote_source_provider_repository.js.map