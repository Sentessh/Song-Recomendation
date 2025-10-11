import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const API = "http://127.0.0.1:8000";

function Card({ title, children }) {
  return (
    <div className="bg-spotify-dark rounded-2xl p-6 shadow-lg border border-white/5">
      <h2 className="text-xl font-semibold text-spotify-green mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [topArtists, setTopArtists] = useState([]);
  const [topGenres, setTopGenres] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [selectedArtist, setSelectedArtist] = useState("Todos");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [a, g, t] = await Promise.all([
          axios.get(`${API}/api/top-artists?limit=10`),
          axios.get(`${API}/api/top-genres?limit=10`),
          axios.get(`${API}/api/tracks?limit=1000`),
        ]);

        const artistsArr = Object.entries(a.data.top_artists || {}).map(([name, value]) => ({ name, value }));
        const genresArr = Object.entries(g.data.top_genres || {}).map(([name, value]) => ({ name, value }));

        setTopArtists(artistsArr);
        setTopGenres(genresArr);
        setTracks(t.data.data || []);
        setError("");
      } catch (e) {
        console.error("API error:", e);
        setError("Não foi possível carregar dados da API. Verifique se o backend está rodando em 127.0.0.1:8000.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const genres = useMemo(
    () => ["Todos", ...Array.from(new Set(tracks.map(t => t.genre).filter(Boolean))).sort()],
    [tracks]
  );
  const artists = useMemo(
    () => ["Todos", ...Array.from(new Set(tracks.map(t => t.artist).filter(Boolean))).sort()],
    [tracks]
  );

  const filtered = useMemo(() => {
    return tracks.filter(t => {
      const okG = selectedGenre === "Todos" || (t.genre && t.genre.toLowerCase() === selectedGenre.toLowerCase());
      const okA = selectedArtist === "Todos" || (t.artist && t.artist.toLowerCase() === selectedArtist.toLowerCase());
      return okG && okA;
    });
  }, [tracks, selectedGenre, selectedArtist]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-spotify-black to-spotify-dark">
      <header className="sticky top-0 z-10 bg-spotify-green text-black py-5 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold">🎧 Top 100 Hits 2025 Dashboard</h1>
          <span className="text-sm opacity-80">by Bernardo</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-white/70">Carregando dados…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="🏆 Top 10 Artistas">
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topArtists}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
                      <XAxis dataKey="name" stroke="#ffffff" />
                      <YAxis stroke="#ffffff" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1DB954" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="🎼 Top 10 Gêneros">
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topGenres}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
                      <XAxis dataKey="name" stroke="#ffffff" />
                      <YAxis stroke="#ffffff" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1ED760" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
            <Card title="🔎 Filtrar faixas">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <select
                  className="bg-spotify-black border border-white/10 rounded-lg px-3 py-2"
                  value={selectedGenre}
                  onChange={e => setSelectedGenre(e.target.value)}
                >
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>

                <select
                  className="bg-spotify-black border border-white/10 rounded-lg px-3 py-2"
                  value={selectedArtist}
                  onChange={e => setSelectedArtist(e.target.value)}
                >
                  {artists.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-white/10">
                      <th className="py-2 pr-4">Música</th>
                      <th className="py-2 pr-4">Artista</th>
                      <th className="py-2 pr-4">Gênero</th>
                      <th className="py-2 pr-4">Popularity</th>
                      <th className="py-2 pr-4">Duração (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 50).map((t, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-2 pr-4">{t.track_name ?? "—"}</td>
                        <td className="py-2 pr-4">{t.artist ?? "—"}</td>
                        <td className="py-2 pr-4">{t.genre ?? "—"}</td>
                        <td className="py-2 pr-4">{t.popularity ?? "—"}</td>
                        <td className="py-2 pr-4">
                          {t.duration_ms ? (t.duration_ms / 1000 / 60).toFixed(2) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-xs text-white/60 mt-2">
                  Exibindo {Math.min(filtered.length, 50)} de {filtered.length} faixas.
                </div>
              </div>
            </Card> 
          </>
        )}
      </main>
    </div>
  );
}