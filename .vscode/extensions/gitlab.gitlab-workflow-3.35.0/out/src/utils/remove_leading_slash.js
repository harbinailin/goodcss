"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeLeadingSlash = void 0;
/** VS Code Uri returns absolute path (leading slash) but GitLab uses relative paths (no leading slash) */
const removeLeadingSlash = (filePath = '') => filePath.replace(/^\//, '');
exports.removeLeadingSlash = removeLeadingSlash;
//# sourceMappingURL=remove_leading_slash.js.map