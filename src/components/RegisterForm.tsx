import { useMutation } from "@apollo/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { REGISTER_MUTATION } from "../graphql/mutations/register";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [register] = useMutation(REGISTER_MUTATION);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }
    try {
      const { data } = await register({
        variables: { name, email, password }
      });
      const token = data?.register?.token;
      if (token) {
        localStorage.setItem("token", token);
        navigate("/collaborators"); // ou qualquer rota que queira redirecionar
      }
    } catch (err: any) {
      alert("Erro no registro: " + err.message);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
  <input
    type="text"
    placeholder="Nome"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
  />
  <input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
  />
  <input
    type="password"
    placeholder="Senha"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
  />
  <input
    type="password"
    placeholder="Confirmar senha"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
  />
  <button
    type="submit"
    className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
  >
    Cadastrar
  </button>
</form>
  );
}
