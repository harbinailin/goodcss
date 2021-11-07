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
const constants_1 = require("../constants");
const has_comments_decoration_provider_1 = require("./has_comments_decoration_provider");
describe('FileDecoratorProvider', () => {
    it.each `
    urlQuery                              | decoration
    ${`?${constants_1.HAS_COMMENTS_QUERY_KEY}=true`}  | ${'💬'}
    ${`?${constants_1.HAS_COMMENTS_QUERY_KEY}=false`} | ${undefined}
    ${''}                                 | ${undefined}
  `('Correctly maps hasComments query to decorator', async ({ urlQuery, decoration }) => {
        const uri = vscode.Uri.file(`./test${urlQuery}`);
        const { token } = new vscode.CancellationTokenSource();
        const returnValue = await has_comments_decoration_provider_1.hasCommentsDecorationProvider.provideFileDecoration(uri, token);
        expect(returnValue === null || returnValue === void 0 ? void 0 : returnValue.badge).toEqual(decoration);
    });
});
//# sourceMappingURL=has_comments_decoration_provider.test.js.map