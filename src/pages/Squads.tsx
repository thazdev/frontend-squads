import { gql, useMutation, useQuery } from "@apollo/client";
import { useState } from "react";

const GET_SQUADS = gql`
  query GetSquads {
    squads {
      id
      name
      description
      archived
      createdAt
    }
  }
`;

const CREATE_SQUAD = gql`
  mutation CreateSquad($input: CreateSquadInput!) {
    createSquad(input: $input) {
      id
      name
      description
      archived
      createdAt
    }
  }
`;

/* ---------- Componente ---------- */
export default function Squads() {
  /* state do modal */
  const [isOpen, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  /* query de listagem */
  const { data, loading, error } = useQuery(GET_SQUADS);

  /* mutation de criação */
  const [createSquad, { loading: creating }] = useMutation(CREATE_SQUAD, {
    update(cache, { data }) {
      if (!data) return;
      cache.modify({
        fields: {
          squads(existing: any[] = []) {
            return [...existing, data.createSquad];
          },
        },
      });
    },
    onError(err) {
      alert(err.message);
    },
  });

  async function handleSave() {
    await createSquad({
      variables: { input: { name: name.trim(), description: desc.trim() } },
    });
    setName("");
    setDesc("");
    setOpen(false);
  }

  /* render */
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Squads</h2>
        <button
          onClick={() => setOpen(true)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Novo Squad
        </button>
      </div>

      {/* conteúdo */}
      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-600">{error.message}</p>}
      {!loading && data?.squads?.length === 0 && (
        <p className="text-gray-500">Nenhum squad disponível.</p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {data?.squads?.map((squad: any) => (
          <div
            key={squad.id}
            className="bg-white rounded-lg shadow p-4 flex flex-col gap-2"
          >
            <h3 className="text-lg font-medium">{squad.name}</h3>
            <p className="text-sm text-gray-600">{squad.description}</p>
            <span className="text-xs text-gray-400">
              Criado em {new Date(squad.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>

      {/* modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Criar Squad</h2>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome"
              className="w-full border rounded px-3 py-2"
            />
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Descrição"
              className="w-full border rounded px-3 py-2 h-24"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 border rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || creating}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
