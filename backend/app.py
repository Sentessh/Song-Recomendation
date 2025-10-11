from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from pathlib import Path
import pandas as pd
import numpy as np
import re

app = FastAPI(title="Top 100 Songs 2025 API", version="1.3.0")

# CORS (dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "youtube-top-100-songs-2025.csv"

def norm_cols(df: pd.DataFrame) -> pd.DataFrame:
    def n(c: str) -> str:
        c = c.strip().lower()
        c = re.sub(r"\s+", "_", c)
        c = re.sub(r"[^a-z0-9_]+", "_", c)
        c = re.sub(r"_+", "_", c).strip("_")
        return c
    df.columns = [n(c) for c in df.columns]
    return df

def find_col(df: pd.DataFrame, patterns: list[str]) -> str | None:
    cols = list(df.columns)
    for p in patterns:
        rx = re.compile(p, flags=re.I)
        for c in cols:
            if rx.search(c):
                return c
    return None

def to_num(s: pd.Series) -> pd.Series:
    if s.dtype == "O":
        s = s.astype(str).str.replace(",", "", regex=False).str.replace("%", "", regex=False)
    return pd.to_numeric(s, errors="coerce")

def split_first_artist(x) -> str | None:
    if x is None:
        return None
    s = str(x)
    s = re.split(r"(,|/|&|feat\.|ft\.)", s, flags=re.I)[0]
    s = s.strip()
    return s or None

def parse_duration_ms(x) -> float | None:
    try:
        if x is None:
            return None
        s = str(x).strip()
        if not s or s.lower() == "nan":
            return None
        if ":" in s:
            parts = s.split(":")
            if len(parts) == 3:
                h, m, s2 = parts
                return (int(h)*3600 + int(m)*60 + float(s2))*1000
            m, s2 = parts
            return (int(m)*60 + float(s2))*1000
        v = float(s)  # pode ser segundos/minutos/ms
        return v
    except Exception:
        return None

#carga
def load_df() -> pd.DataFrame:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"CSV não encontrado: {DATA_PATH}")
    try:
        df = pd.read_csv(DATA_PATH)
    except UnicodeDecodeError:
        df = pd.read_csv(DATA_PATH, encoding="latin-1")
    df.dropna(how="all", inplace=True)
    df = norm_cols(df)

    # track_name: title/fulltitle/name/track
    track = find_col(df, [r"\btitle\b", r"\btrack\b", r"\bsong\b", r"^name$"])
    if track and "track_name" not in df.columns:
        df["track_name"] = df[track].astype(str)
    elif "track_name" not in df.columns and len(df.columns):
        df["track_name"] = df.iloc[:, 0].astype(str)

    # artist: prefer artist* senão channel
    artist_col = find_col(df, [r"\bartist", r"^channel$"])
    if artist_col:
        df["artist"] = df[artist_col].astype(str).apply(split_first_artist)

    # genre: genre/genres/category/categories
    genre_col = find_col(df, [r"\bgenre", r"categories?", r"style"])
    if genre_col:
        df["genre"] = df[genre_col].astype(str)

    # popularity: prioridade popularity -> view_count/views -> streams/listens/plays -> rank/score
    pop_col = find_col(df, [r"\bpopularity\b", r"popularity_score"])
    views_col = find_col(df, [r"\bview_count\b", r"\bviews?\b"])
    streams_col = find_col(df, [r"\bstreams?\b", r"\blistens?\b", r"\bplays?\b"])
    rank_col = find_col(df, [r"\brank\b"])
    score_col = find_col(df, [r"\bscore\b"])

    if pop_col:
        df["popularity"] = to_num(df[pop_col])
    elif views_col:
        s = to_num(df[views_col])
        if s.notna().any():
            rng = s.max() - s.min()
            df["popularity"] = ((s - s.min()) / (rng if rng else 1) * 100).round(2)
    elif streams_col:
        s = to_num(df[streams_col])
        if s.notna().any():
            rng = s.max() - s.min()
            df["popularity"] = ((s - s.min()) / (rng if rng else 1) * 100).round(2)
    elif rank_col:
        r = to_num(df[rank_col])
        if r.notna().any():
            df["popularity"] = ((r.max() - r) / (r.max() - r.min() + 1e-9) * 100).round(2)
    elif score_col:
        df["popularity"] = to_num(df[score_col])

    dur_str = find_col(df, [r"duration_string"])
    dur_col = find_col(df, [r"\bduration\b", r"length", r"duration_ms", r"length_ms", r"\btime\b"])

    if dur_str:
        df["duration_ms"] = df[dur_str].apply(parse_duration_ms)
    elif dur_col:
        series = df[dur_col]
        if series.dtype == "O":
            df["duration_ms"] = series.apply(parse_duration_ms)
        else:
            num = to_num(series)
            med = num.dropna().median() if num.notna().any() else None
            if med is not None and med <= 600:
                df["duration_ms"] = num * 1000
            elif med is not None and med <= 100:
                df["duration_ms"] = num * 60_000
            else:
                df["duration_ms"] = num

    df.replace({np.nan: None}, inplace=True)
    return df

