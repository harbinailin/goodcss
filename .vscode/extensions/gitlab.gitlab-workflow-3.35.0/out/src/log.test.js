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
const log_1 = require("./log");
const command_names_1 = require("./command_names");
describe('logging', () => {
    afterEach(() => {
        expect.hasAssertions();
    });
    let logFunction;
    beforeEach(() => {
        logFunction = jest.fn();
        (0, log_1.initializeLogging)(logFunction);
    });
    describe('log', () => {
        it('passes the argument to the handler', () => {
            const message = 'A very bad error occured';
            (0, log_1.log)(message);
            expect(logFunction).toBeCalledTimes(1);
            expect(logFunction).toBeCalledWith(message);
        });
    });
    describe('logError', () => {
        describe('for normal errors', () => {
            it('passes the argument to the handler', () => {
                const message = 'A very bad error occured';
                const error = new Error(message);
                (0, log_1.logError)(error);
                expect(logFunction).toBeCalledTimes(1);
                expect(logFunction).toBeCalledWith(`${message}\n${error.stack}`);
            });
        });
        describe('for detailed errors', () => {
            it('passes the details to the handler', () => {
                const details = 'Could not fetch from GitLab: error 404';
                (0, log_1.logError)({
                    details,
                });
                expect(logFunction).toBeCalledTimes(1);
                expect(logFunction).toBeCalledWith(details);
            });
        });
    });
    describe('handleError', () => {
        const message = 'Uncaught TypeError: NetworkError when attempting to fetch resource.';
        const showErrorMessage = vscode.window.showErrorMessage;
        it('passes the argument to the handler', () => {
            const error = new Error(message);
            (0, log_1.handleError)(error);
            expect(logFunction).toBeCalledTimes(1);
            expect(logFunction).toBeCalledWith(`${message}\n${error.stack}`);
        });
        it('prompts the user to show the logs', () => {
            (0, log_1.handleError)(new Error(message));
            expect(showErrorMessage).toBeCalledTimes(1);
            expect(showErrorMessage).toBeCalledWith(message, 'Show Logs');
        });
        it('shows the logs when the user confirms the prompt', async () => {
            const executeCommand = vscode.commands.executeCommand;
            showErrorMessage.mockResolvedValue('Show Logs');
            await (0, log_1.handleError)(new Error(message)).onlyForTesting;
            expect(executeCommand).toBeCalledWith(command_names_1.USER_COMMANDS.SHOW_OUTPUT);
        });
    });
});
//# sourceMappingURL=log.test.js.map