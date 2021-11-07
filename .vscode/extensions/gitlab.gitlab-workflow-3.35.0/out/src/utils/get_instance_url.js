"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstanceUrl = void 0;
const git_extension_wrapper_1 = require("../git/git_extension_wrapper");
function getInstanceUrl(repositoryRoot) {
    const repository = git_extension_wrapper_1.gitExtensionWrapper.getRepository(repositoryRoot);
    return repository.instanceUrl;
}
exports.getInstanceUrl = getInstanceUrl;
//# sourceMappingURL=get_instance_url.js.map