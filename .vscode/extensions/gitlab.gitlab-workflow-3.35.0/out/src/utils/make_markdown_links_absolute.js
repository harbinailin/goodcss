"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeMarkdownLinksAbsolute = void 0;
const makeMarkdownLinksAbsolute = (markdown, projectPath, instanceUrl) => markdown.replace(/\]\(\/uploads\//gm, `](${instanceUrl}/${projectPath}/uploads/`);
exports.makeMarkdownLinksAbsolute = makeMarkdownLinksAbsolute;
//# sourceMappingURL=make_markdown_links_absolute.js.map