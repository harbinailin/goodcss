"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_names_1 = require("../../command_names");
const constants_1 = require("../../constants");
const entities_1 = require("../../test_utils/entities");
const changed_file_item_1 = require("./changed_file_item");
describe('ChangedFileItem', () => {
    describe('image file', () => {
        it.each(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.bmp', '.avif', '.apng'])('should not show diff for %s', extension => {
            var _a;
            const changedImageFile = { ...entities_1.diffFile, new_path: `file${extension}` };
            const item = new changed_file_item_1.ChangedFileItem(entities_1.mr, entities_1.mrVersion, changedImageFile, '/repo', () => false);
            expect((_a = item.command) === null || _a === void 0 ? void 0 : _a.command).toBe(command_names_1.PROGRAMMATIC_COMMANDS.NO_IMAGE_REVIEW);
        });
        it('should indicate change type', () => {
            var _a;
            const changedImageFile = { ...entities_1.diffFile, new_path: `file.jpg` };
            const item = new changed_file_item_1.ChangedFileItem(entities_1.mr, entities_1.mrVersion, changedImageFile, '/repo', () => false);
            expect((_a = item.resourceUri) === null || _a === void 0 ? void 0 : _a.query).toContain(`${constants_1.CHANGE_TYPE_QUERY_KEY}=`);
        });
    });
    describe('captures whether there are comments on the changes', () => {
        let areThereChanges;
        const createItem = () => new changed_file_item_1.ChangedFileItem(entities_1.mr, entities_1.mrVersion, entities_1.diffFile, '/repository/fsPath', () => areThereChanges);
        it('indicates there are comments', () => {
            var _a;
            areThereChanges = true;
            expect((_a = createItem().resourceUri) === null || _a === void 0 ? void 0 : _a.query).toMatch(`${constants_1.HAS_COMMENTS_QUERY_KEY}=true`);
        });
        it('indicates there are no comments', () => {
            var _a;
            areThereChanges = false;
            expect((_a = createItem().resourceUri) === null || _a === void 0 ? void 0 : _a.query).toMatch(`${constants_1.HAS_COMMENTS_QUERY_KEY}=false`);
        });
    });
});
//# sourceMappingURL=changed_file_item.test.js.map