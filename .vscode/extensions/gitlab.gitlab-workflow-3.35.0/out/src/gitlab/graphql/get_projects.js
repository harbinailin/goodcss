"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryGetProjects = void 0;
const graphql_request_1 = require("graphql-request");
const shared_1 = require("./shared");
exports.queryGetProjects = (0, graphql_request_1.gql) `
  ${shared_1.fragmentProjectDetails}
  query GetProjects(
    $search: String
    $membership: Boolean
    $limit: Int
    $searchNamespaces: Boolean
  ) {
    projects(
      search: $search
      membership: $membership
      first: $limit
      searchNamespaces: $searchNamespaces
    ) {
      nodes {
        ...projectDetails
        repository {
          empty
        }
      }
    }
  }
`;
//# sourceMappingURL=get_projects.js.map