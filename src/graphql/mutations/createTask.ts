import { gql } from "@apollo/client";
export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id title status priority squadId
    }
  }
`;
