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
exports.changeTypeDecorationProvider = exports.decorations = void 0;
const vscode = __importStar(require("vscode"));
const constants_1 = require("../constants");
exports.decorations = {
    [constants_1.ADDED]: {
        badge: 'A',
        color: new vscode.ThemeColor('gitDecoration.addedResourceForeground'),
    },
    [constants_1.MODIFIED]: {
        badge: 'M',
    },
    [constants_1.DELETED]: {
        badge: 'D',
        color: new vscode.ThemeColor('gitDecoration.deletedResourceForeground'),
    },
    [constants_1.RENAMED]: {
        badge: 'R',
        color: new vscode.ThemeColor('gitDecoration.modifiedResourceForeground'),
    },
};
exports.changeTypeDecorationProvider = {
    provideFileDecoration: uri => {
        if (uri.scheme === 'file') {
            const params = new URLSearchParams(uri.query);
            const changeType = params.get(constants_1.CHANGE_TYPE_QUERY_KEY);
            if (changeType) {
                return exports.decorations[changeType];
            }
        }
        return undefined;
    },
};
//# sourceMappingURL=change_type_decoration_provider.js.map