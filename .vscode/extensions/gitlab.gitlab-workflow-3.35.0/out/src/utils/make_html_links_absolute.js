"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeHtmlLinksAbsolute = void 0;
const makeHtmlLinksAbsolute = (html, instanceUrl) => html
    .replace(/\shref="\//gm, ` href="${instanceUrl}/`)
    .replace(/\sdata-src="\//gm, ` src="${instanceUrl}/`)
    .replace(/\sdata-src="/gm, ` src="`)
    .replace(/\ssrc="data:/gm, ' ignore-src="data:');
exports.makeHtmlLinksAbsolute = makeHtmlLinksAbsolute;
//# sourceMappingURL=make_html_links_absolute.js.map