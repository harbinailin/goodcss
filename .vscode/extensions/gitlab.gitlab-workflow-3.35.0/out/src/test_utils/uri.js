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
exports.Uri = void 0;
const path = __importStar(require("path"));
/**
 * This is a test double for unit-testing vscode.Uri related logic.
 * `vscode` module gets injected into the runtime only in integration tests so
 * Jest tests don't have access to the real implementation.
 *
 * This double approximates the vscode.Uri behavior closely enough, that
 * we can use it in tests. But the logic is not identical.
 */
class Uri {
    constructor(options) {
        this.scheme = options.scheme;
        this.authority = options.authority;
        this.path = options.path;
        this.query = options.query;
        this.fragment = options.fragment;
    }
    get fsPath() {
        return this.path;
    }
    with(change) {
        var _a, _b, _c, _d, _e;
        return new Uri({
            scheme: (_a = change.scheme) !== null && _a !== void 0 ? _a : this.scheme,
            authority: (_b = change.authority) !== null && _b !== void 0 ? _b : this.authority,
            path: (_c = change.path) !== null && _c !== void 0 ? _c : this.path,
            query: (_d = change.query) !== null && _d !== void 0 ? _d : this.query,
            fragment: (_e = change.fragment) !== null && _e !== void 0 ? _e : this.fragment,
        });
    }
    toString(skipEncoding) {
        // eslint-disable-next-line prefer-const
        let { scheme, authority, path, query, fragment } = this;
        if (query.length > 0)
            query = `?${query}`;
        if (fragment.length > 0)
            fragment = `#${fragment}`;
        return `${scheme}://${authority}${path}${query}${fragment}`;
    }
    toJSON() {
        return JSON.stringify({ ...this });
    }
    static parse(stringUri) {
        const url = new URL(stringUri);
        return new Uri({
            scheme: url.protocol.replace(/:$/, ''),
            authority: url.hostname,
            path: url.pathname,
            query: url.search.replace(/^\?/, ''),
            fragment: url.hash.replace(/^#/, ''),
        });
    }
    static file(filePath) {
        return new Uri({
            scheme: 'file',
            authority: '',
            path: filePath.split('?')[0] || '',
            query: filePath.split('?')[1] || '',
            fragment: '',
        });
    }
    static joinPath(base, ...pathSegments) {
        const { path: p, ...rest } = base;
        return new this({ ...rest, path: path.join(p, ...pathSegments) });
    }
}
exports.Uri = Uri;
//# sourceMappingURL=uri.js.map