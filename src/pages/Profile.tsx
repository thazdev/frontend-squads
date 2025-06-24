// src/pages/Profile.tsx
import { useMutation, useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import { useState } from "react";
import { FiCamera, FiUsers } from "react-icons/fi";
import { Navigate } from "react-router-dom";

import { UPDATE_USER } from "../graphql/mutations/updateUser";
import { UPLOAD_AVATAR } from "../graphql/mutations/uploadAvatar";
import { GET_ME } from "../graphql/queries/getMe";

export default function Profile() {
  /* ---------- data ---------- */
  const { data, loading, error, refetch } = useQuery(GET_ME);
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  /* ---------- mutations ---------- */
  const [updateUser, { loading: saving }] = useMutation(UPDATE_USER);
  const [uploadAvatar] = useMutation(UPLOAD_AVATAR);

  if (loading) return <p className="mt-10 text-center">Carregando…</p>;
  if (error)
    return <p className="mt-10 text-center text-red-600">{error.message}</p>;
  if (!data?.me) return <Navigate to="/login" replace />;

  const { user, squads, tasksOverall } = data.me;

  async function handleSave() {
    await updateUser({ variables: { input: { name, bio } } });
    setEdit(false);
    refetch();
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);

    // 1) sobe a imagem
    const resp = await fetch("http://localhost:4000/upload-avatar", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: fd,
    });
    const { url } = await resp.json();

    // 2) grava a URL no GraphQL
    await updateUser({ variables: { input: { avatar: url } } });
    refetch();
  }

  const fade = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.main
      initial="hidden"
      animate="show"
      variants={fade}
      className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-white via-slate-50 to-slate-100/60 py-10 px-4 sm:px-8"
    >
      <div className="mx-auto max-w-4xl space-y-12">
        {/* ---------- Header ---------- */}
        <div className="flex flex-col items-center gap-6">
          {/* avatar upload */}
          <label className="relative cursor-pointer group">
            <img
              src={user.avatar || "/avatar-placeholder.png"}
              alt="avatar"
              className="w-32 h-32 rounded-full object-cover shadow-lg ring-4 ring-white/70 group-hover:ring-blue-500 transition"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatar}
              hidden
            />
            <span className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-md group-hover:scale-105 transition">
              <FiCamera className="text-lg" />
            </span>
          </label>

          {/* name / bio */}
          {edit ? (
            <div className="w-full max-w-md space-y-4 text-center">
              <input
                value={name}
                placeholder={user.name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500"
              />
              <textarea
                value={bio}
                placeholder={user.bio ?? "Tell us about you…"}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 resize-none"
              />
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setEdit(false)}
                  className="px-5 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition"
                >
                  {saving ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-3xl font-semibold text-gray-800">
                {user.name}
              </h1>
              {user.bio && (
                <p className="mt-1 text-gray-600 max-w-prose mx-auto">
                  {user.bio}
                </p>
              )}
              <button
                data-testid="edit-profile"
                onClick={() => {
                  setName(user.name);
                  setBio(user.bio ?? "");
                  setEdit(true);
                }}
                className="mt-3 text-sm text-blue-600 hover:underline"
              >
                Editar Perfil
              </button>
            </div>
          )}
        </div>

        {/* ---------- Stats ---------- */}
        <motion.section variants={fade} className="grid sm:grid-cols-3 gap-6">
          {[
            { label: "Total Tasks", value: tasksOverall.total },
            { label: "Pending", value: tasksOverall.pending },
            { label: "Completed", value: tasksOverall.done },
          ].map((s) => (
            <motion.div
              key={s.label}
              whileHover={{ scale: 1.05 }}
              className="rounded-2xl bg-white shadow-lg p-6 text-center"
            >
              <p className="text-3xl font-extrabold text-gray-800">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* ---------- Squads ---------- */}
        <motion.section variants={fade} className="space-y-3">
          <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            <FiUsers /> Squads
          </h3>

          {squads.length ? (
            <ul className="grid sm:grid-cols-2 gap-4">
              {squads.map((s: any) => (
                <motion.li
                  key={s.id}
                  whileHover={{ y: -2 }}
                  className="border border-gray-200 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
                >
                  {s.name}
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              Você ainda não faz parte de nenhum squad.
            </p>
          )}
        </motion.section>
      </div>
    </motion.main>
  );
}
