export default function Home() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Bem-vindo à Plataforma</h2>
      <p className="text-gray-600">Use o menu acima para navegar entre colaboradores, squads e o kanban.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Resumo de Tarefas</h3>
          <p className="text-gray-500">Nenhuma tarefa atribuída ainda.</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Atividade Recente</h3>
          <p className="text-gray-500">Sem atividades recentes.</p>
        </div>
      </div>
    </div>
  )
}
