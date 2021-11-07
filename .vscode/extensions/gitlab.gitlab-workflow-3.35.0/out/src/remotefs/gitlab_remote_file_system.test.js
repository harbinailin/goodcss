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
const vscode = __importStar(require("vscode"));
const fetch_error_1 = require("../errors/fetch_error");
const help_error_1 = require("../errors/help_error");
const gitlab_new_service_1 = require("../gitlab/gitlab_new_service");
const token_service_1 = require("../services/token_service");
const gitlab_remote_file_system_1 = require("./gitlab_remote_file_system");
jest.mock('../services/token_service');
jest.mock('../gitlab/gitlab_new_service');
const encoder = new TextEncoder();
function newFetchError(url, status, text, bodyJson) {
    const response = {
        url: url,
        ok: false,
        redirected: false,
        status,
        statusText: text,
    };
    if (bodyJson) {
        response.json = () => Promise.resolve(bodyJson);
    }
    else {
        response.json = () => Promise.reject(new Error('no content'));
    }
    return new fetch_error_1.FetchError(text, response);
}
function newTreeEntry({ name, type, }) {
    const e = { name, type };
    return e;
}
function newRepoFile({ size, content }) {
    const f = { size, content };
    return f;
}
describe('GitLabRemoteFileSystem', () => {
    const gitlabAbs = 'https://1.example.com/';
    const gitlabRel = 'https://2.example.com/gitlab/';
    let instanceUrls;
    let projectInfo;
    const getProjectInfo = (url, id) => {
        if (projectInfo && (projectInfo.id === Number(id) || projectInfo.path === id)) {
            return projectInfo;
        }
        throw newFetchError(url, 404, 'not found');
    };
    const testProject = { id: 1 };
    const testProjectFooURI = vscode.Uri.parse(`gitlab-remote://1.example.com/X/foo?project=1&ref=main`);
    const testProjectWithTree = {
        ...testProject,
        trees: {
            foo: [
                newTreeEntry({ name: 'bar', type: 'blob' }),
                newTreeEntry({ name: 'baz', type: 'tree' }),
            ],
        },
    };
    const testProjectWithFile = {
        ...testProject,
        files: {
            foo: newRepoFile({ size: 123, content: 'this is a test file\nfoo bar baz\n' }),
        },
    };
    beforeEach(() => {
        instanceUrls = [gitlabAbs, gitlabRel];
        projectInfo = null;
        token_service_1.tokenService.getInstanceUrls = () => instanceUrls;
        gitlab_new_service_1.GitLabNewService.mockImplementation(() => ({
            async getTree(path, ref, projectId) {
                const proj = getProjectInfo(undefined, projectId);
                if (!proj.trees || !(path in proj.trees))
                    return [];
                return proj.trees[path];
            },
            async getFile(path, ref, projectId) {
                const proj = getProjectInfo(undefined, projectId);
                if (!proj.files || !(path in proj.files))
                    throw newFetchError(undefined, 404, 'not found');
                return proj.files[path];
            },
            async getFileContent(path, ref, projectId) {
                const proj = getProjectInfo(undefined, projectId);
                if (!proj.files || !(path in proj.files))
                    throw newFetchError(undefined, 404, 'not found');
                return proj.files[path].content;
            },
        }));
    });
    describe('parseUri', () => {
        it('correctly parses a root URI for a non-relative instance', () => {
            const testUri = vscode.Uri.parse(`gitlab-remote://1.example.com/FooBar?project=foo/bar&ref=main`);
            const r = gitlab_remote_file_system_1.GitLabRemoteFileSystem.parseUri(testUri);
            expect(r.instance.toString()).toStrictEqual('https://1.example.com/');
            expect(r.project).toStrictEqual('foo/bar');
            expect(r.ref).toStrictEqual('main');
            expect(r.path).toStrictEqual('');
        });
        it('correctly parses a non-root URI for a non-relative instance', () => {
            const testUri = vscode.Uri.parse(`gitlab-remote://1.example.com/FooBar/baz/bat?project=foo/bar&ref=main`);
            const r = gitlab_remote_file_system_1.GitLabRemoteFileSystem.parseUri(testUri);
            expect(r.instance.toString()).toStrictEqual('https://1.example.com/');
            expect(r.project).toStrictEqual('foo/bar');
            expect(r.ref).toStrictEqual('main');
            expect(r.path).toStrictEqual('baz/bat');
        });
        it('correctly parses a root URI for a relative instance', () => {
            const testUri = vscode.Uri.parse(`gitlab-remote://2.example.com/gitlab/FooBar?project=foo/bar&ref=main`);
            const r = gitlab_remote_file_system_1.GitLabRemoteFileSystem.parseUri(testUri);
            expect(r.instance.toString()).toStrictEqual('https://2.example.com/gitlab/');
            expect(r.project).toStrictEqual('foo/bar');
            expect(r.ref).toStrictEqual('main');
            expect(r.path).toStrictEqual('');
        });
        it('correctly parses a non-root URI for a relative instance', () => {
            const testUri = vscode.Uri.parse(`gitlab-remote://2.example.com/gitlab/FooBar/baz/bat?project=foo/bar&ref=main`);
            const r = gitlab_remote_file_system_1.GitLabRemoteFileSystem.parseUri(testUri);
            expect(r.instance.toString()).toStrictEqual('https://2.example.com/gitlab/');
            expect(r.project).toStrictEqual('foo/bar');
            expect(r.ref).toStrictEqual('main');
            expect(r.path).toStrictEqual('baz/bat');
        });
        it('fails if the scheme is wrong', () => {
            const testUri = vscode.Uri.parse(`not-gitlab-remote://1.example.com/FooBar?project=foo/bar&ref=main`);
            expect(() => gitlab_remote_file_system_1.GitLabRemoteFileSystem.parseUri(testUri)).toThrow(/it should begin with gitlab-remote/);
        });
        it('fails if the project is missing', () => {
            const testUri = vscode.Uri.parse(`gitlab-remote://1.example.com/FooBar?ref=main`);
            expect(() => gitlab_remote_file_system_1.GitLabRemoteFileSystem.parseUri(testUri)).toThrow(/must contain a project= query parameter/);
        });
        it('fails if the ref is missing', () => {
            const testUri = vscode.Uri.parse(`gitlab-remote://1.example.com/FooBar?project=foo/bar`);
            expect(() => gitlab_remote_file_system_1.GitLabRemoteFileSystem.parseUri(testUri)).toThrow(/must contain a ref= query parameter/);
        });
        it('fails if the token is missing', () => {
            instanceUrls = [];
            const testUri = vscode.Uri.parse(`gitlab-remote://1.example.com/FooBar?project=foo/bar&ref=main`);
            expect(() => gitlab_remote_file_system_1.GitLabRemoteFileSystem.parseUri(testUri)).toThrow(/missing token/i);
        });
    });
    describe('validateLabel', () => {
        it.each `
      scenario          | value          | error
      ${'alphanumeric'} | ${'FooBar123'} | ${null}
      ${'space'}        | ${'foo bar'}   | ${null}
      ${'underscore'}   | ${'foo_bar'}   | ${null}
      ${'dash'}         | ${'foo-bar'}   | ${null}
      ${'dot'}          | ${'foo.bar'}   | ${null}
      ${'slash'}        | ${'foo/bar'}   | ${'/'}
      ${'colon'}        | ${'foo:bar'}   | ${':'}
    `('$scenario', ({ value, error }) => {
            const r = gitlab_remote_file_system_1.GitLabRemoteFileSystem.validateLabel(value);
            if (!error) {
                expect(r).toBeNull();
            }
            else {
                expect(r).toContain(`Illegal character: "${error}"`);
            }
        });
    });
    describe('stat', () => {
        it('throws a HelpError if the token is expired', async () => {
            const err = newFetchError('https://example.com', 401, 'unauthorized', {
                error: 'invalid_token',
            });
            gitlab_new_service_1.GitLabNewService.mockImplementation(() => ({
                async getTree() {
                    throw err;
                },
                async getFile() {
                    throw err;
                },
            }));
            projectInfo = testProjectWithTree;
            const p = gitlab_remote_file_system_1.GitLabRemoteFileSystem.stat(testProjectFooURI);
            await expect(p).rejects.toThrowError(help_error_1.HelpError);
        });
        it('returns directory info for a tree', async () => {
            projectInfo = testProjectWithTree;
            const r = await gitlab_remote_file_system_1.GitLabRemoteFileSystem.stat(testProjectFooURI);
            expect(r.type).toStrictEqual(vscode.FileType.Directory);
        });
        it('returns file info for a file', async () => {
            projectInfo = testProjectWithFile;
            const r = await gitlab_remote_file_system_1.GitLabRemoteFileSystem.stat(testProjectFooURI);
            expect(r.type).toStrictEqual(vscode.FileType.File);
            expect(r.size).toStrictEqual(123);
        });
        it('throws FileNotFound if no file or tree exists', async () => {
            projectInfo = testProject;
            const r = gitlab_remote_file_system_1.GitLabRemoteFileSystem.stat(testProjectFooURI);
            await r.catch(e => expect(e.code).toStrictEqual('file-not-found'));
            await expect(r).rejects.toThrow(vscode.FileSystemError);
        });
    });
    describe('readDirectory', () => {
        it('returns directory entries for a tree', async () => {
            projectInfo = testProjectWithTree;
            const r = await gitlab_remote_file_system_1.GitLabRemoteFileSystem.readDirectory(testProjectFooURI);
            expect(r).toEqual([
                ['bar', vscode.FileType.File],
                ['baz', vscode.FileType.Directory],
            ]);
        });
        it('throws FileNotFound if no file or tree exists', async () => {
            projectInfo = testProject;
            const r = gitlab_remote_file_system_1.GitLabRemoteFileSystem.readDirectory(testProjectFooURI);
            await r.catch(e => expect(e.code).toStrictEqual('file-not-found'));
            await expect(r).rejects.toThrow(vscode.FileSystemError);
        });
        it('throws FileNotADirectory if a file exists', async () => {
            projectInfo = testProjectWithFile;
            const r = gitlab_remote_file_system_1.GitLabRemoteFileSystem.readDirectory(testProjectFooURI);
            await r.catch(e => expect(e.code).toStrictEqual('file-not-a-directory'));
            await expect(r).rejects.toThrow(vscode.FileSystemError);
        });
    });
    describe('readFile', () => {
        it('returns file contents for a file', async () => {
            projectInfo = testProjectWithFile;
            const r = await gitlab_remote_file_system_1.GitLabRemoteFileSystem.readFile(testProjectFooURI);
            expect(r).toEqual(encoder.encode(testProjectWithFile.files.foo.content));
        });
        it('throws FileNotFound if no file or tree exists', async () => {
            projectInfo = testProject;
            const r = gitlab_remote_file_system_1.GitLabRemoteFileSystem.readFile(testProjectFooURI);
            await r.catch(e => expect(e.code).toStrictEqual('file-not-found'));
            await expect(r).rejects.toThrow(vscode.FileSystemError);
        });
        it('throws FileIsADirectory if a tree exists', async () => {
            projectInfo = testProjectWithTree;
            const r = gitlab_remote_file_system_1.GitLabRemoteFileSystem.readFile(testProjectFooURI);
            await r.catch(e => expect(e.code).toStrictEqual('file-is-a-directory'));
            await expect(r).rejects.toThrow(vscode.FileSystemError);
        });
    });
});
//# sourceMappingURL=gitlab_remote_file_system.test.js.map