import { useState, useRef, useEffect } from 'react';
import { FALLBACK_COUNTRIES } from '../data/fallback.js';

const ALL_COUNTRIES = Object.values(FALLBACK_COUNTRIES);

export default function SearchBar({ onSelect }) {
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen]     = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const q = query.toLowerCase();
    const found = ALL_COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.region?.toLowerCase().includes(q)
    ).slice(0, 8);
    setResults(found);
    setOpen(found.length > 0);
  }, [query]);

  const handleSelect = (c) => {
    onSelect(c.code, c.lat, c.lng, c.name);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="search-wrap">
      <div style={{ position:'relative' }}>
        <div className="search-input-wrap">
          <span className="search-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Buscar territorio…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => query && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
        </div>

        {open && (
          <div className="search-results">
            {results.map(c => (
              <div key={c.code} className="search-result-item" onMouseDown={() => handleSelect(c)}>
                <span className="search-result-flag">{c.flag}</span>
                <div>
                  <div className="search-result-name">{c.name}</div>
                  <div className="search-result-region">{c.region} · Score {c.scores?.globalScore ?? '—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
