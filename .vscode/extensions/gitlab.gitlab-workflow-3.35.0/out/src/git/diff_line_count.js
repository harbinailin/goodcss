"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewLineForOldUnchangedLine = exports.getAddedLinesForFile = void 0;
const assert_1 = __importDefault(require("assert"));
const find_file_in_diffs_1 = require("../utils/find_file_in_diffs");
// these helper functions are simplified version of the same lodash functions
const range = (start, end) => [...Array(end - start).keys()].map(n => n + start);
const flatten = (a) => a.reduce((acc, nested) => [...acc, ...nested], []);
const last = (a) => a[a.length - 1];
const first = (a) => a[0];
// copied from https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_isempty
const isEmpty = (obj) => [Object, Array].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;
/**
 * This method returns line number where in the text document given hunk starts.
 * Each hunk header contains information about where the hunk starts for old and new version.
 * `@@ -38,9 +36,8 @@` reads: hunk starts at line 38 of the old version and 36 of the new version.
 */
const getHunkStartingLine = (headerString = '') => {
    const headerMatch = headerString.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    return (headerMatch && {
        oldStart: parseInt(headerMatch[1], 10),
        newStart: parseInt(headerMatch[2], 10),
    });
};
const getRawHunks = (diff) => {
    return diff
        .replace(/^@@/, '') // remove first @@ because we'll remove all the other @@ by splitting
        .split('\n@@')
        .map(h => `@@${h}`); // prepend the removed @@ to all hunks
};
const REMOVED = 'REMOVED';
const ADDED = 'ADDED';
const UNCHANGED = 'UNCHANGED';
/** Converts lines in the text hunk into data structures that represent type of the change and affected lines */
const parseHunk = (hunk) => {
    const [headerLine, ...remainingLines] = hunk.split('\n');
    const header = getHunkStartingLine(headerLine);
    (0, assert_1.default)(header);
    const result = remainingLines
        .filter(l => l) // no empty lines
        .filter(l => !l.startsWith('\\')) // ignore '\ No newline at end of file'
        .reduce(({ oldIndex, newIndex, lines }, line) => {
        const prefix = line[0];
        switch (prefix) {
            case '-':
                return {
                    oldIndex: oldIndex + 1,
                    newIndex,
                    lines: [...lines, { type: REMOVED, oldLine: oldIndex }],
                };
            case '+':
                return {
                    oldIndex,
                    newIndex: newIndex + 1,
                    lines: [...lines, { type: ADDED, newLine: newIndex }],
                };
            case ' ':
                return {
                    oldIndex: oldIndex + 1,
                    newIndex: newIndex + 1,
                    lines: [...lines, { type: UNCHANGED, oldLine: oldIndex, newLine: newIndex }],
                };
            default:
                throw new Error(`Unexpected line prefix in a hunk. Hunk: ${hunk}, prefix ${prefix}`);
        }
    }, {
        oldIndex: header.oldStart,
        newIndex: header.newStart,
        lines: [],
    });
    return result.lines;
};
const getHunksForFile = (mrVersion, path) => {
    const diff = (0, find_file_in_diffs_1.findFileInDiffs)(mrVersion.diffs, path);
    if (!diff)
        return [];
    return getRawHunks(diff.diff).map(parseHunk);
};
const getAddedLinesForFile = (mrVersion, newPath) => {
    const hunkLines = flatten(getHunksForFile(mrVersion, { newPath }));
    return hunkLines.filter((hl) => hl.type === ADDED).map(hl => hl.newLine);
};
exports.getAddedLinesForFile = getAddedLinesForFile;
const newLineOffset = (line) => line.newLine - line.oldLine;
const createUnchangedLinesBetweenHunks = (previousHunkLast, nextHunkFirst) => {
    (0, assert_1.default)(previousHunkLast.type === UNCHANGED && nextHunkFirst.type === UNCHANGED);
    (0, assert_1.default)(newLineOffset(previousHunkLast) === newLineOffset(nextHunkFirst));
    return range(previousHunkLast.oldLine + 1, nextHunkFirst.oldLine).map(oldLine => ({
        type: UNCHANGED,
        oldLine,
        newLine: oldLine + newLineOffset(previousHunkLast),
    }));
};
const connectHunks = (parsedHunks) => parsedHunks.length === 0
    ? []
    : parsedHunks.reduce((acc, hunk) => [
        ...acc,
        ...createUnchangedLinesBetweenHunks(last(acc), first(hunk)),
        ...hunk,
    ]);
const addUnchangedLinesToBeginning = (lines) => {
    if (isEmpty(lines) || first(lines).oldLine === 1)
        return lines;
    return connectHunks([[{ type: UNCHANGED, oldLine: 1, newLine: 1 }], lines]);
};
const ensureOldLineIsPresent = (lines, oldLine) => {
    const lastLine = last(lines);
    if (!(lastLine === null || lastLine === void 0 ? void 0 : lastLine.oldLine) || lastLine.oldLine >= oldLine)
        return lines;
    (0, assert_1.default)(lastLine.type === UNCHANGED);
    return connectHunks([
        lines,
        [{ type: UNCHANGED, oldLine, newLine: oldLine + newLineOffset(lastLine) }],
    ]);
};
const getNewLineForOldUnchangedLine = (mrVersion, oldPath, oldLine) => {
    var _a;
    const connectedHunks = connectHunks(getHunksForFile(mrVersion, { oldPath }));
    const linesFromBeginning = addUnchangedLinesToBeginning(connectedHunks);
    const allDiffLines = ensureOldLineIsPresent(linesFromBeginning, oldLine);
    return (_a = allDiffLines.find(l => l.oldLine === oldLine)) === null || _a === void 0 ? void 0 : _a.newLine;
};
exports.getNewLineForOldUnchangedLine = getNewLineForOldUnchangedLine;
//# sourceMappingURL=diff_line_count.js.map