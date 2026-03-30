import { useState, useEffect, useCallback, useRef } from 'react'

const API_KEY   = '0e1daa4d6d2587b96a1b12e1fa84d91d'
const IMG_W500  = 'https://image.tmdb.org/t/p/w500'
const IMG_ORIG  = 'https://image.tmdb.org/t/p/original'

const GENRE_MAP = {
  28:'Action', 12:'Adventure', 16:'Animation', 35:'Comedy', 80:'Crime',
  18:'Drama',  14:'Fantasy',   27:'Horror',   9648:'Mystery', 10749:'Romance',
  878:'Sci-Fi', 53:'Thriller', 99:'Documentary', 10751:'Family', 36:'History',
}

const TABS = [
  { id:'popular',    label:'Popular',     url:'movie/popular'    },
  { id:'top_rated',  label:'Top Rated',   url:'movie/top_rated'  },
  { id:'now',        label:'Now Playing', url:'movie/now_playing' },
  { id:'upcoming',   label:'Upcoming',    url:'movie/upcoming'   },
]

/* ─── hook ─── */
function useDebounce(value, delay) {
  const [dv, setDv] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return dv
}

/* ─── Stars ─── */
function Stars({ rating }) {
  const filled = Math.round(rating / 2)
  return (
    <span style={{ display:'flex', alignItems:'center', gap:'2px' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="10" height="10" viewBox="0 0 24 24"
          fill={i < filled ? '#a78bfa' : 'rgba(255,255,255,0.13)'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginLeft:'4px', fontWeight:500 }}>
        {rating.toFixed(1)}
      </span>
    </span>
  )
}

/* ─── Movie Card ─── */
function MovieCard({ movie, isSaved, onToggle, index = 0 }) {
  const genre  = GENRE_MAP[movie.genre_ids?.[0]] || 'Film'
  const year   = movie.release_date?.slice(0, 4) || '—'
  const poster = movie.poster_path ? `${IMG_W500}${movie.poster_path}` : null

  return (
    <div
      className={`movie-card${isSaved ? ' saved' : ''} fade-up`}
      style={{ animationDelay: `${Math.min(index * 35, 280)}ms` }}
    >
      {/* Poster */}
      <div className="poster-wrap">
        {poster
          ? <img src={poster} alt={movie.title} loading="lazy" />
          : (
            <div style={{
              position:'absolute', inset:0, display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:'28px', opacity:0.2,
            }}>🎬</div>
          )
        }
        <div className="poster-gradient" />

        {/* Rating */}
        {movie.vote_average > 0 && (
          <div className="rating-badge" style={{ position:'absolute', top:'8px', left:'8px' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#a78bfa">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {movie.vote_average.toFixed(1)}
          </div>
        )}

        {/* Saved heart */}
        {isSaved && (
          <div style={{
            position:'absolute', top:'8px', right:'8px', width:'26px', height:'26px',
            borderRadius:'50%', background:'linear-gradient(135deg,#a78bfa,#7c3aed)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'11px', boxShadow:'0 4px 12px rgba(124,58,237,0.55)',
          }}>♥</div>
        )}

        {/* Genre */}
        <span className="genre-pill" style={{ position:'absolute', bottom:'8px', left:'8px' }}>
          {genre}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding:'11px 11px 10px', display:'flex', flexDirection:'column', gap:'7px', flex:1 }}>
        <h3 style={{
          fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.90)',
          lineHeight:1.38, display:'-webkit-box', WebkitLineClamp:2,
          WebkitBoxOrient:'vertical', overflow:'hidden',
        }}>{movie.title}</h3>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'6px' }}>
          <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.26)', fontWeight:500, flexShrink:0 }}>{year}</span>
          <Stars rating={movie.vote_average || 0} />
        </div>

        <button
          className={`save-btn${isSaved ? ' saved' : ''}`}
          onClick={() => onToggle(movie)}
        >
          {isSaved ? '♥ Saved' : '♡ Save'}
        </button>
      </div>
    </div>
  )
}

