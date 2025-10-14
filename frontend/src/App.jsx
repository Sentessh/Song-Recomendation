import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Estatisticas from "./pages/Estatisticas";

const linkBase =
  "px-3 py-2 rounded-lg text-sm font-medium transition hover:opacity-80";
const active =
  "bg-spotify-green text-black";
const inactive =
  "text-white/80";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar simples */}
      <nav className="w-full sticky top-0 z-20 bg-black/70 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="text-lg font-semibold">🎧 Song Dashboard</div>
          <div className="flex items-center gap-2 ml-auto">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/estatisticas"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : inactive}`
              }
            >
              Estatísticas
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Rotas */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estatisticas" element={<Estatisticas />} />
      </Routes>
    </div>
  );
}