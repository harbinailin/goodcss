"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stackToArray = exports.prettyJson = void 0;
const prettyJson = (obj) => JSON.stringify(obj, null, 2);
exports.prettyJson = prettyJson;
const stackToArray = (stack) => (stack !== null && stack !== void 0 ? stack : '').split('\n');
exports.stackToArray = stackToArray;
//# sourceMappingURL=common.js.map