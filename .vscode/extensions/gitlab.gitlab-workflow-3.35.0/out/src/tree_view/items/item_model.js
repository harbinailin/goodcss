"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemModel = void 0;
class ItemModel {
    constructor() {
        this.disposableChildren = [];
    }
    setDisposableChildren(children) {
        this.disposableChildren = children;
    }
    dispose() {
        this.disposableChildren.forEach(ch => ch.dispose());
    }
}
exports.ItemModel = ItemModel;
//# sourceMappingURL=item_model.js.map