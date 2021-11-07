"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIssueDiscussionsQuery = exports.getMrDiscussionsQuery = void 0;
const graphql_request_1 = require("graphql-request");
const shared_1 = require("./shared");
const discussionsFragment = (0, graphql_request_1.gql) `
  ${shared_1.discussionDetailsFragment}
  fragment discussions on DiscussionConnection {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      ...discussionDetails
    }
  }
`;
exports.getMrDiscussionsQuery = (0, graphql_request_1.gql) `
  ${discussionsFragment}
  query GetMrDiscussions($projectPath: ID!, $iid: String!, $afterCursor: String) {
    project(fullPath: $projectPath) {
      id
      mergeRequest(iid: $iid) {
        discussions(after: $afterCursor) {
          ...discussions
        }
      }
    }
  }
`;
exports.getIssueDiscussionsQuery = (0, graphql_request_1.gql) `
  ${discussionsFragment}
  query GetIssueDiscussions($projectPath: ID!, $iid: String!, $afterCursor: String) {
    project(fullPath: $projectPath) {
      id
      issue(iid: $iid) {
        discussions(after: $afterCursor) {
          ...discussions
        }
      }
    }
  }
`;
//# sourceMappingURL=get_discussions.js.map