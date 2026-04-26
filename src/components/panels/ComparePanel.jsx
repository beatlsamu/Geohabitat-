import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FALLBACK_COUNTRIES, getScoreColor, getScoreLabel } from '../../data/fallback.js';

const COMPARE_PRESET = ['NO', 'SE', 'DE', 'CL', 'BR', 'IN', 'ZA'];

export default function ComparePanel({ territory }) {
  const countries = COMPARE_PRESET
    .map(c => FALLBACK_COUNTRIES[c])
    .filter(Boolean);

  if (!territory) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚖️</div>
        <div className="empty-title">Sin territorio base</div>
        <div className="empty-desc">Selecciona un país primero para comparar con otros territorios.</div>
      </div>
    );
  }

  // Radar con territorio actual + top 3 comparables
  const comparators = [
    FALLBACK_COUNTRIES['NO'],
    FALLBACK_COUNTRIES['CL'],
    FALLBACK_COUNTRIES['IN'],
  ].filter(c => c && c.code !== territory.code);

  const radarDimensions = [
    { key:'habitability',      label:'Habitab.' },
    { key:'sustainableEnergy', label:'Energía' },
    { key:'resilience',        label:'Resiliencia' },
  ];

  const radarData = radarDimensions.map(dim => {
    const entry = { dim: dim.label };
    entry[territory.name.slice(0, 8)] = territory.scores?.[dim.key] ?? 50;
    comparators.forEach(c => {
      entry[c.name.slice(0, 8)] = c.scores?.[dim.key] ?? 50;
    });
    return entry;
  });

  const COLORS = ['var(--blue)', 'var(--sage)', 'var(--amber)', 'var(--terracotta)'];
  const allTerrs = [territory, ...comparators];

  const scoreKeys = [
    { key:'globalScore',         label:'Score Global' },
    { key:'habitability',        label:'Habitabilidad' },
    { key:'sustainableEnergy',   label:'Energía Sost.' },
    { key:'humanPressure',       label:'Presión Hum.' },
    { key:'dailyFriction',       label:'Fricción Diaria' },
    { key:'futureVulnerability', label:'Vuln. Futura' },
    { key:'resilience',          label:'Resiliencia' },
  ];

  return (
    <div className="panel-body fade-in">
      <div className="panel-title">Comparativa Global</div>
      <div className="panel-subtitle">Posicionamiento en el atlas de habitabilidad</div>

      {/* Radar comparativo */}
      <div style={{ height:'200px', marginBottom:'16px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top:5, right:20, bottom:5, left:20 }}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="dim" tick={{ fontSize:10, fontFamily:'Space Mono', fill:'var(--ink-muted)' }} />
            <Tooltip contentStyle={{ fontFamily:'Space Mono', fontSize:'10px', background:'var(--paper)', border:'1px solid var(--border)', borderRadius:'6px' }} />
            {allTerrs.map((t, i) => (
              <Radar
                key={t.code}
                name={t.name.slice(0, 8)}
                dataKey={t.name.slice(0, 8)}
                stroke={COLORS[i]}
                fill={COLORS[i]}
                fillOpacity={i === 0 ? 0.35 : 0.1}
                strokeWidth={i === 0 ? 2 : 1}
              />
            ))}
            <Legend iconSize={8} wrapperStyle={{ fontFamily:'Space Mono', fontSize:'9px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de scores */}
      <div className="section-header">Tabla Comparativa</div>

      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'11px', fontFamily:'var(--font-mono)' }}>
          <thead>
            <tr>
              <th style={{ padding:'6px 8px', textAlign:'left', borderBottom:'2px solid var(--border)', color:'var(--ink-muted)', fontWeight:400, letterSpacing:'0.05em', textTransform:'uppercase', fontSize:'9px' }}>Dimensión</th>
              {allTerrs.map(t => (
                <th key={t.code} style={{ padding:'6px 8px', textAlign:'center', borderBottom:'2px solid var(--border)', color:'var(--ink-muted)', fontWeight:400, fontSize:'9px', letterSpacing:'0.05em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
                  {t.flag} {t.name.slice(0, 6)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scoreKeys.map((sk, ri) => (
              <tr key={sk.key} style={{ background: ri % 2 === 0 ? 'var(--cream)' : 'transparent' }}>
                <td style={{ padding:'6px 8px', color:'var(--ink-secondary)', borderBottom:'1px solid var(--border-light)' }}>{sk.label}</td>
                {allTerrs.map((t, ti) => {
                  const val = t.scores?.[sk.key];
                  const isInverse = sk.key === 'humanPressure' || sk.key === 'dailyFriction' || sk.key === 'futureVulnerability';
                  const color = val != null ? getScoreColor(isInverse ? 100 - val : val) : 'var(--ink-faint)';
                  return (
                    <td key={t.code} style={{ padding:'6px 8px', textAlign:'center', borderBottom:'1px solid var(--border-light)', fontWeight: ti === 0 ? 700 : 400, color }}>
                      {val ?? '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-header" style={{ marginTop:'16px' }}>Ranking Regional</div>

      {countries
        .sort((a, b) => (b.scores?.globalScore ?? 0) - (a.scores?.globalScore ?? 0))
        .map((c, i) => (
          <div key={c.code}
            onClick={() => {}}
            style={{
              display:'flex', alignItems:'center', gap:'10px', padding:'9px 10px',
              background: c.code === territory.code ? 'var(--sage-bg)' : 'var(--cream)',
              border: `1px solid ${c.code === territory.code ? 'var(--sage)' : 'var(--border-light)'}`,
              borderRadius:'var(--r-sm)', marginBottom:'4px', cursor:'pointer',
            }}
          >
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--ink-faint)', width:'16px', flexShrink:0 }}>#{i+1}</span>
            <span style={{ fontSize:'18px' }}>{c.flag}</span>
            <span style={{ fontSize:'13px', fontWeight: c.code === territory.code ? 700 : 400, flex:1 }}>{c.name}</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'14px', fontWeight:700, color: getScoreColor(c.scores?.globalScore ?? 50) }}>
              {c.scores?.globalScore ?? '—'}
            </span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)' }}>
              {getScoreLabel(c.scores?.globalScore ?? 50)}
            </span>
          </div>
        ))}
    </div>
  );
}
