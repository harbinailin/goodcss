"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entities_1 = require("../test_utils/entities");
const find_file_in_diffs_1 = require("./find_file_in_diffs");
describe('findFileInDiffs', () => {
    const diff = {
        ...entities_1.diffFile,
        old_path: 'test/oldName.js',
        new_path: 'test/newName.js',
    };
    it.each `
    oldPath               | newPath
    ${'/test/oldName.js'} | ${undefined}
    ${'test/oldName.js'}  | ${undefined}
    ${undefined}          | ${'/test/newName.js'}
    ${undefined}          | ${'/test/newName.js'}
  `('finds a file with oldPath: $oldPath and newPath: $newPath', ({ oldPath, newPath }) => {
        expect((0, find_file_in_diffs_1.findFileInDiffs)([diff], { oldPath, newPath })).toEqual(diff);
    });
    it('returns undefined when it does not find a file', () => {
        expect((0, find_file_in_diffs_1.findFileInDiffs)([diff], { oldPath: '/nonexistent' })).toEqual(undefined);
    });
});
//# sourceMappingURL=find_file_in_diffs.test.js.map