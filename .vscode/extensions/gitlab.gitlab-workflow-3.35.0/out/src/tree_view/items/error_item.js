"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorItem = void 0;
const vscode_1 = require("vscode");
const command_names_1 = require("../../command_names");
class ErrorItem extends vscode_1.TreeItem {
    constructor(message = 'Error occurred, please try to refresh.') {
        super(message);
        this.iconPath = new vscode_1.ThemeIcon('error');
        this.command = {
            command: command_names_1.USER_COMMANDS.SHOW_OUTPUT,
            title: 'Show error output',
        };
    }
}
exports.ErrorItem = ErrorItem;
//# sourceMappingURL=error_item.js.map