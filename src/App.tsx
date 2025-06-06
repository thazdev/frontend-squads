import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Collaborators from './pages/Collaborators'
import Home from './pages/Home'
import Kanban from './pages/Kanban'
import Squads from './pages/Squads'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collaborators" element={<Collaborators />} />
        <Route path="/squads" element={<Squads />} />
        <Route path="/kanban" element={<Kanban />} />
      </Routes>
    </BrowserRouter>
  )
}
