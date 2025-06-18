import { gql, useMutation, useQuery } from "@apollo/client";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiCheck,
  FiCopy,
  FiMessageSquare,
  FiPlus,
  FiTrash,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import AppModal from "../components/AppModal";
import TaskFilter from "../components/TaskFilter";
import { UPDATE_TASK_STATUS } from "../graphql/mutations/updateTaskStatus";

dayjs.extend(relativeTime);
dayjs.locale("pt-br");

/* ────────── QUERIES & MUTATIONS ────────── */
const GET_SQUADS = gql`
  query {
    squads {
      id
      name
    }
  }
`;

const GET_TASKS = gql`
  query GetTasks($squadId: ID, $assigneeId: ID) {
    tasks(squadId: $squadId, assigneeId: $assigneeId) {
      id
      title
      description
      status
      priority
      difficulty
      impact
      createdAt
      assignee {
        id
        name
      }
    }
  }
`;

const GET_COLLABS = gql`
  query ($squadId: ID!) {
    collaborators(filter: { squadId: $squadId }) {
      id
      name
    }
  }
`;

const CREATE_TASK = gql`
  mutation ($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      status
      priority
      squadId
    }
  }
`;

const DELETE_TASK = gql`
  mutation ($id: ID!) {
    deleteTask(id: $id)
  }
`;

/* util para variáveis de filtro */
const buildVars = (squadId: string | null, assigneeId: string) => ({
  ...(squadId ? { squadId } : {}),
  ...(assigneeId ? { assigneeId } : {}),
});

