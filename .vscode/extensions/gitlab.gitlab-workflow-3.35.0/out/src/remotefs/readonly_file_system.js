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
exports.ReadOnlyFileSystem = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
const vscode = __importStar(require("vscode"));
class ReadOnlyFileSystem {
    onDidChangeFile(l, thisArgs, disposables) {
        return new vscode.Disposable(() => {
            /* do nothing */
        });
    }
    watch(uri, options) {
        return new vscode.Disposable(() => {
            /* do nothing */
        });
    }
    rename(oldUri, newUri, options) {
        throw vscode.FileSystemError.NoPermissions(oldUri);
    }
    createDirectory(uri) {
        throw vscode.FileSystemError.NoPermissions(uri);
    }
    writeFile(uri, content, options) {
        throw vscode.FileSystemError.NoPermissions(uri);
    }
    delete(uri, options) {
        throw vscode.FileSystemError.NoPermissions(uri);
    }
}
exports.ReadOnlyFileSystem = ReadOnlyFileSystem;
//# sourceMappingURL=readonly_file_system.js.map