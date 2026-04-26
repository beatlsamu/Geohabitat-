import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FALLBACK_COUNTRIES, getScoreColor } from '../../data/fallback.js';

export default function HumanPressurePanel({ territory }) {
  if (!territory) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <div className="empty-title">Sin territorio seleccionado</div>
        <div className="empty-desc">Selecciona un país para ver análisis de presión humana y saturación territorial.</div>
      </div>
    );
  }

  const density = territory.population && territory.area
    ? Math.round(territory.population / territory.area)
    : null;

  const pressureScore = territory.scores?.humanPressure ?? 50;

  // Comparativa regional
  const regional = Object.values(FALLBACK_COUNTRIES)
    .filter(c => c.region === territory.region && c.code !== territory.code)
    .slice(0, 5)
    .map(c => ({
      name: c.name.length > 8 ? c.name.slice(0, 8) + '…' : c.name,
      presion: c.scores?.humanPressure ?? 50,
      flag: c.flag,
    }));

  regional.unshift({ name: territory.name.slice(0, 8), presion: pressureScore, flag: territory.flag, current: true });

  const metrics = [
    { label:'Presión humana',       value: pressureScore,  unit:'/ 100', color: pressureScore > 70 ? 'terracotta' : pressureScore > 45 ? 'amber' : 'sage', desc:'Índice compuesto de saturación territorial' },
    { label:'Densidad poblacional', value: density,        unit:'hab/km²', color:'brown', desc:'Habitantes por kilómetro cuadrado' },
    { label:'Población total',      value: territory.population ? (territory.population/1e6).toFixed(1) + 'M' : null, unit:'hab', color:'blue', desc:'Último censo o estimación disponible (World Bank)' },
    { label:'Área territorial',     value: territory.area ? Math.round(territory.area/1000) + 'K' : null, unit:'km²', color:'teal', desc:'Superficie total del territorio' },
  ];

  const pressureClass = pressureScore >= 75 ? 'Muy alta' : pressureScore >= 55 ? 'Alta' : pressureScore >= 35 ? 'Moderada' : 'Baja';
  const pressureColor = getScoreColor(100 - pressureScore);

  return (
    <div className="panel-body fade-in">
      <div className="panel-title">Presión Humana</div>
      <div className="panel-subtitle">Saturación territorial, densidad y dinámica poblacional</div>

      <div style={{ textAlign:'center', padding:'16px 0', marginBottom:'8px' }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Índice de Presión Humana</div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'48px', fontWeight:'700', color: pressureColor, lineHeight:1, marginTop:'4px' }}>
          {pressureScore}
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--ink-muted)', marginTop:'4px' }}>
          Presión {pressureClass}
        </div>
      </div>

      <div className="metric-grid" style={{ marginBottom:'16px' }}>
        {metrics.map(m => (
          <div key={m.label} className={`metric-card ${m.color}`}>
            <div className="metric-name">{m.label}</div>
            <div>
              <span className="metric-value" style={{ fontSize:'16px' }}>{m.value ?? '—'}</span>
              {m.unit && <span className="metric-unit"> {m.unit}</span>}
            </div>
            <div className="metric-source">{m.desc}</div>
          </div>
        ))}
      </div>

      <div className="section-header">Comparativa Regional</div>

      <div style={{ height:'180px', marginBottom:'16px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={regional} margin={{ top:0, right:0, bottom:0, left:-20 }}>
            <XAxis dataKey="name" tick={{ fontSize:9, fontFamily:'Space Mono', fill:'var(--ink-muted)' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize:9, fontFamily:'Space Mono', fill:'var(--ink-muted)' }} />
            <Tooltip
              contentStyle={{ fontFamily:'Space Mono', fontSize:'10px', background:'var(--paper)', border:'1px solid var(--border)', borderRadius:'6px' }}
              formatter={(v) => [`${v} pts`, 'Presión']}
            />
            <Bar dataKey="presion" radius={[3,3,0,0]}>
              {regional.map((entry, i) => (
                <Cell key={i} fill={entry.current ? 'var(--blue)' : getScoreColor(100 - entry.presion)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="section-header">Análisis de Saturación</div>

      {[
        { dim:'Vivienda y Urbanización', level: pressureScore > 65 ? 'Tensión alta' : 'Estable', icon:'🏘️', detail: density > 200 ? 'Alta densidad urbana. Posible saturación de servicios.' : 'Densidad manejable. Margen de expansión disponible.' },
        { dim:'Servicios y Movilidad',   level: pressureScore > 70 ? 'Sobrecargado' : 'Adecuado', icon:'🚌', detail:'Estimación basada en densidad y producto per cápita.' },
        { dim:'Infraestructura',         level: pressureScore > 60 ? 'Bajo presión' : 'Capacidad normal', icon:'🏗️', detail:'Derivado del índice de PIB per cápita y densidad poblacional.' },
        { dim:'Recursos naturales',      level: territory.water?.stress > 50 ? 'Estrés hídrico' : 'Dentro del límite', icon:'🌱', detail:'Basado en disponibilidad hídrica y superficie territorial.' },
      ].map(row => (
        <div key={row.dim} className="projection-row">
          <span className="projection-icon">{row.icon}</span>
          <div className="projection-info">
            <div className="projection-name">{row.dim}</div>
            <div className="projection-desc">{row.detail}</div>
          </div>
          <span style={{
            fontFamily:'var(--font-mono)', fontSize:'10px', fontWeight:700,
            color: row.level.includes('Tensión') || row.level.includes('Sobre') || row.level.includes('Estrés') || row.level.includes('presión')
              ? 'var(--terracotta)' : 'var(--sage)'
          }}>{row.level}</span>
        </div>
      ))}

      <div style={{ marginTop:'16px', padding:'10px 12px', background:'var(--amber-bg)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-muted)' }}>
        ⚠️ Nivel de confianza: MEDIO · Datos de densidad de World Bank + INE. Urbanización y crecimiento: estimados.
      </div>
    </div>
  );
}