/* ----------- COMPONENTE ----------- */
export default function Kanban() {
  /* squads */
  const { data: squadsData } = useQuery(GET_SQUADS);
  const squads = squadsData?.squads ?? [];

  const [activeSquadId, setActiveSquadId] = useState<string | null>(null);
  const [responsibleId, setResponsibleId] = useState("");

  /* modal nova task */
  const [open, setOpen] = useState(false);
  const [squadIdModal, setSquadIdModal] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => setSquadIdModal(activeSquadId || ""), [activeSquadId]);
  useEffect(() => {
    if (activeSquadId === null && squads.length) setActiveSquadId(squads[0].id);
  }, [squads, activeSquadId]);

  /* tasks */
  const { data: tasksData, refetch: refetchTasks } = useQuery(GET_TASKS, {
    variables: buildVars(activeSquadId, responsibleId),
    skip: squads.length === 0,
  });
  const tasks = tasksData?.tasks ?? [];

  /* colaboradores (p/ filtro e modal) */
  const { data: collabData, refetch: refetchCollabs } = useQuery(GET_COLLABS, {
    variables: { squadId: activeSquadId },
    skip: !activeSquadId,
  });
  const collaborators = collabData?.collaborators ?? [];

  /* colunas de status */
  type Status = "TODO" | "DOING" | "BLOCKED" | "CANCELED" | "DONE";
  const columnOrder: Status[] = [
    "TODO",
    "DOING",
    "BLOCKED",
    "CANCELED",
    "DONE",
  ];
  const statusLabels: Record<Status, string> = {
    TODO: "A Fazer",
    DOING: "Em Andamento",
    BLOCKED: "Bloqueado",
    CANCELED: "Cancelado",
    DONE: "Finalizado",
  };
  const columns: Record<Status, any[]> = {
    TODO: [],
    DOING: [],
    BLOCKED: [],
    CANCELED: [],
    DONE: [],
  };
  tasks.forEach((t) => columns[t.status as Status]?.push(t));

  /* mutations */
  const [createTask, { loading: creating }] = useMutation(CREATE_TASK, {
    onError: (e) => setErr(e.message),
    onCompleted: () => {
      setErr("");
      refetchTasks();
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setAssigneeId("");
      setOpen(false);
    },
  });

  const [mutateStatus] = useMutation(UPDATE_TASK_STATUS, {
    optimisticResponse: ({ id, status }: { id: string; status: Status }) => ({
      updateTask: { __typename: "Task", id, status },
    }),
    update(cache, { data }) {
      const upd = data?.updateTask;
      if (upd)
        cache.modify({
          id: cache.identify({ __typename: "Task", id: upd.id }),
          fields: { status: () => upd.status },
        });
    },
  });

  const [deleteTask] = useMutation(DELETE_TASK, {
    onCompleted: () => refetchTasks(buildVars(activeSquadId, responsibleId)),
  });

  function changeStatus(id: string, status: Status) {
    mutateStatus({ variables: { input: { id, status } } }).then(() =>
      setTimeout(
        () => refetchTasks(buildVars(activeSquadId, responsibleId)),
        300
      )
    );
  }

  useEffect(() => {
    if (activeSquadId) {
      refetchCollabs({ squadId: activeSquadId });
      setResponsibleId("");
    }
  }, [activeSquadId]);

  /* ---------- cores tags ---------- */
  const priorityColors = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-red-100 text-red-700",
  };
  const scaleColors = [
    "",
    "bg-purple-100 text-purple-700",
    "bg-purple-200 text-purple-700",
    "bg-purple-300 text-purple-800",
    "bg-purple-400 text-white",
    "bg-purple-600 text-white",
  ];
  const impactColors = [
    "",
    "bg-emerald-100 text-emerald-700",
    "bg-emerald-200 text-emerald-700",
    "bg-emerald-300 text-emerald-800",
    "bg-emerald-400 text-white",
    "bg-emerald-600 text-white",
  ];

  /* ---------- JSX ---------- */
  return (
    <div className="space-y-8">
      {/* topo */}
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
              refetchTasks(buildVars(squadId, responsibleId));
            }}
          />

          <button
            data-testid="open-create-task"
            onClick={() => {
              setSquadIdModal(activeSquadId || "");
              setOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow"
          >
            <FiPlus className="text-sm" /> Nova Task
          </button>
        </div>
      </div>

      {/* colunas */}
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
        {columnOrder.map((col) => (
          <section key={col}>
            <h3 className="font-semibold mb-3 text-gray-700">
              {statusLabels[col]}
            </h3>

            <div className="space-y-3 min-h-[60px]">
              {columns[col].map((t) => (
                <Link
                  to={`/tasks/${t.id}`}
                  key={t.id}
                  data-testid={`kanban-task-${t.title}`}
                  className="block"
                >
                  <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col p-4 space-y-3 max-w-[260px] w-full">
                    <h4
                      data-testid="kanban-task-title"
                      className="font-medium text-sm text-gray-900 line-clamp-2"
                    >
                      {t.title}
                    </h4>

                    {t.description && (
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {t.description}
                      </p>
                    )}

                    <p className="text-[10px] text-gray-400">
                      Criado: {t.creatorName ?? t.assignee?.name ?? "Sistema"} •{" "}
                      {dayjs(t.createdAt).fromNow()}
                    </p>

                    {/* chips */}
                    <div className="flex flex-wrap gap-1">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          priorityColors[t.priority]
                        }`}
                      >
                        {t.priority}
                      </span>

                      {t.difficulty > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            scaleColors[t.difficulty]
                          }`}
                        >
                          D&nbsp;{t.difficulty}
                        </span>
                      )}

                      {t.impact > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            impactColors[t.impact]
                          }`}
                        >
                          I&nbsp;{t.impact}
                        </span>
                      )}
                    </div>

                    {/* ações */}
                    <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-gray-500">
                        <button
                          title="Concluir"
                          onClick={() => changeStatus(t.id, "DONE")}
                          className="hover:text-gray-700"
                        >
                          <FiCheck size={14} />
                        </button>
                        <button
                          title="Chat / Anotações"
                          className="hover:text-gray-700"
                        >
                          <FiMessageSquare size={14} />
                        </button>
                        <button
                          title="Definir prazo"
                          className="hover:text-gray-700"
                        >
                          <FiCalendar size={14} />
                        </button>
                        <button
                          title="Copiar link"
                          className="hover:text-gray-700"
                        >
                          <FiCopy size={14} />
                        </button>
                        <button
                          title="Excluir task"
                          className="hover:text-red-600"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(t.id);
                          }}
                        >
                          <FiTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}

              {columns[col].length === 0 && (
                <p className="text-xs text-gray-400">—</p>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* modal Nova Task */}
      <AppModal
        data-testid="open-create-task"
        title="Nova Task"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="space-y-5">
          {/* Squad */}
          <div>
            <label className="text-sm font-medium text-gray-700">Squad *</label>
            <select
              data-testid="task-squad"
              value={squadIdModal}
              onChange={(e) => setSquadIdModal(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
            >
              {squads.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Título *
            </label>
            <input
              data-testid="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Descrição
            </label>
            <textarea
              data-testid="task-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 resize-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Prioridade */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Prioridade
            </label>
            <select
              data-testid="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
            </select>
          </div>

          {/* Responsável */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Responsável
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
            >
              <option value="">—</option>
              {collaborators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <footer className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setOpen(false)}
              className="px-5 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              data-testid="save-task"
              onClick={() =>
                createTask({
                  variables: {
                    input: {
                      title: title.trim(),
                      description: description.trim(),
                      priority,
                      squadId: squadIdModal,
                      assigneeId: assigneeId || null,
                    },
                  },
                })
              }
              disabled={!title.trim() || creating}
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
