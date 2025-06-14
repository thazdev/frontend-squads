// src/App.tsx
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";

import Collaborators from "./pages/Collaborators";
import Home from "./pages/Home";
import Kanban from "./pages/Kanban";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Squads from "./pages/Squads";
import TaskDetails from "./pages/TaskDetails";

export default function App() {
  return (
    <Routes>
      {/* ---------- PÚBLICAS ---------- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tasks/:id" element={<TaskDetails />} />

      {/* ---------- PROTEGIDAS (com navbar) ---------- */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/collaborators" element={<Collaborators />} />
        <Route path="/squads" element={<Squads />} />
        <Route path="/kanban" element={<Kanban />} />
      </Route>
    </Routes>
  );
}