"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entities_1 = require("../../test_utils/entities");
const stage_item_model_1 = require("./stage_item_model");
describe('StageItemModel', () => {
    const model = new stage_item_model_1.StageItemModel('test', [
        { ...entities_1.job, name: 'short task', status: 'failed' },
        { ...entities_1.job, name: 'long task', status: 'running' },
    ]);
    describe('tree item', () => {
        it('has label', () => {
            expect(model.getTreeItem().label).toBe('test');
        });
        it('takes tooltip and icon after the job with highest priority (e.g. running)', () => {
            const item = model.getTreeItem();
            expect(item.tooltip).toBe('Running');
            expect(item.iconPath.id).toBe('play');
        });
    });
    describe('children', () => {
        it('returns the jobs as children', async () => {
            const children = (await model.getChildren());
            expect(children.map(ch => ch.label)).toEqual(['short task', 'long task']);
        });
    });
});
//# sourceMappingURL=stage_item_model.test.js.map