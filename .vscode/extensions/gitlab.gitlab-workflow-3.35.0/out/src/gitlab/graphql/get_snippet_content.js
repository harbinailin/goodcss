"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnippetContentQuery = void 0;
const graphql_request_1 = require("graphql-request");
exports.getSnippetContentQuery = (0, graphql_request_1.gql) `
  query GetSnippetContent($snippetId: SnippetID!) {
    snippets(ids: [$snippetId]) {
      nodes {
        blobs {
          nodes {
            path
            rawPlainData
          }
        }
      }
    }
  }
`;
//# sourceMappingURL=get_snippet_content.js.map