import { gql } from "@apollo/client";
export const GET_COLLABORATORS = gql`
  query GetCollaborators {
    collaborators {
      id
      name
      email
      role
      squadId
      createdAt
    }
  }
`;
