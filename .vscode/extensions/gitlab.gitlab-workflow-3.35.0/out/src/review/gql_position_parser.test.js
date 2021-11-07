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
const vscode = __importStar(require("vscode"));
const gql_position_parser_1 = require("./gql_position_parser");
const discussions_js_1 = require("../../test/integration/fixtures/graphql/discussions.js");
const { position } = discussions_js_1.noteOnDiff;
const oldPosition = {
    ...position,
    oldLine: 5,
    newLine: null,
    oldPath: 'oldPath.js',
    diffRefs: {
        ...position.diffRefs,
        baseSha: 'abcd',
    },
};
const newPosition = {
    ...position,
    oldLine: null,
    newLine: 20,
    newPath: 'newPath.js',
    diffRefs: {
        ...position.diffRefs,
        headSha: '1234',
    },
};
describe('pathFromPosition', () => {
    it('returns old path for old position', () => {
        expect((0, gql_position_parser_1.pathFromPosition)(oldPosition)).toBe('oldPath.js');
    });
    it('returns new path for new position', () => {
        expect((0, gql_position_parser_1.pathFromPosition)(newPosition)).toBe('newPath.js');
    });
});
describe('commitFromPosition', () => {
    it('returns baseSha for old position', () => {
        expect((0, gql_position_parser_1.commitFromPosition)(oldPosition)).toBe('abcd');
    });
    it('returns headSha for new position', () => {
        expect((0, gql_position_parser_1.commitFromPosition)(newPosition)).toBe('1234');
    });
});
describe('commentRangeFromPosition', () => {
    it('returns range with old line', () => {
        const line = new vscode.Position(4, 0);
        expect((0, gql_position_parser_1.commentRangeFromPosition)(oldPosition)).toEqual(new vscode.Range(line, line));
    });
    it('returns headSha for new position', () => {
        const line = new vscode.Position(19, 0);
        expect((0, gql_position_parser_1.commentRangeFromPosition)(newPosition)).toEqual(new vscode.Range(line, line));
    });
});
//# sourceMappingURL=gql_position_parser.test.js.map