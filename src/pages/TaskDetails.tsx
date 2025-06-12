import { useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { UPDATE_TASK_STATUS } from "../graphql/mutations/updateTaskStatus";
import { GET_TASK } from "../graphql/queries/getTasks";

const priorityColors: Record<string, string> = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
};
const difficultyColors = Array(5).fill("bg-purple-100 text-purple-700");
const impactColors = Array(5).fill("bg-emerald-100 text-emerald-700");

/* possíveis status */
type Status = "TODO" | "DOING" | "BLOCKED" | "CANCELED" | "DONE";
const statusLabels: Record<Status, string> = {
  TODO: "A FAZER",
  DOING: "EM ANDAMENTO",
  BLOCKED: "BLOQUEADO",
  CANCELED: "CANCELADO",
  DONE: "FINALIZADO",
};

export default function TaskDetails() {
  const { id = "" } = useParams();
  const nav = useNavigate();

  const { data, loading, error } = useQuery(GET_TASK, {
    variables: { id },
    skip: !id,
  });
  const task = data?.task;

  /* update apenas status */
  const [updateStatus] = useMutation(UPDATE_TASK_STATUS, {
    update(cache, { data }) {
      const upd = data?.updateTask;
      if (!upd) return;
      cache.modify({
        id: cache.identify({ __typename: "Task", id: upd.id }),
        fields: { status: () => upd.status },
      });
    },
  });

  /* update demais campos */
  const [updateTaskField] = useMutation(UPDATE_TASK_STATUS, {
    update(cache, { data }) {
      const upd = data?.updateTask;
      if (!upd) return;
      cache.modify({
        id: cache.identify({ __typename: "Task", id: upd.id }),
        fields: {
          priority: () => upd.priority,
          difficulty: () => upd.difficulty,
          impact: () => upd.impact,
        },
      });
    },
  });

  if (loading) return <p className="p-4">Carregando…</p>;
  if (error) return <p className="p-4 text-red-600">{error.message}</p>;
  if (!task) return <p className="p-4">Task não encontrada.</p>;

  const difficultyLabel = (n?: number) => (n ? `Dificuldade ${n}` : "—");
  const impactLabel = (n?: number) => (n ? `Impacto ${n}` : "—");

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Aside */}
      <aside className="w-[280px] bg-white border-r border-gray-200 px-6 py-8 overflow-y-auto">
        <button
          onClick={() => nav(-1)}
          className="mb-6 text-sm text-blue-600 hover:underline"
        >
          ← Voltar
        </button>

        <h1 className="text-xl font-semibold mb-6 text-gray-900">
          {task.title}
        </h1>

        {/* STATUS */}
        <div className="space-y-1 mb-4">
          <label className="block text-xs font-medium text-gray-500">
            Status
          </label>
          <select
            value={task.status}
            onChange={(e) =>
              updateStatus({
                variables: {
                  input: { id: task.id, status: e.target.value as Status },
                },
              })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
          >
            {(Object.keys(statusLabels) as Status[]).map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </div>

        {/* PRIORIDADE */}
        <div className="space-y-1 mb-4">
          <label className="block text-xs font-medium text-gray-500">
            Prioridade
          </label>
          <select
            value={task.priority}
            onChange={(e) =>
              updateTaskField({
                variables: { input: { id: task.id, priority: e.target.value } },
              })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 capitalize"
          >
            {["LOW", "MEDIUM", "HIGH"].map((p) => (
              <option key={p} value={p}>
                {p === "LOW" ? "Baixa" : p === "MEDIUM" ? "Média" : "Alta"}
              </option>
            ))}
          </select>
          <span
            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs capitalize ${
              priorityColors[task.priority]
            }`}
          >
            {task.priority === "LOW"
              ? "Baixa"
              : task.priority === "MEDIUM"
              ? "Média"
              : "Alta"}
          </span>
        </div>

        {/* DIFICULDADE */}
        <div className="space-y-1 mb-4">
          <label className="block text-xs font-medium text-gray-500">
            Dificuldade
          </label>
          <select
            value={task.difficulty ?? 0}
            onChange={(e) => {
              const val = Number(e.target.value);
              updateTaskField({
                variables: {
                  input: { id: task.id, difficulty: val || undefined },
                },
              });
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
          >
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "—" : `Dificuldade ${n}`}
              </option>
            ))}
          </select>
          {task.difficulty ? (
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                difficultyColors[task.difficulty - 1]
              }`}
            >
              {difficultyLabel(task.difficulty)}
            </span>
          ) : null}
        </div>

        {/* IMPACTO */}
        <div className="space-y-1 mb-6">
          <label className="block text-xs font-medium text-gray-500">
            Impacto
          </label>
          <select
            value={task.impact ?? 0}
            onChange={(e) => {
              const val = Number(e.target.value);
              updateTaskField({
                variables: { input: { id: task.id, impact: val || undefined } },
              });
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
          >
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "—" : `Impacto ${n}`}
              </option>
            ))}
          </select>
          {task.impact ? (
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                impactColors[task.impact - 1]
              }`}
            >
              {impactLabel(task.impact)}
            </span>
          ) : null}
        </div>

        {/* Datas */}
        <div className="text-xs text-gray-400 space-y-0.5">
          <p>Criada em {new Date(task.createdAt).toLocaleString("pt-BR")}</p>
          <p>
            Atualizada em {new Date(task.updatedAt).toLocaleString("pt-BR")}
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-white text-gray-800 flex flex-col">
        <div className="flex gap-4 border-b border-gray-200 px-8 pt-6">
          <button className="pb-2 border-b-2 border-purple-600 text-sm font-medium text-gray-900">
            Anotações
          </button>
        </div>

        <div className="flex-1 flex items-start justify-center py-10 overflow-y-auto">
          <div className="max-w-lg w-full bg-gray-100 border border-gray-200 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {task.description || "— sem descrição —"}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
