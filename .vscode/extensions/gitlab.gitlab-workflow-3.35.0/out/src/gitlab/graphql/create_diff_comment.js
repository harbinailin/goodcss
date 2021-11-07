"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiffNoteMutation = void 0;
const graphql_request_1 = require("graphql-request");
const shared_1 = require("./shared");
exports.createDiffNoteMutation = (0, graphql_request_1.gql) `
  ${shared_1.discussionDetailsFragment}
  mutation CreateDiffNote($issuableId: NoteableID!, $body: String!, $position: DiffPositionInput!) {
    createDiffNote(input: { noteableId: $issuableId, body: $body, position: $position }) {
      errors
      note {
        discussion {
          ...discussionDetails
        }
      }
    }
  }
`;
//# sourceMappingURL=create_diff_comment.js.map