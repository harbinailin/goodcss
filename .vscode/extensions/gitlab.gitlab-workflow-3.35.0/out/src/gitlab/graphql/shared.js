"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discussionDetailsFragment = exports.noteDetailsFragment = exports.fragmentProjectDetails = void 0;
const graphql_request_1 = require("graphql-request");
exports.fragmentProjectDetails = (0, graphql_request_1.gql) `
  fragment projectDetails on Project {
    id
    name
    description
    httpUrlToRepo
    sshUrlToRepo
    fullPath
    webUrl
    wikiEnabled
    group {
      id
    }
  }
`;
const positionFragment = (0, graphql_request_1.gql) `
  fragment position on Note {
    position {
      diffRefs {
        baseSha
        headSha
        startSha
      }
      filePath
      positionType
      newLine
      oldLine
      newPath
      oldPath
      positionType
    }
  }
`;
exports.noteDetailsFragment = (0, graphql_request_1.gql) `
  ${positionFragment}
  fragment noteDetails on Note {
    id
    createdAt
    system
    author {
      avatarUrl
      name
      username
      webUrl
    }
    body
    bodyHtml
    userPermissions {
      resolveNote
      adminNote
      createNote
    }
    ...position
  }
`;
exports.discussionDetailsFragment = (0, graphql_request_1.gql) `
  ${exports.noteDetailsFragment}
  fragment discussionDetails on Discussion {
    replyId
    createdAt
    resolved
    resolvable
    notes {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...noteDetails
      }
    }
  }
`;
//# sourceMappingURL=shared.js.map