df = load_df()
print(f"[API] CSV: {DATA_PATH} | rows={len(df)} | cols={list(df.columns)}")

#endpoints
@app.get("/api/health")
def health():
    return {"status": "ok", "rows": int(len(df)), "columns": list(df.columns)}

@app.get("/api/meta")
def meta():
    return {"columns": list(df.columns)}

@app.get("/api/top-artists")
def top_artists(limit: int = 10):
    if "artist" not in df.columns:
        return {"top_artists": {}}
    s = pd.Series(df["artist"], dtype="object").dropna()
    vc = s.astype(str).value_counts().head(limit)
    data = {str(k): int(v) for k, v in vc.items()}
    return {"top_artists": jsonable_encoder(data)}

@app.get("/api/top-genres")
def top_genres(limit: int = 10):
    if "genre" not in df.columns:
        return {"top_genres": {}}
    s = pd.Series(df["genre"], dtype="object").dropna()
    vc = s.astype(str).value_counts().head(limit)
    data = {str(k): int(v) for k, v in vc.items()}
    return {"top_genres": jsonable_encoder(data)}

@app.get("/api/tracks")
def tracks(genre: str | None = None, artist: str | None = None, limit: int = 100):
    sub = df.copy()
    if genre and "genre" in sub.columns:
        sub = sub[sub["genre"].astype(str).str.lower() == genre.lower()]
    if artist and "artist" in sub.columns:
        sub = sub[sub["artist"].astype(str).str.lower() == artist.lower()]

    wanted = ["track_name","artist","genre","popularity","energy","danceability","duration_ms"]
    for w in wanted:
        if w not in sub.columns:
            sub[w] = None

    records = sub[wanted].head(limit).to_dict(orient="records")
    return jsonable_encoder({"rows": len(records), "data": records})

@app.get("/api/correlation")
def correlation():
    use = [c for c in ["popularity","energy","danceability","duration_ms"] if c in df.columns]
    if not use:
        return {"correlation": {}}
    num = df[use].apply(pd.to_numeric, errors="coerce")
    if num.empty or num.notna().sum().sum() == 0:
        return {"correlation": {}}
    corr = num.corr(numeric_only=True).round(2).replace({np.nan: None})
    return {"correlation": jsonable_encoder(corr.to_dict())}

@app.get("/api/debug")
def debug():
    sample = df[[c for c in ["track_name","artist","genre","popularity","energy","danceability","duration_ms"] if c in df.columns]].head(5)
    return {
        "csv_path": str(DATA_PATH),
        "exists": DATA_PATH.exists(),
        "rows": int(df.shape[0]),
        "columns": list(df.columns),
        "sample": sample.to_dict(orient="records"),
    }