/* ─── Hero Banner ─── */
function HeroBanner({ movie, isSaved, onToggle }) {
  if (!movie?.backdrop_path) return null
  const bg    = `${IMG_ORIG}${movie.backdrop_path}`
  const genre = GENRE_MAP[movie.genre_ids?.[0]] || 'Film'
  const year  = movie.release_date?.slice(0, 4) || ''

  return (
    <div className="hero-banner fade-up">
      <img className="hero-bg" src={bg} alt={movie.title} loading="eager" />
      <div className="hero-scrim" />
      <div className="hero-content">
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
          <span className="genre-pill">{genre}</span>
          {year && (
            <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.40)', fontWeight:500 }}>{year}</span>
          )}
          {movie.vote_average > 0 && (
            <span className="rating-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#a78bfa">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {movie.vote_average.toFixed(1)}
            </span>
          )}
        </div>

        <h1 style={{
          fontFamily:'var(--font-serif)', fontSize:'clamp(22px, 4vw, 36px)',
          fontWeight:700, color:'#fff', lineHeight:1.18, marginBottom:'10px',
          letterSpacing:'-0.3px',
        }}>{movie.title}</h1>

        {movie.overview && (
          <p style={{
            fontSize:'13px', color:'rgba(255,255,255,0.52)', lineHeight:1.68,
            marginBottom:'18px', display:'-webkit-box', WebkitLineClamp:2,
            WebkitBoxOrient:'vertical', overflow:'hidden',
          }}>{movie.overview}</p>
        )}

        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <Stars rating={movie.vote_average || 0} />
          <button
            className={`save-btn${isSaved ? ' saved' : ''}`}
            onClick={() => onToggle(movie)}
            style={{ width:'auto', padding:'9px 20px', borderRadius:'50px', flexShrink:0 }}
          >{isSaved ? '♥ Saved' : '♡ Save'}</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Skeleton ─── */
function Skeleton() {
  return (
    <div className="movie-grid">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="movie-card" style={{ paddingTop:'220%', position:'relative' }}>
          <div className="shimmer" style={{ position:'absolute', inset:0 }} />
        </div>
      ))}
    </div>
  )
}

/* ─── Empty State ─── */
function Empty({ icon, title, sub, action }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      textAlign:'center', padding:'72px 20px', gap:'12px',
    }}>
      <span style={{ fontSize:'42px', opacity:0.18 }}>{icon}</span>
      <p style={{ fontSize:'14px', fontWeight:600, color:'rgba(255,255,255,0.32)', letterSpacing:'0.3px' }}>{title}</p>
      <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.18)', maxWidth:'280px', lineHeight:1.65 }}>{sub}</p>
      {action && (
        <button onClick={action.fn} style={{
          marginTop:'6px', background:'rgba(167,139,250,0.10)',
          border:'1px solid rgba(167,139,250,0.25)', borderRadius:'50px',
          color:'var(--accent-light)', fontSize:'12px', fontWeight:500,
          padding:'9px 22px', cursor:'pointer', fontFamily:'var(--font)',
          transition:'all 0.18s',
        }}>{action.label}</button>
      )}
    </div>
  )
}

/* ─── Section Header ─── */
function SectionHead({ label, count, gold }) {
  return (
    <div className="section-head">
      <span style={{
        fontSize:'12px', fontWeight:600, letterSpacing:'0.4px',
        color: gold ? 'var(--accent-light)' : 'rgba(255,255,255,0.38)',
        whiteSpace:'nowrap',
      }}>{label}</span>
      {count !== undefined && (
        <span style={{
          fontSize:'11px', color:'rgba(255,255,255,0.18)',
          whiteSpace:'nowrap', marginRight:'4px',
        }}>{count}</span>
      )}
    </div>
  )
}

