/* pages/Collaborators.tsx */
import { gql, useMutation, useQuery } from "@apollo/client";
import { useMemo, useState } from "react";
import { FiSearch, FiUserPlus } from "react-icons/fi";
import AppModal from "../components/AppModal";
import { GET_SQUADS } from "../graphql/queries/getSquads";

/* ────────── QUERIES & MUTATIONS ────────── */
const GET_COLLABORATORS = gql`
  query GetCollaborators {
    collaborators {
      id
      name
      email
      role
      squadId
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
      squadId
      createdAt
    }
  }
`;

/* chip por função */
const roleColors: Record<string, string> = {
  DEV: "bg-sky-100 text-sky-700",
  DESIGN: "bg-pink-100 text-pink-700",
  PM: "bg-yellow-100 text-yellow-700",
};

export default function Collaborators() {
  /* criação de colaborador */
  const [isOpenCreate, setOpenCreate] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"DEV" | "DESIGN" | "PM">("DEV");
  const [squadId, setSquadId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  /* dados */
  const { data: squadsData } = useQuery(GET_SQUADS);
  const squads = squadsData?.squads ?? [];

  const { data, loading, error } = useQuery(GET_COLLABORATORS);

  /* filtro */
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!data?.collaborators) return [];
    const q = search.trim().toLowerCase();
    return q
      ? data.collaborators.filter(
          (c: any) =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q)
        )
      : data.collaborators;
  }, [data, search]);

  /* mutation criar */
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
      onError: (err) => setErrorMsg(err.message),
      onCompleted: () => setErrorMsg(""),
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
    setOpenCreate(false);
  }

  /* modal detalhes */
  const [detail, setDetail] = useState<any | null>(null);

  /* helpers */
  const squadName = (id?: string | null) =>
    squads.find((s: any) => s.id === id)?.name ?? "—";

  return (
    <div className="space-y-6">
      {/* topo */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Colaboradores</h2>

        <button
          data-testid="open-create-collaborator"
          onClick={() => setOpenCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
        >
          <FiUserPlus className="text-xl" />
          Novo Colaborador
        </button>
      </div>

      {/* barra de pesquisa */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar colaborador…"
          className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {loading && <p>Carregando…</p>}
      {error && <p className="text-red-600">{error.message}</p>}
      {!loading && filtered.length === 0 && (
        <p className="text-gray-500">Nenhum resultado encontrado.</p>
      )}

      {/* cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((c: any) => (
          <button
            key={c.id}
            onClick={() => setDetail(c)}
            className="text-left bg-white rounded-lg border border-gray-200 shadow hover:shadow-md transition p-4 space-y-1"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{c.name}</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                  roleColors[c.role]
                }`}
              >
                {c.role}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-1">{c.email}</p>
            <p className="text-xs text-gray-500">
              Squad: {squadName(c.squadId)}
            </p>
            <p className="text-[10px] text-gray-400">
              Desde {new Date(c.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </button>
        ))}
      </div>

      {/* modal criar colaborador */}
      <AppModal
        title="Novo Colaborador"
        open={isOpenCreate}
        onClose={() => setOpenCreate(false)}
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
            <label className="text-sm font-medium text-gray-700">
              E-mail *
            </label>
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
              onClick={() => setOpenCreate(false)}
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

      {/* modal detalhes colaborador */}
      <AppModal
        title={detail?.name ?? ""}
        open={!!detail}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{detail.email}</p>

            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                  roleColors[detail.role]
                }`}
              >
                {detail.role}
              </span>
              <span className="text-xs text-gray-500">
                Membro desde{" "}
                {new Date(detail.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>

            <p className="text-sm text-gray-700">
              Squad:{" "}
              <span className="font-medium">{squadName(detail.squadId)}</span>
            </p>
          </div>
        )}
      </AppModal>
    </div>
  );
}
