"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compare = void 0;
/** can be passed to Array.sort method, sorts in ascending order */
const compare = (a, b) => {
    if (a > b)
        return 1;
    if (a < b)
        return -1;
    return 0;
};
exports.compare = compare;
//# sourceMappingURL=compare.js.map