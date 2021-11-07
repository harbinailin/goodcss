"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_FETCH_RESPONSE = void 0;
exports.DEFAULT_FETCH_RESPONSE = '# Fabulous Project\n\nThis project does fabulous things.';
const DEFAULT_JSON_RESPONSE = {
    name: 'Fabulous Project',
    description: 'This project does fabulous things.',
};
const fn = jest.fn().mockResolvedValue({
    ok: true,
    async text() {
        return exports.DEFAULT_FETCH_RESPONSE;
    },
    async json() {
        return DEFAULT_JSON_RESPONSE;
    },
});
exports.default = fn;
//# sourceMappingURL=cross-fetch.js.map