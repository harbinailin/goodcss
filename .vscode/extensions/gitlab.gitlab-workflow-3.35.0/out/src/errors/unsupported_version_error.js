"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsupportedVersionError = void 0;
class UnsupportedVersionError extends Error {
    constructor(feature, currentVersion, requiredVersion) {
        super();
        this.feature = feature;
        this.currentVersion = currentVersion;
        this.requiredVersion = requiredVersion;
    }
    get message() {
        return `The feature "${this.feature}" is unsupported in GitLab version (${this.currentVersion}). To use ${this.feature}, upgrade to GitLab version ${this.requiredVersion} or later.`;
    }
}
exports.UnsupportedVersionError = UnsupportedVersionError;
//# sourceMappingURL=unsupported_version_error.js.map