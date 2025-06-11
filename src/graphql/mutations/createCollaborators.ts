import { gql } from "@apollo/client";
export const CREATE_COLLABORATOR = gql`
  mutation CreateCollaborator($input: CreateCollaboratorInput!) {
    createCollaborator(input: $input) {
      id
      name
      email
      role
      squadId
      createdAt
    }
  }
`;
