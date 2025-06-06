import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">Squads</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/" className="hover:text-gray-300">Início</Link>
          <Link to="/colaboradores" className="hover:text-gray-300">Colaboradores</Link>
          <Link to="/squads" className="hover:text-gray-300">Squads</Link>
          <Link to="/kanban" className="hover:text-gray-300">Kanban</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  )
}
