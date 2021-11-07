"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickWithQuery = void 0;
const vscode = __importStar(require("vscode"));
const log_1 = require("../log");
const show_quickpick_1 = require("./show_quickpick");
/**
 * Shows a quickpick, using the query function to update the list of items when
 * the user types.
 * @param quickpick the quickpick to show
 * @param queryfn a function that is used to update the items when the user
 * types
 * @returns the selected item and the query string
 */
async function pickWithQuery(init, queryfn) {
    const pick = vscode.window.createQuickPick();
    Object.assign(pick, init);
    async function getItems(query) {
        try {
            pick.busy = true;
            pick.items = await queryfn(query);
        }
        catch (e) {
            (0, log_1.handleError)(e);
            pick.hide();
        }
        finally {
            pick.busy = false;
        }
    }
    pick.onDidChangeValue(getItems);
    // We only need the result from the quick pick, but the promise needs to be
    // awaited to avoid leaking errors
    const [, picked] = await Promise.all([getItems(), (0, show_quickpick_1.showQuickPick)(pick)]);
    return { picked, query: pick.value };
}
exports.pickWithQuery = pickWithQuery;
//# sourceMappingURL=pick_with_query.js.map