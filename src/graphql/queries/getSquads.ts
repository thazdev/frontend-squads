import { gql } from "@apollo/client";
export const GET_SQUADS = gql`
  query { squads { id name } }
`;
