"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gitlab_remote_source_provider_1 = require("./gitlab_remote_source_provider");
describe('convertUrlToWikiUrl', () => {
    test('should convert urls to wiki urls', () => {
        expect((0, gitlab_remote_source_provider_1.convertUrlToWikiUrl)('git@gitlab.com:username/myproject.git')).toBe('git@gitlab.com:username/myproject.wiki.git');
        expect((0, gitlab_remote_source_provider_1.convertUrlToWikiUrl)('https://gitlab.com/username/myproject.git')).toBe('https://gitlab.com/username/myproject.wiki.git');
        expect((0, gitlab_remote_source_provider_1.convertUrlToWikiUrl)('https://gitlab.com/user.git./myproject.git')).toBe('https://gitlab.com/user.git./myproject.wiki.git');
        expect((0, gitlab_remote_source_provider_1.convertUrlToWikiUrl)('https://gitlab.com/user.git./myproject')).toBe('https://gitlab.com/user.git./myproject');
        expect((0, gitlab_remote_source_provider_1.convertUrlToWikiUrl)('wrong')).toBe('wrong');
    });
});
//# sourceMappingURL=gitlab_remote_source_provider.test.js.map