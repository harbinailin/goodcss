"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpError = void 0;
class HelpError extends Error {
    constructor(message, options) {
        super(message);
        this.options = options;
    }
}
exports.HelpError = HelpError;
//# sourceMappingURL=help_error.js.map