"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMrPermissionsQuery = void 0;
const graphql_request_1 = require("graphql-request");
exports.getMrPermissionsQuery = (0, graphql_request_1.gql) `
  query GetMrPermissions($projectPath: ID!, $iid: String!) {
    project(fullPath: $projectPath) {
      mergeRequest(iid: $iid) {
        userPermissions {
          createNote
        }
      }
    }
  }
`;
//# sourceMappingURL=mr_permission.js.map