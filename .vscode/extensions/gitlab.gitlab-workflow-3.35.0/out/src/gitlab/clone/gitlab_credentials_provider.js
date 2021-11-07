"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitlabCredentialsProvider = void 0;
const vscode_1 = require("vscode");
const token_service_1 = require("../../services/token_service");
exports.gitlabCredentialsProvider = {
    async getCredentials(host) {
        const matchingInstance = token_service_1.tokenService.getInstanceUrls().find(url => {
            const instanceURI = vscode_1.Uri.parse(url);
            return host.scheme === instanceURI.scheme && host.authority === instanceURI.authority;
        });
        if (matchingInstance) {
            const token = token_service_1.tokenService.getToken(matchingInstance);
            if (token) {
                return {
                    username: 'arbitrary_username_ignored_by_gitlab',
                    password: token,
                };
            }
        }
        return undefined;
    },
};
//# sourceMappingURL=gitlab_credentials_provider.js.map