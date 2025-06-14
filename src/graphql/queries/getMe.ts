import { gql } from "@apollo/client";
export const GET_ME = gql`
  query GetMe {
    me {
      user {
        id
        name
        email
        bio
        avatar
      }
      squads {
        id
        name
      }
      tasksOverall {
        total
        pending
        done
      }
    }
  }
`;
