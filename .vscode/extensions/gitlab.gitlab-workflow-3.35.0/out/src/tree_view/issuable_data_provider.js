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
exports.issuableDataProvider = exports.IssuableDataProvider = void 0;
const vscode = __importStar(require("vscode"));
const custom_query_item_model_1 = require("./items/custom_query_item_model");
const item_model_1 = require("./items/item_model");
const log_1 = require("../log");
const error_item_1 = require("./items/error_item");
const extension_state_1 = require("../extension_state");
const git_extension_wrapper_1 = require("../git/git_extension_wrapper");
const extension_configuration_1 = require("../utils/extension_configuration");
const repository_item_model_1 = require("./items/repository_item_model");
async function getAllGitlabRepositories() {
    const projectsWithUri = git_extension_wrapper_1.gitExtensionWrapper.repositories.map(async (repository) => {
        await repository.getProject(); // make sure we tried to fetch the project
        return repository;
    });
    return Promise.all(projectsWithUri);
}
class IssuableDataProvider {
    constructor() {
        this.eventEmitter = new vscode.EventEmitter();
        this.children = [];
        this.onDidChangeTreeData = this.eventEmitter.event;
        extension_state_1.extensionState.onDidChangeValid(this.refresh, this);
    }
    async getChildren(el) {
        if (el)
            return el.getChildren();
        this.children.forEach(ch => ch.dispose());
        this.children = [];
        if (!extension_state_1.extensionState.isValid()) {
            return [];
        }
        let repositories = [];
        try {
            repositories = await getAllGitlabRepositories();
        }
        catch (e) {
            (0, log_1.logError)(e);
            return [new error_item_1.ErrorItem('Fetching Issues and MRs failed')];
        }
        const { customQueries } = (0, extension_configuration_1.getExtensionConfiguration)();
        if (repositories.length === 1) {
            const [repository] = repositories;
            if (!repository.containsGitLabProject)
                return [new error_item_1.ErrorItem(`${repository.name}: Project failed to load`)];
            this.children = customQueries.map(q => new custom_query_item_model_1.CustomQueryItemModel(q, repository));
            return this.children;
        }
        this.children = repositories.map(r => new repository_item_model_1.RepositoryItemModel(r, customQueries));
        return this.children;
    }
    // eslint-disable-next-line class-methods-use-this
    getParent() {
        return null;
    }
    // eslint-disable-next-line class-methods-use-this
    getTreeItem(item) {
        if (item instanceof item_model_1.ItemModel)
            return item.getTreeItem();
        return item;
    }
    refresh() {
        this.eventEmitter.fire();
    }
}
exports.IssuableDataProvider = IssuableDataProvider;
exports.issuableDataProvider = new IssuableDataProvider();
//# sourceMappingURL=issuable_data_provider.js.map