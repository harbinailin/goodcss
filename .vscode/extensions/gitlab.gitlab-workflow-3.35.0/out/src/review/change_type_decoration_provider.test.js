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
const change_type_decoration_provider_1 = require("./change_type_decoration_provider");
const constants_1 = require("../constants");
describe('FileDecoratorProvider', () => {
    it.each `
    changeType  | decoration
    ${constants_1.ADDED}    | ${change_type_decoration_provider_1.decorations[constants_1.ADDED]}
    ${constants_1.DELETED}  | ${change_type_decoration_provider_1.decorations[constants_1.DELETED]}
    ${constants_1.RENAMED}  | ${change_type_decoration_provider_1.decorations[constants_1.RENAMED]}
    ${constants_1.MODIFIED} | ${change_type_decoration_provider_1.decorations[constants_1.MODIFIED]}
  `('Correctly maps changeType to decorator', ({ changeType, decoration }) => {
        const uri = vscode.Uri.file(`./test?${constants_1.CHANGE_TYPE_QUERY_KEY}=${changeType}`);
        const { token } = new vscode.CancellationTokenSource();
        const returnValue = change_type_decoration_provider_1.changeTypeDecorationProvider.provideFileDecoration(uri, token);
        expect(returnValue).toEqual(decoration);
    });
});
//# sourceMappingURL=change_type_decoration_provider.test.js.map