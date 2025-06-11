import { gql } from "@apollo/client";

export const UPDATE_TASK_STATUS = gql`
  mutation ($id: ID!, $status: TaskStatus!) {
    updateTask(input: { id: $id, status: $status }) {
      id
      status
    }
  }
`;