/* ─── Pagination ─── */
function Pagination({ page, total, onPrev, onNext }) {
  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'14px', marginTop:'52px' }}>
      <button className="pag-btn" disabled={page <= 1} onClick={onPrev}>← Prev</button>
      <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.25)', fontWeight:500, minWidth:'80px', textAlign:'center' }}>
        {page} / {total}
      </span>
      <button className="pag-btn" disabled={page >= total} onClick={onNext}>Next →</button>
    </div>
  )
}

/* ─── App ─── */
export default function App() {
  const [query,    setQuery]    = useState('')
  const [tab,      setTab]      = useState('popular')
  const [movies,   setMovies]   = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [page,     setPage]     = useState(1)
  const [total,    setTotal]    = useState(1)
  const [saved,    setSaved]    = useState(new Set())
  const [savedList,setSavedList]= useState([])
  const [showSaved,setShowSaved]= useState(false)

  const dq = useDebounce(query, 380)

  /* fetch */
  const load = useCallback(async (q, t, pg) => {
    setLoading(true); setError('')
    try {
      const endpoint = q
        ? `search/movie?query=${encodeURIComponent(q)}`
        : TABS.find(x => x.id === t)?.url || 'movie/popular'
      const res  = await fetch(
        `https://api.themoviedb.org/3/${endpoint}&api_key=${API_KEY}&page=${pg}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.status_message || 'API error')
      setMovies(data.results?.filter(m => m.poster_path) || [])
      setTotal(Math.min(data.total_pages || 1, 20))
    } catch (e) { setError(e.message) }
    setLoading(false)
  }, [])

  useEffect(() => { setPage(1) }, [dq, tab])
  useEffect(() => { if (!showSaved) load(dq, tab, page) }, [dq, tab, page, showSaved, load])

  /* toggle save */
  const toggleSave = useCallback((movie) => {
    const id = movie.id
    setSaved(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setSavedList(l => l.filter(m => m.id !== id))
      } else {
        next.add(id)
        setSavedList(l => l.find(m => m.id === id) ? l : [...l, movie])
      }
      return next
    })
  }, [])

  const switchTab = (id) => { setTab(id); setQuery(''); setShowSaved(false) }

  const heroMovie  = !showSaved && !dq && movies.length > 0 ? movies[0] : null
  const gridMovies = showSaved ? savedList : movies

  return (
    <>
      {/* Ambient background */}
      <div aria-hidden style={{ position:'fixed', inset:0, zIndex:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-15%', left:'-8%', width:'55vw', height:'55vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 65%)' }}/>
        <div style={{ position:'absolute', bottom:'-20%', right:'-5%', width:'48vw', height:'48vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(79,70,229,0.09) 0%, transparent 65%)' }}/>
        <div style={{ position:'absolute', top:'45%', right:'20%', width:'28vw', height:'28vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 65%)' }}/>
      </div>

      {/* ── HEADER ── */}
      <header className="site-header">
        <div className="header-inner">

          {/* Top row */}
          <div className="header-top">
            {/* Brand */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
              <div style={{
                width:'32px', height:'32px', borderRadius:'9px',
                background:'linear-gradient(135deg,#a78bfa,#7c3aed)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'15px', boxShadow:'0 4px 16px rgba(124,58,237,0.40)', flexShrink:0,
              }}>🎬</div>
              <span style={{ fontSize:'19px', fontWeight:700, color:'#fff', letterSpacing:'-0.5px' }}>
                Film<span style={{ color:'var(--accent)' }}>Dex</span>
              </span>
              <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.18)', fontWeight:400, letterSpacing:'1.5px', marginLeft:'2px' }}>
                TMDB
              </span>
            </div>

            {/* Search */}
            <div className="header-search-row" style={{ flex:1, maxWidth:'480px', position:'relative' }}>
              <span style={{
                position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)',
                color:'rgba(255,255,255,0.22)', fontSize:'16px', pointerEvents:'none', lineHeight:1,
              }}>⌕</span>
              <input
                className="fd-search"
                value={query}
                onChange={e => { setQuery(e.target.value); setShowSaved(false) }}
                placeholder="Search movies…"
                aria-label="Search movies"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  style={{
                    position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                    background:'rgba(255,255,255,0.10)', border:'none', borderRadius:'50%',
                    color:'rgba(255,255,255,0.55)', width:'22px', height:'22px',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'14px', cursor:'pointer', padding:0,
                  }}
                >×</button>
              )}
            </div>

            {/* Saved chip */}
            {saved.size > 0 && (
              <button
                className={`saved-chip${showSaved ? ' active' : ''}`}
                onClick={() => setShowSaved(s => !s)}
                aria-label={`${saved.size} saved movies`}
              >
                <span>♥</span>
                <span>{saved.size}</span>
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="tabs-row" style={{ paddingBottom:'14px' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                className={`tab-pill${tab === t.id && !showSaved && !dq ? ' active' : ''}`}
                onClick={() => switchTab(t.id)}
              >{t.label}</button>
            ))}
            {dq && (
              <button className="tab-pill active">
                Search: "{dq}"
              </button>
            )}
            {showSaved && (
              <button className="tab-pill active">♥ Saved</button>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ position:'relative', zIndex:1 }}>
        <div className="site-body">

          {showSaved ? (
            /* ── Saved view ── */
            <>
              <SectionHead label="♥ Saved Films" count={`${savedList.length} movies`} gold />
              {savedList.length === 0
                ? <Empty icon="♡" title="Nothing saved yet"
                    sub="Browse movies and hit Save to build your collection."
                    action={{ label:'Browse Popular', fn:() => setShowSaved(false) }}
                  />
                : <div className="movie-grid">
                    {savedList.map((m, i) => (
                      <MovieCard key={m.id} movie={m} isSaved={true} onToggle={toggleSave} index={i} />
                    ))}
                  </div>
              }
            </>
          ) : (
            <>
              {/* ── Hero ── */}
              {!loading && heroMovie && (
                <HeroBanner
                  movie={heroMovie}
                  isSaved={saved.has(heroMovie.id)}
                  onToggle={toggleSave}
                />
              )}

              {/* ── Saved strip (B5) ── */}
              {savedList.length > 0 && !dq && (
                <div style={{ marginBottom:'48px' }}>
                  <SectionHead label="♥ Saved" count={`${savedList.length}`} gold />
                  <div className="movie-grid">
                    {savedList.map((m, i) => (
                      <MovieCard key={m.id} movie={m} isSaved={true} onToggle={toggleSave} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Grid section ── */}
              <SectionHead
                label={dq
                  ? `Results for "${dq}"`
                  : TABS.find(t => t.id === tab)?.label || 'Movies'
                }
                count={loading ? '' : `${movies.length} titles`}
              />

              {/* B3: Conditional rendering */}
              {loading && <Skeleton />}

              {!loading && error && (
                <Empty icon="⚠" title="Something went wrong" sub={error} />
              )}

              {!loading && !error && dq && movies.length === 0 && (
                <Empty
                  icon="⊘"
                  title={`No results for "${dq}"`}
                  sub="Try a different title or check your spelling."
                  action={{ label:'Clear Search', fn:() => setQuery('') }}
                />
              )}

              {!loading && !error && movies.length > 0 && (
                <>
                  <div className="movie-grid">
                    {movies.map((m, i) => (
                      <MovieCard
                        key={m.id}
                        movie={m}
                        isSaved={saved.has(m.id)}
                        onToggle={toggleSave}
                        index={i}
                      />
                    ))}
                  </div>
                  <Pagination
                    page={page}
                    total={total}
                    onPrev={() => setPage(p => p - 1)}
                    onNext={() => setPage(p => p + 1)}
                  />
                </>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
