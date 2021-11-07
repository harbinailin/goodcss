"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doNotAwait = void 0;
/** doNotAwait is used to circumvent the otherwise invaluable
 * @typescript-eslint/no-floating-promises rule. This util is meant
 * for informative messages that would otherwise block execution */
const doNotAwait = (promise) => {
    // not waiting for the promise
};
exports.doNotAwait = doNotAwait;
//# sourceMappingURL=do_not_await.js.map