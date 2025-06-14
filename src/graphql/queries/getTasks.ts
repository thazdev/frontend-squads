import { gql } from "@apollo/client";

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      status
      priority
      impact
      difficulty
      assignee {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;
