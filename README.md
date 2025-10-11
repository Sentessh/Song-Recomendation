<div align="center">
  <h1>Song-Recomendation</h1>
  <p>“Spotify-like” dashboard to explore the <strong>Top 100 Hits Songs of 2025</strong> dataset (Kaggle/YouTube).</p>
  <p><em>Frontend</em>: React + Vite + Tailwind v3 + Recharts • <em>Backend</em>: FastAPI + pandas</p>
</div>

<hr>

<p><strong>Fields used:</strong> <code>track_name</code> (from <code>title</code>), <code>artist</code> (from <code>channel</code>), <code>genre</code> (from <code>categories</code>), <code>popularity</code> (normalized from <code>view_count</code>), <code>duration_ms</code> (from <code>duration</code>/<code>duration_string</code>).<br>
<strong>Note:</strong> this YouTube-style dataset does <em>not</em> include Spotify audio features (energy/danceability).</p>

<h2>Features</h2>
<ul>
  <li>Dark UI with <strong>Spotify-like</strong> theme (Tailwind v3 + Poppins).</li>
  <li>Charts: <strong>Top 10 Artists</strong> and <strong>Top 10 Genres</strong> (Recharts).</li>
  <li>Filters by <strong>Genre</strong> and <strong>Artist</strong> + a paged table (50 items at a time).</li>
  <li>FastAPI endpoints for health, metadata, lists, and correlation.</li>
  <li>Robust CSV handling (column normalization, duration parsing, <code>NaN</code> → <code>null</code>).</li>
</ul>

<h2>Structure</h2>
<pre><code>Song-Recomendation/
├─ data/
│  └─ top100_2025.csv
├─ backend/
│  └─ app.py
└─ frontend/
   ├─ src/App.jsx
   ├─ src/index.css
   ├─ vite.config.js
   └─ tailwind.config.js
</code></pre>

<h2>Prerequisites</h2>
<ul>
  <li><strong>Python</strong> 3.12+ (3.13 OK)</li>
  <li><strong>Node.js</strong> 18+ (LTS/20/22)</li>
  <li><strong>npm</strong> 9+</li>
</ul>

<h2>Run locally (dev)</h2>

<h3>1) Backend (FastAPI)</h3>
<pre><code>cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn[standard] pandas
uvicorn app:app --reload
</code></pre>
<strong>CSV:</strong> place <code>data/top100_2025.csv</code> at the project root (outside backend/frontend). The backend reads it automatically.</p>

<h3>2) Frontend (React + Vite + Tailwind v3)</h3>
<pre><code>cd frontend
npm install
npm run dev
</code></pre>

<p><strong>API base URL</strong> (already set for dev) in <code>src/App.jsx</code>:</p>
<pre><code>const API = "http://127.0.0.1:8000";</code></pre>

<p><em>Optional (avoid CORS):</em> use Vite proxy in <code>vite.config.js</code>:</p>
<pre><code>server: { proxy: { '/api': 'http://127.0.0.1:8000' } }</code></pre>
<p>…and in <code>App.jsx</code>:</p>
<pre><code>const API = ""; // use proxy (axios.get('/api/top-artists?...'))</code></pre>
<p><em>Remember to restart</em> <code>npm run dev</code> after changing the proxy.</p>

<h2>API Endpoints</h2>
<ul>
  <li><code>GET /api/health</code> → status and row/column counts</li>
  <li><code>GET /api/meta</code> → column list</li>
  <li><code>GET /api/top-artists?limit=10</code> → <code>{ artist: count }</code></li>
  <li><code>GET /api/top-genres?limit=10</code> → <code>{ genre: count }</code></li>
  <li><code>GET /api/tracks?genre=&amp;artist=&amp;limit=100</code> → filtered records</li>
  <li><code>GET /api/correlation</code> → numeric correlation (if available)</li>
  <li><code>GET /api/debug</code> (dev) → sample of the final mapping</li>
</ul>
<p><strong>Production:</strong> remove <code>/api/debug</code> and restrict CORS to your frontend origin.</p>

<h2>License & Credits</h2>
<ul>
  <li><strong>Data:</strong> public domain. Dataset creator: Mubeen Shehzadi.</li>
</ul>