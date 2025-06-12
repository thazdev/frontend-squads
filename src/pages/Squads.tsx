/* src/pages/Squads.tsx */
import { gql, useMutation, useQuery } from "@apollo/client";
import { useMemo, useState } from "react";
import { FiPlus, FiSearch, FiUsers, FiX } from "react-icons/fi";
import AppModal from "../components/AppModal";

/* ────────── QUERIES & MUTATIONS ────────── */
const GET_SQUADS = gql`
  query GetSquads {
    squads {
      id
      name
      description
      goal
      memberIds
      createdAt
    }
  }
`;

const GET_SQUAD_MEMBERS = gql`
  query GetSquadMembers($squadId: ID!) {
    collaborators(filter: { squadId: $squadId }) {
      id
      name
      role
    }
  }
`;

const GET_COLLABORATORS = gql`
  query {
    collaborators {
      id
      name
    }
  }
`;

const CREATE_SQUAD = gql`
  mutation CreateSquad($input: CreateSquadInput!) {
    createSquad(input: $input) {
      id
      name
      description
      goal
      memberIds
      createdAt
    }
  }
`;

const ADD_MEMBER = gql`
  mutation AddMember($squadId: ID!, $memberId: ID!) {
    addMemberToSquad(squadId: $squadId, memberId: $memberId) {
      id
      memberIds
    }
  }
`;

const REMOVE_MEMBER = gql`
  mutation RemoveMember($squadId: ID!, $memberId: ID!) {
    removeMemberFromSquad(squadId: $squadId, memberId: $memberId) {
      id
      memberIds
    }
  }
`;

