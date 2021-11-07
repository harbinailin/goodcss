"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalUrlItem = void 0;
const vscode_1 = require("vscode");
const open_in_browser_command_1 = require("../../utils/open_in_browser_command");
class ExternalUrlItem extends vscode_1.TreeItem {
    constructor(label, url) {
        super(label);
        this.command = (0, open_in_browser_command_1.openInBrowserCommand)(url);
    }
}
exports.ExternalUrlItem = ExternalUrlItem;
//# sourceMappingURL=external_url_item.js.map