"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_service_1 = require("./token_service");
describe('TokenService', () => {
    let tokenMap;
    let tokenService;
    beforeEach(() => {
        tokenMap = {};
        const fakeContext = {
            globalState: {
                get: () => tokenMap,
                update: (name, tm) => {
                    tokenMap = tm;
                },
            },
        };
        tokenService = new token_service_1.TokenService();
        tokenService.init(fakeContext);
    });
    it.each `
    storedFor                | retrievedFor
    ${'https://gitlab.com'}  | ${'https://gitlab.com'}
    ${'https://gitlab.com'}  | ${'https://gitlab.com/'}
    ${'https://gitlab.com/'} | ${'https://gitlab.com'}
    ${'https://gitlab.com/'} | ${'https://gitlab.com/'}
  `('when token stored for $storedFor, it can be retrieved for $retrievedFor', async ({ storedFor, retrievedFor }) => {
        await tokenService.setToken(storedFor, 'abc');
        expect(tokenService.getToken(retrievedFor)).toBe('abc');
    });
    /* This scenario happens when token was introduced before we started removing trailing slashes */
    it('can retrieve token if it was stored for url with trailing slash', async () => {
        tokenMap['https://gitlab.com/'] = 'abc';
        expect(tokenService.getToken('https://gitlab.com/')).toBe('abc');
    });
});
//# sourceMappingURL=token_service.test.js.map