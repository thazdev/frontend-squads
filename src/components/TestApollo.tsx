import { gql, useQuery } from "@apollo/client";

const GET_COLLABORATORS = gql`
  query {
    getAllCollaborators {
      _key
      name
      role
    }
  }
`;

export function TestApollo() {
  const { data, loading, error } = useQuery(GET_COLLABORATORS);

  if (loading) return <p>Carregando...</p>;
if (error) return <p>Erro: {error.message}</p>;

console.log(data); 

return (
  <div>
    <h1>Colaboradores:</h1>
    <ul>
      {data.getAllCollaborators.map((colab: any) => (
        <li key={colab._key}>{colab.name}</li>
      ))}
    </ul>
  </div>
);
}
