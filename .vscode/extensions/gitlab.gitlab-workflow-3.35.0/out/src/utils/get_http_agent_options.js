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
exports.getHttpAgentOptions = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const user_friendly_error_1 = require("../errors/user_friendly_error");
const log_1 = require("../log");
const getHttpAgentOptions = () => {
    const result = {};
    // FIXME: if you are touching this configuration statement, move the configuration to extension_configuration.ts
    const { ignoreCertificateErrors, ca, cert, certKey } = vscode.workspace.getConfiguration('gitlab');
    result.rejectUnauthorized = !ignoreCertificateErrors;
    if (ca) {
        try {
            result.ca = fs.readFileSync(ca);
        }
        catch (e) {
            (0, log_1.handleError)(new user_friendly_error_1.UserFriendlyError(`Cannot read CA '${ca}'`, e));
        }
    }
    if (cert) {
        try {
            result.cert = fs.readFileSync(cert);
        }
        catch (e) {
            (0, log_1.handleError)(new user_friendly_error_1.UserFriendlyError(`Cannot read Certificate '${cert}'`, e));
        }
    }
    if (certKey) {
        try {
            result.key = fs.readFileSync(certKey);
        }
        catch (e) {
            (0, log_1.handleError)(new user_friendly_error_1.UserFriendlyError(`Cannot read Certificate Key '${certKey}'`, e));
        }
    }
    // FIXME: if you are touching this configuration statement, move the configuration to extension_configuration.ts
    const { proxy } = vscode.workspace.getConfiguration('http');
    result.proxy = proxy || undefined;
    return result;
};
exports.getHttpAgentOptions = getHttpAgentOptions;
//# sourceMappingURL=get_http_agent_options.js.map