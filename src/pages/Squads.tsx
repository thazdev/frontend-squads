import { gql, useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import AppModal from "../components/AppModal";

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

export default function Squads() {
  const [isOpen, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [goal, setGoal] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data, loading, error } = useQuery(GET_SQUADS);

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
      setErrorMsg(err.message);
    },
    onCompleted() {
      setErrorMsg("");
    },
  });

  async function handleSave() {
    await createSquad({
      variables: { input: { name: name.trim(), description: desc.trim() } },
    });
    setName("");
    setDesc("");
    setGoal("");
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Squads</h2>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
        >
          <FiPlus className="text-xl" />
          Novo Squad
        </button>
      </div>

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
              Criado em{" "}
              {new Date(squad.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        ))}
      </div>

      <AppModal title="Novo Squad" open={isOpen} onClose={() => setOpen(false)}>
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">Nome *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 resize-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Objetivo</label>
            <textarea
              rows={2}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ex.: entregar MVP em 2 meses"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 resize-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

          <footer className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setOpen(false)}
              className="px-5 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || creating}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {creating ? "Salvando…" : "Salvar"}
            </button>
          </footer>
        </div>
      </AppModal>
    </div>
  );
}
