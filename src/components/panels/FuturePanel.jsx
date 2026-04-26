import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getScoreColor } from '../../data/fallback.js';

const SCENARIOS = {
  optimistic: { label:'Optimista',  description:'Reducción emisiones 2030, 1.5°C' },
  moderate:   { label:'Moderado',   description:'Tendencia actual, 2.5°C' },
  pessimistic:{ label:'Pesimista',  description:'Sin acción climática, 4°C' },
};

export default function FuturePanel({ territory }) {
  if (!territory) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔮</div>
        <div className="empty-title">Sin territorio seleccionado</div>
        <div className="empty-desc">Selecciona un país para ver proyecciones de vulnerabilidad y escenarios climáticos futuros.</div>
      </div>
    );
  }

  const futureScore = territory.scores?.futureVulnerability ?? 50;
  const habScore    = territory.scores?.habitability ?? 60;
  const resScore    = territory.scores?.resilience   ?? 55;

  // Proyección de habitabilidad score 2024-2050
  const years = [2024, 2030, 2035, 2040, 2045, 2050];

  const decline = {
    optimistic:  0.2,
    moderate:    0.5,
    pessimistic: 1.0,
  };

  const projData = years.map((year, i) => {
    const t = i;
    return {
      year: String(year),
      opt:  Math.round(Math.max(20, habScore - decline.optimistic  * t * t * 0.3)),
      mod:  Math.round(Math.max(15, habScore - decline.moderate    * t * t * 0.5)),
      pes:  Math.round(Math.max(10, habScore - decline.pessimistic * t * t * 0.8)),
    };
  });

  const scenarios = territory._futureScenarios || [
    { year:2030, delta:-3,  label:'Temperatura media',    unit:'+°C', icon:'🌡️', severity:'warn' },
    { year:2040, delta:-8,  label:'Disponibilidad agua',  unit:'%',   icon:'💧', severity:'critical' },
    { year:2050, delta:-12, label:'Habitabilidad',        unit:'pts', icon:'🏘️', severity:'critical' },
    { year:2050, delta:+18, label:'Estrés hídrico',       unit:'%',   icon:'🏜️', severity:'critical' },
    { year:2050, delta:+22, label:'Riesgo incendios',     unit:'%',   icon:'🔥', severity:'warn' },
  ];

  const pressures = [
    { icon:'🌡️', name:'Calentamiento global',    expected: territory.climate?.tempMean > 20 ? 'Alto impacto' : 'Impacto moderado',   detail:'Aumento previsto de 1.5–4°C para 2100 según escenario de emisiones' },
    { icon:'💧', name:'Estrés hídrico',           expected: territory.water?.stress > 40 ? 'Crítico' : 'Creciente',                  detail:'Reducción de precipitaciones y aumento de demanda hídrica' },
    { icon:'🔥', name:'Olas de calor',            expected: territory.climate?.tempMax > 35 ? 'Frecuencia alta' : 'En aumento',       detail:'Mayor frecuencia e intensidad de episodios de calor extremo' },
    { icon:'🌊', name:'Subida del nivel del mar', expected: territory.risk?.tsunami !== 'none' ? 'Costero relevante' : 'Moderado',    detail:'Proyección IPCC: 0.3–1.0m al 2100. Impacto en zonas costeras.' },
    { icon:'🏚️', name:'Saturación humana',        expected: territory.scores?.humanPressure > 65 ? 'Presión alta' : 'Manejable',     detail:'Aumento de densidad urbana y presión sobre servicios' },
    { icon:'⚡', name:'Presión energética',        expected: territory.energy?.renewableShare < 40 ? 'Transición urgente' : 'En ruta', detail:'Demanda energética creciente vs. capacidad de transición renovable' },
  ];

  return (
    <div className="panel-body fade-in">
      <div className="panel-title">Proyección Futura</div>
      <div className="panel-subtitle">Escenarios climáticos 2030–2050 · IPCC / NASA</div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
        <div style={{ textAlign:'center', padding:'12px', background:'var(--cream)', border:'1px solid var(--border-light)', borderRadius:'var(--r-md)' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'4px' }}>Vulnerabilidad Futura</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'36px', fontWeight:'700', color: getScoreColor(100 - futureScore), lineHeight:1 }}>{futureScore}</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-muted)', marginTop:'4px' }}>Escenario base 2050</div>
        </div>
        <div style={{ textAlign:'center', padding:'12px', background:'var(--cream)', border:'1px solid var(--border-light)', borderRadius:'var(--r-md)' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'4px' }}>Resiliencia</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'36px', fontWeight:'700', color: getScoreColor(resScore), lineHeight:1 }}>{resScore}</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-muted)', marginTop:'4px' }}>Capacidad de adaptación</div>
        </div>
      </div>

      <div className="section-header">Proyección de Habitabilidad 2024–2050</div>

      <div style={{ height:'180px', marginBottom:'8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={projData} margin={{ top:5, right:5, bottom:0, left:-20 }}>
            <XAxis dataKey="year" tick={{ fontSize:9, fontFamily:'Space Mono', fill:'var(--ink-muted)' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize:9, fontFamily:'Space Mono', fill:'var(--ink-muted)' }} />
            <Tooltip contentStyle={{ fontFamily:'Space Mono', fontSize:'10px', background:'var(--paper)', border:'1px solid var(--border)', borderRadius:'6px' }} />
            <ReferenceLine y={50} stroke="var(--border)" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="opt" stroke="var(--sage)"       strokeWidth={2} dot={false} name="Optimista" />
            <Line type="monotone" dataKey="mod" stroke="var(--amber)"      strokeWidth={2} dot={false} name="Moderado" />
            <Line type="monotone" dataKey="pes" stroke="var(--terracotta)" strokeWidth={2} dot={false} name="Pesimista" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display:'flex', gap:'12px', justifyContent:'center', marginBottom:'16px' }}>
        {[['var(--sage)', 'Optimista'], ['var(--amber)', 'Moderado'], ['var(--terracotta)', 'Pesimista']].map(([col, lbl]) => (
          <div key={lbl} style={{ display:'flex', alignItems:'center', gap:'5px', fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-muted)' }}>
            <div style={{ width:'14px', height:'2px', background:col }} />
            {lbl}
          </div>
        ))}
      </div>

      <div className="section-header">Cambios Proyectados 2050</div>

      {scenarios.map((sc, i) => (
        <div key={i} className="projection-row">
          <span className="projection-icon">{sc.icon}</span>
          <div className="projection-info">
            <div className="projection-name">{sc.label}</div>
            <div className="projection-desc">Horizonte {sc.year}</div>
          </div>
          <span className={`projection-delta ${sc.delta < 0 ? 'delta-neg' : sc.delta > 0 && sc.severity === 'critical' ? 'delta-neg' : 'delta-warn'}`}>
            {sc.delta > 0 ? '+' : ''}{sc.delta}{sc.unit}
          </span>
        </div>
      ))}

      <div className="section-header" style={{ marginTop:'16px' }}>Presiones Identificadas</div>

      {pressures.map((p, i) => (
        <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'10px 0', borderBottom:'1px solid var(--border-light)' }}>
          <span style={{ fontSize:'16px', flexShrink:0, marginTop:'1px' }}>{p.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)' }}>{p.name}</div>
            <div style={{ fontSize:'11px', color:'var(--ink-faint)', fontStyle:'italic', marginTop:'2px' }}>{p.detail}</div>
          </div>
          <span style={{
            fontFamily:'var(--font-mono)', fontSize:'10px', fontWeight:700, flexShrink:0, textAlign:'right',
            color: p.expected.includes('Crítico') || p.expected.includes('urgente') || p.expected.includes('alto') || p.expected.includes('Alta')
              ? 'var(--terracotta)' : p.expected.includes('ruta') || p.expected.includes('Manejable') ? 'var(--sage)' : 'var(--amber)'
          }}>{p.expected}</span>
        </div>
      ))}

      <div style={{ marginTop:'16px', padding:'10px 12px', background:'var(--parchment)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-muted)' }}>
        ⚠️ Nivel de confianza: BAJO. Proyecciones basadas en modelos IPCC AR6 y datos NASA POWER. Alta incertidumbre en escala local. No reemplaza estudios específicos de adaptación climática.
      </div>
    </div>
  );
}
