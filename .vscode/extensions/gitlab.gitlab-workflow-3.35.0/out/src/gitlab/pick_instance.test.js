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
const token_service_1 = require("../services/token_service");
const pick_instance_1 = require("./pick_instance");
jest.mock('../services/token_service');
describe('pickInstance', () => {
    let instanceUrls;
    beforeEach(() => {
        vscode.window.showQuickPick.mockImplementation(([option]) => option);
        token_service_1.tokenService.getInstanceUrls = () => instanceUrls;
    });
    it('skips selection of instance if there is only one', async () => {
        instanceUrls = ['https://gitlab.com'];
        await (0, pick_instance_1.pickInstance)();
        expect(vscode.window.showQuickPick).not.toHaveBeenCalled();
    });
    it('asks for instance if there are multiple', async () => {
        instanceUrls = ['https://gitlab.com', 'https://example.com'];
        await (0, pick_instance_1.pickInstance)();
        expect(vscode.window.showQuickPick).toHaveBeenCalled();
    });
});
//# sourceMappingURL=pick_instance.test.js.map