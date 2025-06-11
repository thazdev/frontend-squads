import { gql } from "@apollo/client";

export const GET_COLLABORATORS_BY_SQUAD = gql`
  query GetCollabs($squadId: ID!) {
    collaborators(filter: { squadId: $squadId }) {
      id
      name
    }
  }
`;
