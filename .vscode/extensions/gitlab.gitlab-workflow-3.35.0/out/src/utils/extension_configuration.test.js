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
const as_mock_1 = require("../test_utils/as_mock");
const extension_configuration_1 = require("./extension_configuration");
class FakeConfig {
    get(key) {
        return this[key];
    }
    update(key, value) {
        this[key] = value;
    }
}
describe('extension configuration', () => {
    let workspaceConfig;
    const TEST_REPOSITORY_ROOT = '/repository/root';
    beforeEach(() => {
        workspaceConfig = new FakeConfig();
        (0, as_mock_1.asMock)(vscode.workspace.getConfiguration).mockReturnValue(workspaceConfig);
    });
    describe('setPreferredRemote', () => {
        it('stores preferred remote', async () => {
            await (0, extension_configuration_1.setPreferredRemote)(TEST_REPOSITORY_ROOT, 'first');
            expect(workspaceConfig).toEqual({
                repositories: {
                    [TEST_REPOSITORY_ROOT]: { preferredRemoteName: 'first' },
                },
            });
        });
        it('adds preferred remote', async () => {
            workspaceConfig.update('repositories', {
                [TEST_REPOSITORY_ROOT]: { preferredRemoteName: 'second' },
            });
            await (0, extension_configuration_1.setPreferredRemote)('/root/path', 'first');
            expect(workspaceConfig).toEqual({
                repositories: {
                    [TEST_REPOSITORY_ROOT]: { preferredRemoteName: 'second' },
                    '/root/path': { preferredRemoteName: 'first' },
                },
            });
        });
    });
});
//# sourceMappingURL=extension_configuration.test.js.map