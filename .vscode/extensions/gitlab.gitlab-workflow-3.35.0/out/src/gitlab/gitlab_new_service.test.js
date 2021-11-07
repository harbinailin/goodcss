"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_request_1 = require("graphql-request");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const gitlab_new_service_1 = require("./gitlab_new_service");
const snippets_js_1 = require("../../test/integration/fixtures/graphql/snippets.js");
const cross_fetch_2 = require("../__mocks__/cross-fetch");
jest.mock('graphql-request');
jest.mock('../services/token_service');
jest.mock('cross-fetch');
const crossFetchCallArgument = () => cross_fetch_1.default.mock.calls[0][0];
describe('gitlab_new_service', () => {
    const EXAMPLE_PROJECT_ID = 12345;
    describe('GraphQL client initialization', () => {
        it.each `
      instanceUrl                   | endpointUrl
      ${'https://test.com'}         | ${'https://test.com/api/graphql'}
      ${'https://test.com/gitlab'}  | ${'https://test.com/gitlab/api/graphql'}
      ${'https://test.com/gitlab/'} | ${'https://test.com/gitlab/api/graphql'}
    `('creates endpoint url from $instanceUrl', ({ instanceUrl, endpointUrl }) => {
            const service = new gitlab_new_service_1.GitLabNewService(instanceUrl);
            expect(graphql_request_1.GraphQLClient).toHaveBeenCalledWith(endpointUrl, expect.anything());
        });
    });
    describe('getSnippetContent uses REST for older GitLab versions', () => {
        it.each `
      rawPath                                                                                           | branch
      ${'/gitlab-org/gitlab-vscode-extension/-/snippets/111/raw/master/okr.md'}                         | ${'master'}
      ${'/gitlab-org/gitlab-vscode-extension/-/snippets/111/raw/main/okr.md'}                           | ${'main'}
      ${'/gitlab-org/security/gitlab-vscode-extension/-/snippets/222/raw/customBranch/folder/test1.js'} | ${'customBranch'}
    `('parses the repository branch from blob rawPath', async ({ rawPath, branch }) => {
            const service = new gitlab_new_service_1.GitLabNewService('https://example.com');
            service.getVersion = async () => '14.0.0';
            const snippet = snippets_js_1.testSnippet1;
            const blob = snippet.blobs.nodes[0];
            await service.getSnippetContent(snippet, { ...blob, rawPath });
            expect(crossFetchCallArgument()).toMatch(`/files/${branch}/`);
        });
    });
    describe('getFileContent', () => {
        describe('fetch request', () => {
            it.each `
        ref                                                    | encodedRef
        ${'feature/ch38/add-fn-para-criar-novo-usuário'}       | ${'feature%2Fch38%2Fadd-fn-para-criar-novo-usu%C3%A1rio'}
        ${'förbättra-användarupplevelsen-av-chattkomponenten'} | ${'f%C3%B6rb%C3%A4ttra-anv%C3%A4ndarupplevelsen-av-chattkomponenten'}
        ${'erhöhe-preis-auf-dreißig-euro'}                     | ${'erh%C3%B6he-preis-auf-drei%C3%9Fig-euro'}
        ${'fix-error-400-when-on-a-branch'}                    | ${'fix-error-400-when-on-a-branch'}
      `('makes a request and escapes ref $ref', async ({ ref, encodedRef }) => {
                const baseUrl = 'https://gitlab.example.com/api/v4/projects/12345/repository/files/README.md/raw?ref=';
                const service = new gitlab_new_service_1.GitLabNewService('https://gitlab.example.com');
                const result = await service.getFileContent('README.md', ref, EXAMPLE_PROJECT_ID);
                expect(cross_fetch_1.default).toHaveBeenCalledWith(`${baseUrl}${encodedRef}`, expect.anything());
                expect(result).toBe(cross_fetch_2.DEFAULT_FETCH_RESPONSE);
            });
            it.each `
        file                                           | encodedFile
        ${'README.md'}                                 | ${'README.md'}
        ${'src/com/example/App.java'}                  | ${'src%2Fcom%2Fexample%2FApp.java'}
        ${'.settings/Production Settings/windows.ini'} | ${'.settings%2FProduction%20Settings%2Fwindows.ini'}
      `('makes a request and escapes file $file', async ({ file, encodedFile }) => {
                const url = `https://gitlab.example.com/api/v4/projects/12345/repository/files/${encodedFile}/raw?ref=main`;
                const service = new gitlab_new_service_1.GitLabNewService('https://gitlab.example.com');
                const result = await service.getFileContent(file, 'main', EXAMPLE_PROJECT_ID);
                expect(cross_fetch_1.default).toBeCalledTimes(1);
                expect(cross_fetch_1.default.mock.calls[0][0]).toBe(url);
                expect(result).toBe(cross_fetch_2.DEFAULT_FETCH_RESPONSE);
            });
        });
        it('encodes the project path', async () => {
            const service = new gitlab_new_service_1.GitLabNewService('https://gitlab.example.com');
            await service.getFileContent('foo', 'bar', 'baz/bat');
            expect(cross_fetch_1.default).toHaveBeenCalledWith('https://gitlab.example.com/api/v4/projects/baz%2Fbat/repository/files/foo/raw?ref=bar', expect.anything());
        });
    });
    describe('getFile', () => {
        it('constructs the correct URL', async () => {
            const service = new gitlab_new_service_1.GitLabNewService('https://gitlab.example.com');
            await service.getFile('foo', 'bar', 12345);
            expect(cross_fetch_1.default).toHaveBeenCalledWith('https://gitlab.example.com/api/v4/projects/12345/repository/files/foo?ref=bar', expect.anything());
        });
        it('encodes the project path', async () => {
            const service = new gitlab_new_service_1.GitLabNewService('https://gitlab.example.com');
            await service.getFile('foo', 'bar', 'baz/bat');
            expect(cross_fetch_1.default).toHaveBeenCalledWith('https://gitlab.example.com/api/v4/projects/baz%2Fbat/repository/files/foo?ref=bar', expect.anything());
        });
    });
    describe('getTree', () => {
        it('constructs the correct URL', async () => {
            const service = new gitlab_new_service_1.GitLabNewService('https://gitlab.example.com');
            await service.getTree('foo', 'bar', 12345);
            expect(cross_fetch_1.default).toHaveBeenCalledWith('https://gitlab.example.com/api/v4/projects/12345/repository/tree?ref=bar&path=foo', expect.anything());
        });
        it('encodes the project path', async () => {
            const service = new gitlab_new_service_1.GitLabNewService('https://gitlab.example.com');
            await service.getTree('foo', 'bar', 'baz/bat');
            expect(cross_fetch_1.default).toHaveBeenCalledWith('https://gitlab.example.com/api/v4/projects/baz%2Fbat/repository/tree?ref=bar&path=foo', expect.anything());
        });
    });
});
describe('fetchJson', () => {
    it('handles an empty query', async () => {
        await (0, gitlab_new_service_1.fetchJson)('', 'https://example.com', {});
        expect(cross_fetch_1.default).toHaveBeenCalledWith('https://example.com?', expect.anything());
    });
    it('handles a non-empty query', async () => {
        await (0, gitlab_new_service_1.fetchJson)('', 'https://example.com', {}, { foo: 'bar' });
        expect(cross_fetch_1.default).toHaveBeenCalledWith('https://example.com?foo=bar', expect.anything());
    });
    it('ignores an undefined query value', async () => {
        await (0, gitlab_new_service_1.fetchJson)('', 'https://example.com', {}, { foo: undefined });
        expect(cross_fetch_1.default).toHaveBeenCalledWith('https://example.com?', expect.anything());
    });
    it('ignores a null query value', async () => {
        await (0, gitlab_new_service_1.fetchJson)('', 'https://example.com', {}, { foo: null });
        expect(cross_fetch_1.default).toHaveBeenCalledWith('https://example.com?', expect.anything());
    });
    it('does not ignore a falsy value', async () => {
        await (0, gitlab_new_service_1.fetchJson)('', 'https://example.com', {}, { foo: '' });
        expect(cross_fetch_1.default).toHaveBeenCalledWith('https://example.com?foo=', expect.anything());
    });
});
//# sourceMappingURL=gitlab_new_service.test.js.map