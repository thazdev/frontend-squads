import { gql } from "@apollo/client";

export const UPDATE_TASK_STATUS = gql`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      id
      status
      priority
      difficulty
      impact
    }
  }
`;
