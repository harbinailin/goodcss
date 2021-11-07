"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRestIdFromGraphQLId = void 0;
const assert_1 = __importDefault(require("assert"));
// copied from the gitlab-org/gitlab project
// https://gitlab.com/gitlab-org/gitlab/-/blob/a4b939809c68c066e358a280491bf4ec2ff439a2/app/assets/javascripts/graphql_shared/utils.js#L9-10
const getRestIdFromGraphQLId = (gid) => {
    const result = parseInt(gid.replace(/gid:\/\/gitlab\/.*\//g, ''), 10);
    (0, assert_1.default)(result, `the gid ${gid} can't be parsed into REST id`);
    return result;
};
exports.getRestIdFromGraphQLId = getRestIdFromGraphQLId;
//# sourceMappingURL=get_rest_id_from_graphql_id.js.map