"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const make_markdown_links_absolute_1 = require("./make_markdown_links_absolute");
describe('makeMarkdownLinksAbsolute', () => {
    it('replaces attachment links with absolute URL, including project path', () => {
        const relativeLink = 'Click [here](/uploads/1234hash/image.png).';
        expect((0, make_markdown_links_absolute_1.makeMarkdownLinksAbsolute)(relativeLink, 'group/project', 'https://gitlab.com')).toBe('Click [here](https://gitlab.com/group/project/uploads/1234hash/image.png).');
    });
    it('handles multiline strings', () => {
        const relativeLink = 'first line\nClick [here](/uploads/1234hash/image.png).';
        expect((0, make_markdown_links_absolute_1.makeMarkdownLinksAbsolute)(relativeLink, 'group/project', 'https://gitlab.com')).toMatch('Click [here](https://gitlab.com/group/project/uploads/1234hash/image.png).');
    });
    it('ignores non-attachment relative links', () => {
        const relativeLink = 'Click [here](/group/project/issues).';
        expect((0, make_markdown_links_absolute_1.makeMarkdownLinksAbsolute)(relativeLink, 'group/project', 'https://gitlab.com')).toBe('Click [here](/group/project/issues).');
    });
});
//# sourceMappingURL=make_markdown_links_absolute.test.js.map