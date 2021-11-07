"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const assert_1 = __importDefault(require("assert"));
const vscode_1 = require("vscode");
const remove_trailing_slash_1 = require("../utils/remove_trailing_slash");
class TokenService {
    constructor() {
        this.onDidChangeEmitter = new vscode_1.EventEmitter();
    }
    init(context) {
        this.context = context;
    }
    get onDidChange() {
        return this.onDidChangeEmitter.event;
    }
    get glTokenMap() {
        (0, assert_1.default)(this.context);
        return this.context.globalState.get('glTokens', {});
    }
    getInstanceUrls() {
        return Object.keys(this.glTokenMap);
    }
    getToken(instanceUrl) {
        // the first part of the return (`this.glTokenMap[instanceUrl]`)
        // can be removed on 2022-08-15 (year after new tokens can't contain trailing slash)
        return this.glTokenMap[instanceUrl] || this.glTokenMap[(0, remove_trailing_slash_1.removeTrailingSlash)(instanceUrl)];
    }
    async setToken(instanceUrl, token) {
        (0, assert_1.default)(this.context);
        const tokenMap = this.glTokenMap;
        if (token) {
            tokenMap[(0, remove_trailing_slash_1.removeTrailingSlash)(instanceUrl)] = token;
        }
        else {
            delete tokenMap[instanceUrl];
        }
        await this.context.globalState.update('glTokens', tokenMap);
        this.onDidChangeEmitter.fire();
    }
}
exports.TokenService = TokenService;
exports.tokenService = new TokenService();
//# sourceMappingURL=token_service.js.map