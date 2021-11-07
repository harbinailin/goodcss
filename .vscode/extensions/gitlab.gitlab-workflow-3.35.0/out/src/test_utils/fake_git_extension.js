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
exports.FakeGitExtension = exports.createFakeRepository = exports.fakeRepositoryOptions = void 0;
/* eslint-disable max-classes-per-file, @typescript-eslint/no-explicit-any */
const vscode = __importStar(require("vscode"));
const event_emitter_1 = require("./event_emitter");
const removeFromArray = (array, element) => {
    return array.filter(el => el !== element);
};
exports.fakeRepositoryOptions = {
    rootUriPath: '/path/to/repo',
    remotes: [['origin', 'git@a.com:gitlab/extension.git']],
};
const createFakeRepository = (options = {}) => {
    const { rootUriPath, remotes, headRemoteName } = { ...exports.fakeRepositoryOptions, ...options };
    return {
        rootUri: vscode.Uri.file(rootUriPath),
        state: {
            remotes: remotes.map(([name, fetchUrl]) => ({ name, fetchUrl })),
            HEAD: { remote: headRemoteName },
        },
        status: async () => undefined,
    };
};
exports.createFakeRepository = createFakeRepository;
/**
 * This is a simple test double for the native Git extension API
 *
 * It allows us to test our cloning feature without mocking every response
 * and validating arguments of function calls.
 */
class FakeGitApi {
    constructor() {
        this.credentialsProviders = [];
        this.remoteSourceProviders = [];
        this.repositories = [];
        this.onDidOpenRepositoryEmitter = new event_emitter_1.EventEmitter();
        this.onDidOpenRepository = this.onDidOpenRepositoryEmitter.event;
        this.onDidCloseRepositoryEmitter = new event_emitter_1.EventEmitter();
        this.onDidCloseRepository = this.onDidCloseRepositoryEmitter.event;
    }
    registerCredentialsProvider(provider) {
        this.credentialsProviders.push(provider);
        return {
            dispose: () => {
                this.credentialsProviders = removeFromArray(this.credentialsProviders, provider);
            },
        };
    }
    getRepository(uri) {
        return this.repositories.find(r => r.rootUri.toString() === uri.toString());
    }
    registerRemoteSourceProvider(provider) {
        this.remoteSourceProviders.push(provider);
        return {
            dispose: () => {
                this.remoteSourceProviders = removeFromArray(this.remoteSourceProviders, provider);
            },
        };
    }
}
/**
 * This is a simple test double for the native Git extension
 *
 * We use it to test enabling and disabling the extension.
 */
class FakeGitExtension {
    constructor() {
        this.enabled = true;
        this.enablementListeners = [];
        this.gitApi = new FakeGitApi();
        this.onDidChangeEnablementEmitter = new event_emitter_1.EventEmitter();
        this.onDidChangeEnablement = this.onDidChangeEnablementEmitter.event;
    }
    getAPI() {
        return this.gitApi;
    }
}
exports.FakeGitExtension = FakeGitExtension;
//# sourceMappingURL=fake_git_extension.js.map