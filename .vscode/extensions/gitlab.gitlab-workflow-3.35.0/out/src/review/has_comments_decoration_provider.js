"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasCommentsDecorationProvider = void 0;
const constants_1 = require("../constants");
exports.hasCommentsDecorationProvider = {
    provideFileDecoration: uri => {
        if (uri.scheme !== 'file') {
            return undefined;
        }
        const params = new URLSearchParams(uri.query);
        const hasComments = params.get(constants_1.HAS_COMMENTS_QUERY_KEY) === 'true';
        if (hasComments) {
            return { badge: '💬' };
        }
        return undefined;
    },
};
//# sourceMappingURL=has_comments_decoration_provider.js.map