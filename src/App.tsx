// App.tsx
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import Collaborators from "./pages/Collaborators";
import Home from "./pages/Home";
import Kanban from "./pages/Kanban";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Squads from "./pages/Squads";
import TaskDetails from "./pages/TaskDetails";

export default function App() {
  return (
    <Routes>
      {/* públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tasks/:id" element={<TaskDetails />} />

      {/* protegidas */}
      <Route
        path="/"
        element={
          /* sem PrivateRoute */
          <Layout>
            <Home />
          </Layout>
        }
      />

      <Route
        path="/collaborators"
        element={
          <PrivateRoute>
            <Layout>
              <Collaborators />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/squads"
        element={
          <PrivateRoute>
            <Layout>
              <Squads />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/kanban"
        element={
          <PrivateRoute>
            <Layout>
              <Kanban />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
