import { gql, useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import TaskFilter from "../components/TaskFilter";
import { UPDATE_TASK_STATUS } from "../graphql/mutations/updateTaskStatus";

/* ──────────── QUERIES & MUTATIONS ──────────── */
const GET_SQUADS = gql`query { squads { id name } }`;

const GET_TASKS = gql`
  query ($squadId: ID!, $assigneeId: ID) {
    tasks(squadId: $squadId, assigneeId: $assigneeId) {
      id
      title
      status
      priority
      assignee { id name }
    }
  }
`;

const GET_COLLABS = gql`
  query ($squadId: ID!) {
    collaborators(filter: { squadId: $squadId }) { id name }
  }
`;

const CREATE_TASK = gql`
  mutation ($input: CreateTaskInput!) {
    createTask(input: $input) {
      id title status priority squadId
    }
  }
`;

/* ──────────── COMPONENT ──────────── */
export default function Kanban() {
  /* squads */
  const { data: squadsData } = useQuery(GET_SQUADS);
  const squads = squadsData?.squads ?? [];
  const [activeSquadId, setActiveSquadId] = useState("");
  useEffect(() => {
    if (!activeSquadId && squads.length) setActiveSquadId(squads[0].id);
  }, [squads, activeSquadId]);

  /* filters */
  const [responsibleId, setResponsibleId] = useState("");

  /* tasks */
  const { data: tasksData, refetch: refetchTasks } = useQuery(GET_TASKS, {
    variables: { squadId: activeSquadId, assigneeId: responsibleId || null },
    skip: !activeSquadId,
  });
  const tasks = tasksData?.tasks ?? [];

  /* collaborators */
  const { data: collabData, refetch: refetchCollabs } = useQuery(GET_COLLABS, {
    variables: { squadId: activeSquadId },
    skip: !activeSquadId,
  });
  const collaborators = collabData?.collaborators ?? [];

  /* distribui em colunas */
  const columns = { TODO: [], DOING: [], DONE: [] } as Record<string, any[]>;
  tasks.forEach((t) => columns[t.status].push(t));

  /* modal state */
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");
  const [err, setErr] = useState("");

  /* create */
  const [createTask, { loading }] = useMutation(CREATE_TASK, {
    onError: (e) => setErr(e.message),
    onCompleted: () => {
      setErr("");
      refetchTasks();
      setTitle(""); setDescription(""); setPriority("MEDIUM"); setAssigneeId("");
      setOpen(false);
    },
  });

  /* update status */
  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS, {
    optimisticResponse: ({ id, status }) => ({
      updateTask: { __typename: "Task", id, status },
    }),
    update(cache, { data }) {
      if (!data?.updateTask) return;
      const { id, status } = data.updateTask;
      cache.modify({
        id: cache.identify({ __typename: "Task", id }),
        fields: { status: () => status },
      });
    },
    refetchQueries: (_res, _args) => [
      { query: GET_TASKS, variables: { squadId: activeSquadId, assigneeId: responsibleId || null } }
    ],
    awaitRefetchQueries: true,
  });

  /* trocou de squad => reseta filtros  */
  useEffect(() => {
    if (activeSquadId) {
      refetchCollabs({ squadId: activeSquadId });
      setResponsibleId("");
    }
  }, [activeSquadId]);

  /* salva nova task */
  const handleSave = () =>
    createTask({
      variables: {
        input: {
          title: title.trim(),
          description: description.trim(),
          priority,
          squadId: activeSquadId,
          assigneeId: assigneeId || null,
        },
      },
    });

  /* ──────────── RENDER ──────────── */
  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex items-center gap-4 flex-wrap">
        <h2 className="text-2xl font-semibold">Quadro Kanban</h2>

        <div className="flex items-center gap-3 ml-auto">
          <TaskFilter
            squads={squads}
            collaborators={collaborators}
            squadId={activeSquadId}
            responsibleId={responsibleId}
            onChange={({ squadId, responsibleId }) => {
              setActiveSquadId(squadId);
              setResponsibleId(responsibleId);
              refetchTasks({ squadId, assigneeId: responsibleId || null });
            }}
          />
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow"
          >
            <FiPlus className="text-sm" /> Nova Task
          </button>
        </div>
      </div>

      {/* columns */}
      <div className="grid md:grid-cols-3 gap-6">
        {["TODO", "DOING", "DONE"].map((col) => (
          <section key={col}>
            <h3 className="font-semibold mb-3 text-gray-700">
              {col === "TODO" ? "A Fazer" :
               col === "DOING" ? "Em Progresso" : "Concluído"}
            </h3>
            <div className="space-y-3 min-h-[60px]">
              {columns[col].map((t) => (
                <article
                  key={`${t.id}-${t.status}`}
                  className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 flex justify-between items-start"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-800">{t.title}</p>
                    <span className="text-xs text-gray-500">
                      {t.assignee ? t.assignee.name : "—"} • {t.priority}
                    </span>
                  </div>

                  <select
                    value={t.status}
                    onChange={(e) =>
                      updateTaskStatus({
                        variables: { id: t.id, status: e.target.value },
                        optimisticResponse: {
                          updateTask: {
                            __typename: "Task",
                            id: t.id,
                            status: e.target.value,
                          },
                        },
                      })
                    }
                    className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-gray-50"
                  >
                    <option value="TODO">A FAZER</option>
                    <option value="DOING">EM PROGRESSO</option>
                    <option value="DONE">CONCLUÍDO</option>
                  </select>
                </article>
              ))}
              {columns[col].length === 0 && (
                <p className="text-xs text-gray-400">—</p>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* modal */}
      {open && (
        <div
          className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full max-w-xl rounded-2xl shadow-md animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Nova Task</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </header>

            <div className="px-7 py-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700">Squad *</label>
                <select
                  value={activeSquadId}
                  onChange={(e) => setActiveSquadId(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-400/50"
                >
                  <option value="">Selecione…</option>
                  {squads.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Título *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Responsável</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  disabled={collaborators.length === 0}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 disabled:bg-gray-100"
                >
                  <option value=""></option>
                  {collaborators.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Prioridade</label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")
                  }
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <footer className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setOpen(false)}
                  className="px-5 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim() || !activeSquadId || loading}
                  className="px-6 py-2 rounded-lg bg-blue-500/90 hover:bg-blue-500 text-white font-medium disabled:opacity-50"
                >
                  {loading ? "Salvando…" : "Salvar"}
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
