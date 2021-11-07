"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFileInDiffs = void 0;
const remove_leading_slash_1 = require("./remove_leading_slash");
const findFileInDiffs = (diffs, path) => diffs.find(d => d.new_path === (0, remove_leading_slash_1.removeLeadingSlash)(path.newPath) ||
    d.old_path === (0, remove_leading_slash_1.removeLeadingSlash)(path.oldPath));
exports.findFileInDiffs = findFileInDiffs;
//# sourceMappingURL=find_file_in_diffs.js.map