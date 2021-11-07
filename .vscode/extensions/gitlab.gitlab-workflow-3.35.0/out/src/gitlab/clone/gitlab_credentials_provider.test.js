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
const token_service_1 = require("../../services/token_service");
const constants_1 = require("../../../test/integration/test_infrastructure/constants");
const gitlab_credentials_provider_1 = require("./gitlab_credentials_provider");
jest.mock('../../services/token_service');
describe('GitLab Credentials Provider', () => {
    beforeEach(() => {
        token_service_1.tokenService.getInstanceUrls = () => [constants_1.GITLAB_URL];
        token_service_1.tokenService.getToken = (url) => (url === constants_1.GITLAB_URL ? 'password' : undefined);
    });
    it('getting credentials works', async () => {
        var _a;
        expect((_a = (await gitlab_credentials_provider_1.gitlabCredentialsProvider.getCredentials(vscode.Uri.parse(constants_1.GITLAB_URL)))) === null || _a === void 0 ? void 0 : _a.password).toBe('password');
    });
    it('returns undefined for url without token', async () => {
        expect(await gitlab_credentials_provider_1.gitlabCredentialsProvider.getCredentials(vscode.Uri.parse('https://invalid.com'))).toBe(undefined);
    });
});
//# sourceMappingURL=gitlab_credentials_provider.test.js.map