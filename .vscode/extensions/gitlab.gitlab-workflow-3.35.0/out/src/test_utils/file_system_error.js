"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemError = void 0;
class FileSystemError extends Error {
    constructor(code, messageOrUri) {
        super(typeof messageOrUri === 'string' ? messageOrUri : messageOrUri === null || messageOrUri === void 0 ? void 0 : messageOrUri.toString());
        this.code = code;
    }
    static FileNotFound(messageOrUri) {
        return new this('file-not-found', `File not found: ${messageOrUri}`);
    }
    static FileExists(messageOrUri) {
        return new this('file-exists', `File exists: ${messageOrUri}`);
    }
    static FileNotADirectory(messageOrUri) {
        return new this('file-not-a-directory', `File not a directory: ${messageOrUri}`);
    }
    static FileIsADirectory(messageOrUri) {
        return new this('file-is-a-directory', `File is a directory: ${messageOrUri}`);
    }
    static NoPermissions(messageOrUri) {
        return new this('no-permissions', `No permissions: ${messageOrUri}`);
    }
    static Unavailable(messageOrUri) {
        return new this('unavailable', `Unavailable: ${messageOrUri}`);
    }
}
exports.FileSystemError = FileSystemError;
//# sourceMappingURL=file_system_error.js.map