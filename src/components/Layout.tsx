// src/components/Layout.tsx
import { useQuery } from "@apollo/client";
import { useState } from "react";
import { FiGrid, FiHome, FiLogOut, FiTrello, FiUsers } from "react-icons/fi";
import { Link, Outlet, useNavigate } from "react-router-dom";

import berryLogo from "../assets/berryLogo2.png";
import { GET_ME } from "../graphql/queries/getMe";

export default function Layout() {
  const navigate = useNavigate();
  const { data } = useQuery(GET_ME);

  const avatar = data?.me?.user?.avatar || "/avatar-placeholder.png"; // imagem default
  const [open, setOpen] = useState(false);

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* -------- NAVBAR -------- */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        {/* logo */}
        <Link to="/" className="flex items-center">
          <img src={berryLogo} alt="Logo" className="h-8" />
        </Link>

        {/* links maiores (desktop) */}
        <nav className="hidden md:flex gap-6 text-sm text-gray-700 font-medium">
          <Link to="/" className="flex items-center gap-1 hover:text-blue-600">
            <FiHome /> Início
          </Link>
          <Link
            to="/collaborators"
            className="flex items-center gap-1 hover:text-blue-600"
          >
            <FiUsers /> Colaboradores
          </Link>
          <Link
            to="/squads"
            data-testid="nav-squads"
            className="flex items-center gap-1 hover:text-blue-600"
          >
            <FiGrid /> Squads
          </Link>
          <Link
            to="/kanban"
            className="flex items-center gap-1 hover:text-blue-600"
          >
            <FiTrello /> Kanban
          </Link>
        </nav>

        {/* avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen((p) => !p)}
            className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-blue-500 transition"
          >
            <img
              src={avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </button>

          {open && (
            <div
              onMouseLeave={() => setOpen(false)}
              className="absolute right-0 top-12 w-44 bg-white shadow-lg rounded-lg border border-gray-100 py-2 z-50"
            >
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Perfil
              </Link>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <FiLogOut /> Sair
              </button>
            </div>
          )}
        </div>
      </header>

      {/* -------- PÁGINA -------- */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
