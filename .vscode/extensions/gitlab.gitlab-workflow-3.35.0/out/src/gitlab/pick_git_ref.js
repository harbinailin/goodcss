"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickGitRef = void 0;
const pick_with_query_1 = require("../utils/pick_with_query");
const gitlab_new_service_1 = require("./gitlab_new_service");
async function pickGitRef(instanceUrl, project) {
    const service = new gitlab_new_service_1.GitLabNewService(instanceUrl);
    const { picked } = await (0, pick_with_query_1.pickWithQuery)({
        ignoreFocusOut: true,
        placeholder: 'Select branch or tag',
    }, async (query) => {
        const [branches, tags] = await Promise.all([
            service.getBranches(project, query),
            service.getTags(project, query),
        ]);
        return [
            ...branches.map(b => ({ ...b, refType: 'branch', label: `$(git-branch) ${b.name}` })),
            ...tags.map(t => ({ ...t, refType: 'tag', label: `$(tag) ${t.name}` })),
        ];
    });
    return picked;
}
exports.pickGitRef = pickGitRef;
//# sourceMappingURL=pick_git_ref.js.map