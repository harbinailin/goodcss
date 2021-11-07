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
const extension_state_1 = require("./extension_state");
const token_service_1 = require("./services/token_service");
const git_extension_wrapper_1 = require("./git/git_extension_wrapper");
describe('extension_state', () => {
    let extensionState;
    let mockedInstancesWithTokens;
    let mockedRepositories;
    beforeEach(() => {
        mockedInstancesWithTokens = [];
        mockedRepositories = [];
        token_service_1.tokenService.getInstanceUrls = () => mockedInstancesWithTokens;
        jest
            .spyOn(git_extension_wrapper_1.gitExtensionWrapper, 'repositories', 'get')
            .mockImplementation(() => mockedRepositories);
        extensionState = new extension_state_1.ExtensionState();
    });
    it.each `
    scenario                             | instancesWithTokens       | repositories        | validState | noToken  | noRepository
    ${'is invalid'}                      | ${[]}                     | ${[]}               | ${false}   | ${true}  | ${true}
    ${'is invalid without tokens'}       | ${[]}                     | ${['repository']}   | ${false}   | ${true}  | ${false}
    ${'is invalid without repositories'} | ${['https://gitlab.com']} | ${[]}               | ${false}   | ${false} | ${true}
    ${'is valid'}                        | ${['https://gitlab.com']} | ${[['repository']]} | ${true}    | ${false} | ${false}
  `('$scenario', async ({ instancesWithTokens, repositories, validState, noToken, noRepository }) => {
        mockedInstancesWithTokens = instancesWithTokens;
        mockedRepositories = repositories;
        await extensionState.init(token_service_1.tokenService);
        const { executeCommand } = vscode.commands;
        expect(executeCommand).toBeCalledWith('setContext', 'gitlab:validState', validState);
        expect(executeCommand).toBeCalledWith('setContext', 'gitlab:noToken', noToken);
        expect(executeCommand).toBeCalledWith('setContext', 'gitlab:noRepository', noRepository);
    });
    it('fires event when valid state changes', async () => {
        await extensionState.init(token_service_1.tokenService);
        const listener = jest.fn();
        extensionState.onDidChangeValid(listener);
        // setting tokens and repositories makes extension state valid
        mockedInstancesWithTokens = ['http://new-instance-url'];
        mockedRepositories = ['repository'];
        await extensionState.updateExtensionStatus();
        expect(listener).toHaveBeenCalled();
    });
});
//# sourceMappingURL=extension_state.test.js.map