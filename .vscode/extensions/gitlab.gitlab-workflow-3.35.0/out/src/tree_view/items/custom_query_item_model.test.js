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
const entities_1 = require("../../test_utils/entities");
const custom_query_item_model_1 = require("./custom_query_item_model");
describe('CustomQueryItem', () => {
    let item;
    const repository = {
        name: 'GitLab Project',
        rootFsPath: '/path/to/repo',
        containsGitLabProject: true,
    };
    describe('item labeled as a query', () => {
        beforeEach(() => {
            item = new custom_query_item_model_1.CustomQueryItemModel(entities_1.customQuery, repository).getTreeItem();
        });
        it('should have query name as label', () => {
            expect(item.label).toBe('Query name');
        });
        it('should have filter icon', () => {
            expect(item.iconPath).toEqual(new vscode.ThemeIcon('filter'));
        });
    });
});
//# sourceMappingURL=custom_query_item_model.test.js.map