import { gql, useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import AppModal from "../components/AppModal";
import { GET_SQUADS } from "../graphql/queries/getSquads";

const GET_COLLABORATORS = gql`
  query GetCollaborators {
    collaborators {
      id
      name
      email
      role
      createdAt
    }
  }
`;

const CREATE_COLLABORATOR = gql`
  mutation CreateCollaborator($input: CreateCollaboratorInput!) {
    createCollaborator(input: $input) {
      id
      name
      email
      role
      createdAt
    }
  }
`;

export default function Collaborators() {
  const [isOpen, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"DEV" | "DESIGN" | "PM">("DEV");
  const [squadId, setSquadId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: squadsData } = useQuery(GET_SQUADS);
  const squads = squadsData?.squads ?? [];

  const { data, loading, error } = useQuery(GET_COLLABORATORS);

  const [createCollaborator, { loading: creating }] = useMutation(
    CREATE_COLLABORATOR,
    {
      update(cache, { data }) {
        if (!data) return;
        cache.modify({
          fields: {
            collaborators(existing: any[] = []) {
              return [...existing, data.createCollaborator];
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
    }
  );

  async function handleSave() {
    await createCollaborator({
      variables: {
        input: { name: name.trim(), email: email.trim(), role, squadId },
      },
    });
    setName("");
    setEmail("");
    setRole("DEV");
    setSquadId("");
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Colaboradores</h2>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
        >
          <FiUserPlus className="text-xl" />
          Novo Colaborador
        </button>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-600">{error.message}</p>}
      {!loading && data?.collaborators?.length === 0 && (
        <p className="text-gray-500">Ainda não há colaboradores cadastrados.</p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {data?.collaborators?.map((c: any) => (
          <div
            key={c.id}
            className="bg-white rounded-lg shadow p-4 flex flex-col gap-1"
          >
            <h3 className="text-lg font-medium">{c.name}</h3>
            <p className="text-sm text-gray-600">{c.email}</p>
            <span className="text-xs text-gray-500">
              Cargo: {c.role} •{" "}
              {new Date(c.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        ))}
      </div>

      <AppModal
        title="Novo Colaborador"
        open={isOpen}
        onClose={() => setOpen(false)}
      >
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
            <label className="text-sm font-medium text-gray-700">E-mail *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Squad</label>
            <select
              value={squadId}
              onChange={(e) => setSquadId(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
            >
              <option value=""></option>
              {squads.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Cargo</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
            >
              <option value="DEV">DEV</option>
              <option value="DESIGN">DESIGN</option>
              <option value="PM">PM</option>
            </select>
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
              disabled={!name.trim() || !email.trim() || creating}
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
