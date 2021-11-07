"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extension_state_1 = require("../extension_state");
const as_mock_1 = require("../test_utils/as_mock");
const entities_1 = require("../test_utils/entities");
const issuable_data_provider_1 = require("./issuable_data_provider");
let repositories = [];
jest.mock('../extension_state');
jest.mock('../git/git_extension_wrapper', () => ({
    gitExtensionWrapper: {
        get repositories() {
            return repositories;
        },
    },
}));
describe('Issuable Data Provider', () => {
    let provider;
    beforeEach(() => {
        (0, as_mock_1.asMock)(extension_state_1.extensionState.isValid).mockReturnValue(true);
        provider = new issuable_data_provider_1.IssuableDataProvider();
    });
    it('returns empty array when there are no repositories', async () => {
        repositories = [];
        expect(await provider.getChildren(undefined)).toEqual([]);
    });
    it('returns an error item if the repository does not contain GitLab project', async () => {
        repositories = [{ ...entities_1.repository, getProject: () => undefined }];
        const children = await provider.getChildren(undefined);
        expect(children.length).toBe(1);
        expect(children[0].label).toMatch(/Project failed to load/);
    });
});
//# sourceMappingURL=issuable_data_provider.test.js.map