/* ────────── COMPONENT ────────── */
export default function Squads() {
  /* ---------- estado global ---------- */
  const [squadSearch, setSquadSearch] = useState("");

  /* ---------- criação ---------- */
  const [isOpenCreate, setOpenCreate] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [goal, setGoal] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  /* ---------- data ---------- */
  const { data: squadData, loading, error } = useQuery(GET_SQUADS);
  const { data: collabData } = useQuery(GET_COLLABORATORS);

  /* ---------- create squad ---------- */
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
    onError: (e) => setErrorMsg(e.message),
  });

  async function handleSave() {
    await createSquad({
      variables: {
        input: {
          name: name.trim(),
          description: desc.trim(),
          goal: goal.trim(),
          memberIds: members,
        },
      },
    });
    setName("");
    setDesc("");
    setGoal("");
    setMembers([]);
    setMemberSearch("");
    setOpenCreate(false);
  }

  /* ---------- filter squads ---------- */
  const visibleSquads = useMemo(() => {
    if (!squadData?.squads) return [];
    const q = squadSearch.trim().toLowerCase();
    return q
      ? squadData.squads.filter(
          (s: any) =>
            s.name.toLowerCase().includes(q) ||
            (s.description ?? "").toLowerCase().includes(q)
        )
      : squadData.squads;
  }, [squadData, squadSearch]);

  /* ---------- filter collaborators (create) ---------- */
  const filteredMembers = useMemo(() => {
    if (!collabData?.collaborators) return [];
    const q = memberSearch.trim().toLowerCase();
    return q
      ? collabData.collaborators.filter((c: any) =>
          c.name.toLowerCase().includes(q)
        )
      : collabData.collaborators;
  }, [collabData, memberSearch]);

  function toggleMember(id: string) {
    setMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  /* ---------- details modal ---------- */
  const [detail, setDetail] = useState<any | null>(null);
  const { data: membersData, refetch: refetchMembers } = useQuery(
    GET_SQUAD_MEMBERS,
    { variables: { squadId: detail?.id ?? "" }, skip: !detail }
  );

  /* add & remove mutations */
  const [addMember] = useMutation(ADD_MEMBER);
  const [removeMember] = useMutation(REMOVE_MEMBER);

  /* candidates list */
  const [addSearch, setAddSearch] = useState("");
  const addCandidates = useMemo(() => {
    if (!collabData?.collaborators || !detail) return [];
    const already = new Set(detail.memberIds ?? []);
    const q = addSearch.trim().toLowerCase();
    return collabData.collaborators.filter(
      (c: any) => !already.has(c.id) && c.name.toLowerCase().includes(q)
    );
  }, [addSearch, collabData, detail]);

  /* ---------- UI ---------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Squads</h2>
        <button
          onClick={() => setOpenCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
        >
          <FiPlus className="text-xl" /> Novo Squad
        </button>
      </div>

      {/* Search squads */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
        <input
          value={squadSearch}
          onChange={(e) => setSquadSearch(e.target.value)}
          placeholder="Pesquisar squad…"
          className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {loading && <p>Carregando…</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      <div className="grid md:grid-cols-2 gap-4">
        {visibleSquads.map((s: any) => (
          <button
            key={s.id}
            onClick={() => setDetail(s)}
            className="text-left bg-white rounded-xl border border-gray-200 shadow hover:shadow-md p-4 space-y-1 transition"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium line-clamp-1">{s.name}</h3>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <FiUsers /> {s.memberIds?.length ?? 0}
              </span>
            </div>
            {s.description && (
              <p className="text-sm text-gray-600 line-clamp-1">
                {s.description}
              </p>
            )}
            {s.goal && (
              <p className="text-[11px] text-purple-600 line-clamp-1">
                🎯 {s.goal}
              </p>
            )}
            <span className="text-[11px] text-gray-400">
              Criado em {new Date(s.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </button>
        ))}
      </div>

      {/* ────────── MODAL CRIAR ────────── */}
      <AppModal
        title="Novo Squad"
        open={isOpenCreate}
        onClose={() => setOpenCreate(false)}
      >
        <div className="space-y-5">
          {/* Campos */}
          <div>
            <label className="text-sm font-medium">Nome *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descrição</label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Objetivo</label>
            <textarea
              rows={2}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ex.: entregar MVP em 2 meses"
              className="mt-1 w-full border rounded-lg px-3 py-2 resize-none"
            />
          </div>

          {/* Seleção de membros */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Membros</label>

            <div className="relative">
              <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
              <input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Pesquisar colaborador…"
                className="pl-10 pr-3 py-2 w-full border rounded-lg text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pt-1">
              {filteredMembers.map((c: any) => {
                const selected = members.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleMember(c.id)}
                    className={`px-3 py-1 rounded-full text-sm border transition ${
                      selected
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
              {filteredMembers.length === 0 && (
                <span className="text-xs text-gray-400">Nenhum resultado.</span>
              )}
            </div>
          </div>

          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

          <footer className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setOpenCreate(false)}
              className="px-5 py-2 border rounded-lg bg-white hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || creating}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            >
              {creating ? "Salvando…" : "Salvar"}
            </button>
          </footer>
        </div>
      </AppModal>

      {/* ────────── MODAL DETALHES ────────── */}
      <AppModal
        title={detail?.name ?? ""}
        open={!!detail}
        maxWidth="max-w-2xl" /* modal maior */
        onClose={() => {
          setDetail(null);
          setAddSearch("");
        }}
      >
        {detail && (
          <div className="space-y-6">
            {detail.description && (
              <p className="text-gray-700 whitespace-pre-line">
                {detail.description}
              </p>
            )}
            {detail.goal && (
              <p className="text-purple-700 whitespace-pre-line">
                🎯 {detail.goal}
              </p>
            )}

            {/* membros existentes */}
            <div>
              <h4 className="font-semibold text-sm mb-1 flex items-center gap-1">
                <FiUsers /> Membros ({membersData?.collaborators?.length ?? 0})
              </h4>
              {membersData ? (
                membersData.collaborators.length ? (
                  <ul className="space-y-1 text-sm mb-2">
                    {membersData.collaborators.map((m: any) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between pr-1 group"
                      >
                        <span>{m.name}</span>
                        <button
                          onClick={async () => {
                            const res = await removeMember({
                              variables: {
                                squadId: detail.id,
                                memberId: m.id,
                              },
                            });
                            /* atualiza estado detail para refletir mudanças */
                            setDetail({
                              ...detail,
                              memberIds:
                                res.data?.removeMemberFromSquad.memberIds,
                            });
                            await refetchMembers();
                          }}
                          title="Remover"
                          className="text-red-600 hover:text-red-800 p-1 opacity-0 group-hover:opacity-100"
                        >
                          <FiX />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 mb-2">
                    Nenhum membro ainda.
                  </p>
                )
              ) : (
                <p className="text-xs text-gray-400 mb-2">Carregando…</p>
              )}
            </div>

            {/* Adicionar membro */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Adicionar novo membro</h4>
              <div className="relative">
                <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
                <input
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  placeholder="Pesquisar colaborador…"
                  className="pl-10 pr-3 py-2 w-full border rounded-lg text-sm"
                />
              </div>

              {addCandidates.length ? (
                <ul className="max-h-36 overflow-y-auto space-y-1 text-sm">
                  {addCandidates.map((c: any) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between pr-1"
                    >
                      <span>{c.name}</span>
                      <button
                        onClick={async () => {
                          const res = await addMember({
                            variables: {
                              squadId: detail.id,
                              memberId: c.id,
                            },
                          });
                          /* atualiza estado detail */
                          setDetail({
                            ...detail,
                            memberIds: res.data?.addMemberToSquad.memberIds,
                          });
                          await refetchMembers();
                          setAddSearch("");
                        }}
                        title="Adicionar"
                        className="text-green-600 hover:text-green-800 p-1"
                      >
                        <FiPlus />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400">
                  {addSearch ? "Nenhum resultado." : "Todos já adicionados."}
                </p>
              )}
            </div>
          </div>
        )}
      </AppModal>
    </div>
  );
}
