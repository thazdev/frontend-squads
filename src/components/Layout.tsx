import { ReactNode } from 'react';
import { FiGrid, FiHome, FiLogOut, FiTrello, FiUser, FiUsers } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import berryLogo from "../assets/berryLogo2.png";

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <div className="flex items-center gap-4">
          <img src={berryLogo} alt="Logo" className="h-8" />
        </div>

        <nav className="flex gap-6 text-sm text-gray-700 font-medium items-center">
          <Link to="/" className="flex items-center gap-2 hover:text-blue-600">
            <FiHome className="text-lg" />
            Início
          </Link>
          <Link to="/collaborators" className="flex items-center gap-2 hover:text-blue-600">
            <FiUsers className="text-lg" />
            Colaboradores
          </Link>
          <Link to="/squads" className="flex items-center gap-2 hover:text-blue-600">
            <FiGrid className="text-lg" />
            Squads
          </Link>
          <Link to="/kanban" className="flex items-center gap-2 hover:text-blue-600">
            <FiTrello className="text-lg" />
            Kanban
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FiUser className="text-2xl text-gray-600" />
            <span className="text-gray-700 font-medium">Usuário</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition"
          >
            <FiLogOut />
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
