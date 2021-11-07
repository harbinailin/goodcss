"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryGetProject = void 0;
const graphql_request_1 = require("graphql-request");
const shared_1 = require("./shared");
exports.queryGetProject = (0, graphql_request_1.gql) `
  ${shared_1.fragmentProjectDetails}
  query GetProject($projectPath: ID!) {
    project(fullPath: $projectPath) {
      ...projectDetails
    }
  }
`;
//# sourceMappingURL=get_project.js.map