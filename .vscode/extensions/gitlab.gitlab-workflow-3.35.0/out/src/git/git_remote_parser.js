"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGitRemote = void 0;
const url = __importStar(require("url"));
// returns path without the trailing slash or empty string if there is no path
const getInstancePath = (instanceUrl) => {
    const { pathname } = url.parse(instanceUrl);
    return pathname ? pathname.replace(/\/$/, '') : '';
};
const escapeForRegExp = (str) => {
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
};
function normalizeSshRemote(remote) {
    // Regex to match git SSH remotes with custom port.
    // Example: [git@dev.company.com:7999]:group/repo_name.git
    // For more information see:
    // https://gitlab.com/gitlab-org/gitlab-vscode-extension/-/issues/309
    const sshRemoteWithCustomPort = remote.match(`^\\[([a-zA-Z0-9_-]+@.*?):\\d+\\](.*)$`);
    if (sshRemoteWithCustomPort) {
        return `ssh://${sshRemoteWithCustomPort[1]}${sshRemoteWithCustomPort[2]}`;
    }
    if (remote.match(`^[a-zA-Z0-9_-]+@`)) {
        // Regex to match gitlab potential starting names for ssh remotes.
        return `ssh://${remote}`;
    }
    return remote;
}
function parseGitRemote(remote, instanceUrl) {
    const { host, pathname } = url.parse(normalizeSshRemote(remote));
    if (!host || !pathname) {
        return undefined;
    }
    // The instance url might have a custom route, i.e. www.company.com/gitlab. This route is
    // optional in the remote url. This regex extracts namespace and project from the remote
    // url while ignoring any custom route, if present. For more information see:
    // - https://gitlab.com/gitlab-org/gitlab-vscode-extension/-/merge_requests/11
    // - https://gitlab.com/gitlab-org/gitlab-vscode-extension/-/issues/103
    const pathRegExp = instanceUrl ? escapeForRegExp(getInstancePath(instanceUrl)) : '';
    const match = pathname.match(`(?:${pathRegExp})?/:?(.+)/([^/]+?)(?:.git)?/?$`);
    if (!match) {
        return undefined;
    }
    const [namespace, project] = match.slice(1, 3);
    return { host, namespace, project };
}
exports.parseGitRemote = parseGitRemote;
//# sourceMappingURL=git_remote_parser.js.map