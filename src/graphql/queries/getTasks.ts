import { gql } from "@apollo/client";
const GET_TASKS = gql`
  query ($squadId: ID!, $assigneeId: ID) {
    tasks(squadId: $squadId, assigneeId: $assigneeId) {
      id
      title
      status
      priority
      assignee { id name } 
    }
  }
`;

