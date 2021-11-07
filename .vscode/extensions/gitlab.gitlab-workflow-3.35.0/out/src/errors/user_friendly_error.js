"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFriendlyError = void 0;
const common_1 = require("./common");
class UserFriendlyError extends Error {
    constructor(message, originalError, additionalInfo) {
        super(message);
        this.originalError = originalError;
        this.additionalInfo = additionalInfo;
    }
    get details() {
        return (0, common_1.prettyJson)({
            userMessage: this.message,
            errorMessage: this.originalError.message,
            stack: (0, common_1.stackToArray)(this.originalError.stack),
            additionalInfo: this.additionalInfo,
        });
    }
}
exports.UserFriendlyError = UserFriendlyError;
//# sourceMappingURL=user_friendly_error.js.map