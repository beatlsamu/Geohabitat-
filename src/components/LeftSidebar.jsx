import { useState } from 'react';
import SearchBar from './SearchBar.jsx';
import { FALLBACK_COUNTRIES, getScoreColor, getScoreLabel } from '../data/fallback.js';
import { CHILE_REGIONS } from '../data/fallback.js';

const GLOBE_MODES = [
  { id:'habitability',  label:'Habitab.' },
  { id:'energy',        label:'Energía' },
  { id:'humanPressure', label:'Presión' },
  { id:'risk',          label:'Riesgo' },
];

const REGIONS_ORDER = ['Europe', 'North America', 'South America', 'Asia', 'Oceania', 'Africa'];

export default function LeftSidebar({ onCountrySelect, selectedCode, globeMode, onGlobeModeChange }) {
  const [expandedRegion, setExpandedRegion] = useState('South America');
  const [showChileRegions, setShowChileRegions] = useState(false);

  const byRegion = {};
  Object.values(FALLBACK_COUNTRIES).forEach(c => {
    if (!byRegion[c.region]) byRegion[c.region] = [];
    byRegion[c.region].push(c);
  });

  return (
    <aside className="app-sidebar-left">
      {/* Search */}
      <SearchBar onSelect={onCountrySelect} />

      {/* Globe mode selector */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Vista del Mapa</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px' }}>
          {GLOBE_MODES.map(m => (
            <button
              key={m.id}
              className={`mode-btn ${globeMode === m.id ? 'active' : ''}`}
              style={{ flex:'none', padding:'6px', borderRadius:'var(--r-sm)', border:'1px solid var(--border-light)', background: globeMode === m.id ? 'var(--ink)' : 'var(--cream)', color: globeMode === m.id ? 'var(--cream)' : 'var(--ink-muted)' }}
              onClick={() => onGlobeModeChange(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick access Chile */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Chile — Foco Regional</div>
        <button
          className={`territory-nav-item ${selectedCode === 'CL' ? 'active' : ''}`}
          onClick={() => onCountrySelect('CL', -33.45, -70.67, 'Chile')}
        >
          <div className="territory-nav-dot" />
          <span>🇨🇱 Chile (País)</span>
          <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:'10px', color: getScoreColor(FALLBACK_COUNTRIES.CL?.scores?.globalScore) }}>
            {FALLBACK_COUNTRIES.CL?.scores?.globalScore}
          </span>
        </button>

        <button
          style={{ all:'unset', display:'flex', alignItems:'center', gap:'6px', width:'100%', padding:'4px 8px', cursor:'pointer', fontSize:'11px', color:'var(--ink-faint)', fontFamily:'var(--font-mono)' }}
          onClick={() => setShowChileRegions(!showChileRegions)}
        >
          {showChileRegions ? '▼' : '▶'} {CHILE_REGIONS.length} regiones
        </button>

        {showChileRegions && (
          <div style={{ paddingLeft:'8px' }}>
            {CHILE_REGIONS.slice(0, 8).map(r => (
              <button key={r.code}
                className="territory-nav-item"
                style={{ fontSize:'11px' }}
                onClick={() => onCountrySelect('CL', r.lat, r.lng, r.name)}
              >
                <div className="territory-nav-dot" style={{ width:'5px', height:'5px' }} />
                <span style={{ flex:1 }}>{r.name}</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)' }}>{(r.population/1e6).toFixed(1)}M</span>
              </button>
            ))}
            {CHILE_REGIONS.length > 8 && (
              <div style={{ padding:'4px 8px', fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)' }}>
                +{CHILE_REGIONS.length - 8} más…
              </div>
            )}
          </div>
        )}
      </div>

      {/* By region */}
      <div className="sidebar-section" style={{ flex:1 }}>
        <div className="sidebar-section-title">Territorios por Región</div>

        {REGIONS_ORDER.filter(r => byRegion[r]).map(region => (
          <div key={region} style={{ marginBottom:'4px' }}>
            <button
              style={{ all:'unset', display:'flex', alignItems:'center', gap:'6px', width:'100%', padding:'6px 8px', cursor:'pointer', borderRadius:'var(--r-sm)', transition:'background 0.1s' }}
              onClick={() => setExpandedRegion(expandedRegion === region ? null : region)}
            >
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--ink-secondary)', fontWeight:700, flex:1 }}>
                {expandedRegion === region ? '▼' : '▶'} {region}
              </span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)' }}>
                {byRegion[region].length}
              </span>
            </button>

            {expandedRegion === region && (
              <div style={{ paddingLeft:'4px' }}>
                {byRegion[region]
                  .sort((a, b) => (b.scores?.globalScore ?? 0) - (a.scores?.globalScore ?? 0))
                  .map(c => (
                    <button
                      key={c.code}
                      className={`territory-nav-item ${selectedCode === c.code ? 'active' : ''}`}
                      onClick={() => onCountrySelect(c.code, c.lat, c.lng, c.name)}
                    >
                      <span style={{ fontSize:'14px' }}>{c.flag}</span>
                      <span style={{ flex:1, fontSize:'12px' }}>{c.name}</span>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', fontWeight:700, color: getScoreColor(c.scores?.globalScore) }}>
                        {c.scores?.globalScore ?? '—'}
                      </span>
                    </button>
                  ))
                }
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer stats */}
      <div style={{ padding:'10px 12px', borderTop:'1px solid var(--border-light)', background:'var(--parchment)' }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)', textAlign:'center', lineHeight:1.6 }}>
          {Object.keys(FALLBACK_COUNTRIES).length} territorios · {Object.values(FALLBACK_COUNTRIES).reduce((s, c) => s + (c.population || 0), 0) > 1e9 ? (Object.values(FALLBACK_COUNTRIES).reduce((s, c) => s + (c.population || 0), 0) / 1e9).toFixed(1) + 'B' : ''} personas
          <br />
          Motor de Habitabilidad · v1.0
        </div>
      </div>
    </aside>
  );
}
