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
exports.GitLabRemoteFileSystem = exports.newGitLabService = void 0;
const vscode = __importStar(require("vscode"));
const constants_1 = require("../constants");
const fetch_error_1 = require("../errors/fetch_error");
const gitlab_new_service_1 = require("../gitlab/gitlab_new_service");
const log_1 = require("../log");
const token_service_1 = require("../services/token_service");
const help_error_1 = require("../errors/help_error");
const remove_trailing_slash_1 = require("../utils/remove_trailing_slash");
const readonly_file_system_1 = require("./readonly_file_system");
const encoder = new TextEncoder();
function newGitLabService(instance) {
    return new gitlab_new_service_1.GitLabNewService((0, remove_trailing_slash_1.removeTrailingSlash)(instance.toString()));
}
exports.newGitLabService = newGitLabService;
/**
 * nullIf40x returns null if the promise throws a 40x fetch error. This allows
 * callers to convert 40x into a FileNotFound error while simplifying handling
 * of unexpected errors.
 * @param p The initial promise - this is expected to be the return from a call
 * to GitLabNewService.
 * @returns A new promise that does not throw 40x fetch errors.
 */
async function nullIf40x(p) {
    try {
        return await p;
    }
    catch (e) {
        if (e instanceof fetch_error_1.FetchError) {
            // Check if the response body is a GitLab invalid token error. Skip this
            // check if the URL is undefined. This avoids unnecessary complications
            // for testing.
            const body = await e.response.json().catch(() => undefined);
            if ((body === null || body === void 0 ? void 0 : body.error) === 'invalid_token' && e.response.url) {
                const { authority } = vscode.Uri.parse(e.response.url);
                throw new help_error_1.HelpError(`Failed to access a remote repository on ${authority} due to an expired or revoked access token. You must create a new token.`, { section: constants_1.README_SECTIONS.SETUP });
            }
            const s = e.response.status;
            // Let the handler deal with 40x responses
            if (s === 401 || s === 403 || s === 404) {
                return null;
            }
        }
        throw e;
    }
}
class GitLabRemoteFileSystem extends readonly_file_system_1.ReadOnlyFileSystem {
    /**
     * GitLab remote filesystem URIs must be of the form:
     *
     * `gitlab-remote://<instance>/<subpath>/<project_label>[/<file_path>]?project=<id>&ref=<ref>`
     *
     * If the URI is not in this form, or if the instance does not match any known
     * instances, parseUri will throw an assertion error.
     * @param uri The URI.
     * @returns The parsed GitLab remote fs path.
     *
     */
    static parseUri(uri) {
        if (uri.scheme !== constants_1.REMOTE_URI_SCHEME) {
            throw new help_error_1.HelpError(`URI is not a GitLab remote. It begins with ${uri.scheme} but it should begin with ${constants_1.REMOTE_URI_SCHEME}`, { section: constants_1.README_SECTIONS.REMOTEFS });
        }
        const query = new URLSearchParams(uri.query);
        const project = query.get('project');
        if (!project)
            throw new help_error_1.HelpError('URI is not a GitLab remote. The URI must contain a project= query parameter', { section: constants_1.README_SECTIONS.REMOTEFS });
        const ref = query.get('ref');
        if (!ref)
            throw new help_error_1.HelpError('URI is not a GitLab remote. The URI must contain a ref= query parameter', { section: constants_1.README_SECTIONS.REMOTEFS });
        // Find the instance with a matching authority and a subpath that is a
        // prefix of the URI's path.
        const instance = token_service_1.tokenService
            .getInstanceUrls()
            .map(x => vscode.Uri.parse(x))
            .find(x => uri.authority === x.authority && uri.path.startsWith(x.path));
        if (!instance)
            throw new help_error_1.HelpError(`Cannot open ${uri}: missing token for GitLab instance ${uri.authority}`, { section: constants_1.README_SECTIONS.SETUP });
        // To get the file path, we first remove the instance subpath, then the
        // project label.
        const pathWithoutInstanceSubpath = uri.path.substring(instance.path.length).replace(/^\//, '');
        const pathWithoutFirstSegment = pathWithoutInstanceSubpath.replace(/^[^/]+(\/|$)/, '');
        return { instance, project, ref, path: pathWithoutFirstSegment };
    }
    /**
     * Checks whether the given value is a valid label for a gitlab-remote URL.
     * @param value the value
     * @returns A human-readable diagnostic message, or `null` when the value is valid.
     */
    static validateLabel(value) {
        const m = value === null || value === void 0 ? void 0 : value.match(/[^-._ a-z0-9]/i);
        if (!m)
            return null;
        return `Illegal character: "${m[0]}". Allowed: alphanumeric, dash, dot, space, and underscore.`;
    }
    static async stat(uri) {
        const { instance, project, path, ref } = await this.parseUri(uri);
        const service = newGitLabService(instance);
        const [tree, file] = await Promise.all([
            nullIf40x(service.getTree(path, ref, project)),
            nullIf40x(service.getFile(path, ref, project)),
        ]);
        // a (git) directory cannot be empty, so an empty response means the path is not a directory
        if (tree === null || tree === void 0 ? void 0 : tree.length) {
            return { type: vscode.FileType.Directory, ctime: Date.now(), mtime: Date.now(), size: 0 };
        }
        if (file) {
            return {
                type: vscode.FileType.File,
                ctime: Date.now(),
                mtime: Date.now(),
                size: file.size,
            };
        }
        throw vscode.FileSystemError.FileNotFound(uri);
    }
    static async readDirectory(uri) {
        const { instance, project, path, ref } = await this.parseUri(uri);
        const service = newGitLabService(instance);
        const tree = await nullIf40x(service.getTree(path, ref, project));
        // a (git) directory cannot be empty, so an empty response means the path is not a directory
        if (!tree || tree.length === 0) {
            // URI is not a directory - is it a file, or is it missing or inaccessible?
            const file = await nullIf40x(service.getFile(path, ref, project));
            if (file)
                throw vscode.FileSystemError.FileNotADirectory(uri);
            else
                throw vscode.FileSystemError.FileNotFound(uri);
        }
        // Reformat the tree entries as VSCode directory entries
        return tree.map(entry => {
            const type = entry.type === 'tree' ? vscode.FileType.Directory : vscode.FileType.File;
            return [entry.name, type];
        });
    }
    static async readFile(uri) {
        const { instance, project, path, ref } = await this.parseUri(uri);
        const service = newGitLabService(instance);
        const file = await nullIf40x(service.getFileContent(path, ref, project));
        if (!file) {
            // URI is not a file - is it a directory, or is it missing or inaccessible?
            const tree = await nullIf40x(service.getTree(path, ref, project));
            // a (git) directory cannot be empty, so a non-empty response means the path is a directory
            if (tree && tree.length)
                throw vscode.FileSystemError.FileIsADirectory(uri);
            else
                throw vscode.FileSystemError.FileNotFound(uri);
        }
        // UTF-8 encode the file
        return encoder.encode(file);
    }
    /* eslint-disable class-methods-use-this */
    async stat(uri) {
        try {
            return await GitLabRemoteFileSystem.stat(uri);
        }
        catch (e) {
            if (!(e instanceof vscode.FileSystemError)) {
                (0, log_1.handleError)(e);
            }
            throw e;
        }
    }
    async readDirectory(uri) {
        try {
            return await GitLabRemoteFileSystem.readDirectory(uri);
        }
        catch (e) {
            if (!(e instanceof vscode.FileSystemError)) {
                (0, log_1.handleError)(e);
            }
            throw e;
        }
    }
    async readFile(uri) {
        try {
            return await GitLabRemoteFileSystem.readFile(uri);
        }
        catch (e) {
            if (!(e instanceof vscode.FileSystemError)) {
                (0, log_1.handleError)(e);
            }
            throw e;
        }
    }
}
exports.GitLabRemoteFileSystem = GitLabRemoteFileSystem;
GitLabRemoteFileSystem.OPTIONS = {
    isReadonly: true,
    isCaseSensitive: true,
};
//# sourceMappingURL=gitlab_remote_file_system.js.map