"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryGetSnippets = void 0;
const graphql_request_1 = require("graphql-request");
exports.queryGetSnippets = (0, graphql_request_1.gql) `
  query GetSnippets($projectPath: ID!, $afterCursor: String) {
    project(fullPath: $projectPath) {
      id
      snippets(after: $afterCursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          title
          description
          blobs {
            nodes {
              name
              path
              rawPath
            }
          }
        }
      }
    }
  }
`;
//# sourceMappingURL=get_snippets.js.map