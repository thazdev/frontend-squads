export default function Kanban() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Quadro Kanban</h2>
      <p className="text-gray-600">Organize as tarefas das squads em colunas.</p>

      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-gray-500">O quadro ainda está vazio.</p>
      </div>
    </div>
  )
}
