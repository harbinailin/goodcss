"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareBy = void 0;
const compare_1 = require("./compare");
/** creates a comparison method for T objects that can be used for sorting. Can be replaced with lodash sortBy. */
const compareBy = (key) => {
    return (a, b) => (0, compare_1.compare)(a[key], b[key]);
};
exports.compareBy = compareBy;
//# sourceMappingURL=compare_by.js.map