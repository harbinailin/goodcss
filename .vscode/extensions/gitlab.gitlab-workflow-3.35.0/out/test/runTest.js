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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const vscode_test_1 = require("vscode-test");
const create_tmp_workspace_1 = __importDefault(require("./create_tmp_workspace"));
async function go() {
    try {
        const extensionDevelopmentPath = path.resolve(__dirname, '../..');
        const extensionTestsPath = path.resolve(__dirname, './integration');
        const temporaryWorkspace = await (0, create_tmp_workspace_1.default)();
        console.log(temporaryWorkspace);
        await (0, vscode_test_1.runTests)({
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: ['--disable-extensions', temporaryWorkspace],
        });
    }
    catch (err) {
        console.error('Failed to run tests', err);
        process.exit(1);
    }
}
go().catch(console.error);
//# sourceMappingURL=runTest.js.map