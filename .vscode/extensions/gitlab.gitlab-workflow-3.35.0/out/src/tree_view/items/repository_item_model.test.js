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
const custom_query_item_model_1 = require("./custom_query_item_model");
const entities_1 = require("../../test_utils/entities");
const repository_item_model_1 = require("./repository_item_model");
const repository = {
    name: 'GitLab Project',
    rootFsPath: '/path/to/repo',
    containsGitLabProject: true,
};
describe('RepositoryItemModel', () => {
    let item;
    beforeEach(() => {
        item = new repository_item_model_1.RepositoryItemModel(repository, [entities_1.customQuery]);
    });
    it('should use project name to create collapsed item', async () => {
        const treeItem = await item.getTreeItem();
        expect(treeItem.label).toBe('GitLab Project');
        expect(treeItem.collapsibleState).toBe(vscode.TreeItemCollapsibleState.Collapsed);
    });
    it('should return custom query children', async () => {
        const [a] = await item.getChildren();
        expect(a).toBeInstanceOf(custom_query_item_model_1.CustomQueryItemModel);
        expect(await a.getTreeItem().label).toBe(entities_1.customQuery.name);
    });
    describe('item labeled as a project', () => {
        it('should have project name as a label', () => {
            expect(item.getTreeItem().label).toBe(repository.name);
        });
        it('should have project icon', () => {
            expect(item.getTreeItem().iconPath).toEqual(new vscode.ThemeIcon('project'));
        });
    });
});
//# sourceMappingURL=repository_item_model.test.js.map