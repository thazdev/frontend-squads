import { ApolloClient, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { createUploadLink } from "apollo-upload-client";

/* --- link que entende multipart/form-data --- */
const uploadLink = createUploadLink({
  uri: "http://localhost:4000/graphql",
  headers: { "Apollo-Require-Preflight": "true" }, // exigido pelo CSRF do Apollo
});

/* --- injeta o JWT no header Authorization --- */
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

/* --- cliente final --- */
export const client = new ApolloClient({
  link: authLink.concat(uploadLink),
  cache: new InMemoryCache(),
});
