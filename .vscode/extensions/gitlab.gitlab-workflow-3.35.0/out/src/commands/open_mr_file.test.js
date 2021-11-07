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
const fs = __importStar(require("fs"));
const command_names_1 = require("../command_names");
const review_uri_1 = require("../review/review_uri");
const entities_1 = require("../test_utils/entities");
const open_mr_file_1 = require("./open_mr_file");
const git_extension_wrapper_1 = require("../git/git_extension_wrapper");
const as_mock_1 = require("../test_utils/as_mock");
jest.mock('fs', () => ({
    promises: {
        access: jest.fn(),
    },
}));
describe('openMrFile', () => {
    beforeEach(() => {
        jest
            .spyOn(git_extension_wrapper_1.gitExtensionWrapper, 'getRepository')
            .mockReturnValue({ getMr: () => ({ mrVersion: entities_1.mrVersion }) });
        (0, as_mock_1.asMock)(fs.promises.access).mockResolvedValue(undefined);
    });
    it('calls VS Code open with the correct diff file', async () => {
        await (0, open_mr_file_1.openMrFile)((0, review_uri_1.toReviewUri)({ ...entities_1.reviewUriParams, path: 'new_file.js' }));
        expect(vscode.commands.executeCommand).toHaveBeenCalledWith(command_names_1.VS_COMMANDS.OPEN, vscode.Uri.file('/new_file.js'));
    });
    it("calls shows information message when the file doesn't exist", async () => {
        (0, as_mock_1.asMock)(fs.promises.access).mockRejectedValue(new Error());
        await (0, open_mr_file_1.openMrFile)((0, review_uri_1.toReviewUri)({ ...entities_1.reviewUriParams, path: 'new_file.js' }));
        expect(vscode.commands.executeCommand).not.toHaveBeenCalled();
        expect(vscode.window.showWarningMessage).toHaveBeenCalled();
    });
    it("throws assertion error if the diff can't be found", async () => {
        await expect((0, open_mr_file_1.openMrFile)((0, review_uri_1.toReviewUri)({ ...entities_1.reviewUriParams, path: 'file_that_is_not_in_mr_diff.c' }))).rejects.toThrowError(/Extension did not find the file/);
    });
});
//# sourceMappingURL=open_mr_file.test.js.map