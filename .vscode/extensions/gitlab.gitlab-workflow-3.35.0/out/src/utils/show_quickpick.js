"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showQuickPick = void 0;
async function showQuickPick(quickpick) {
    const result = await new Promise(res => {
        quickpick.onDidHide(() => res(undefined));
        quickpick.onDidAccept(() => {
            res(quickpick.selectedItems[0]);
            quickpick.hide();
        });
        quickpick.show();
    });
    return result;
}
exports.showQuickPick = showQuickPick;
//# sourceMappingURL=show_quickpick.js.map