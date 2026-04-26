import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getScoreColor } from '../../data/fallback.js';

export default function EnergyPanel({ territory }) {
  if (!territory) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚡</div>
        <div className="empty-title">Sin territorio seleccionado</div>
        <div className="empty-desc">Selecciona un país para ver su potencial energético y sostenibilidad.</div>
      </div>
    );
  }

  const e = territory.energy || {};
  const c = territory.climate || {};
  const energyScore = territory.scores?.sustainableEnergy ?? 50;

  const radarData = [
    { subject: 'Solar',     A: Math.round((e.solarPotential || 4) / 10 * 100), fullMark:100 },
    { subject: 'Eólico',    A: Math.round((e.windPotential  || 4) / 10 * 100), fullMark:100 },
    { subject: 'Renovables',A: Math.round(e.renewableShare   || 20), fullMark:100 },
    { subject: 'Eficiencia',A: Math.min(100, Math.round((territory.gdpPerCapita || 5000) / 800)), fullMark:100 },
    { subject: 'Demanda',   A: 100 - Math.min(100, Math.round((e.consumption || 5000) / 200)), fullMark:100 },
  ];

  const solarCat  = e.solarPotential >= 6 ? 'Excelente' : e.solarPotential >= 4 ? 'Bueno' : 'Moderado';
  const windCat   = e.windPotential  >= 7 ? 'Excelente' : e.windPotential  >= 5 ? 'Bueno' : 'Limitado';
  const renewCat  = e.renewableShare >= 60 ? 'Líder'     : e.renewableShare >= 30 ? 'En transición' : 'Inicial';

  const chileContext = territory.code === 'CL' ? (
    <div className="alert alert-info" style={{ marginBottom:'12px' }}>
      <span className="alert-icon">🇨🇱</span>
      <div style={{ fontSize:'11px' }}>
        <strong>Chile:</strong> 54% de energía renovable en 2023 (CNE). Capacidad solar instalada: 8.2 GW. Atacama: mayor irradiación solar del planeta (9+ kWh/m²/d). Meta 60% renovable 2030.
      </div>
    </div>
  ) : null;

  return (
    <div className="panel-body fade-in">
      <div className="panel-title">Energía y Sostenibilidad</div>
      <div className="panel-subtitle">Potencial solar, eólico, renovables y eficiencia energética</div>

      {chileContext}

      <div style={{ textAlign:'center', marginBottom:'16px' }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Score Energía Sostenible</div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'48px', fontWeight:'700', color: getScoreColor(energyScore), lineHeight:1, marginTop:'4px' }}>
          {energyScore}
        </div>
      </div>

      {/* Radar */}
      <div style={{ height:'200px', marginBottom:'16px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top:0, right:20, bottom:0, left:20 }}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize:10, fontFamily:'Space Mono', fill:'var(--ink-muted)' }} />
            <Radar name="Energía" dataKey="A" stroke="var(--amber)" fill="var(--amber)" fillOpacity={0.25} />
            <Tooltip contentStyle={{ fontFamily:'Space Mono', fontSize:'10px', background:'var(--paper)', border:'1px solid var(--border)', borderRadius:'6px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="metric-grid" style={{ marginBottom:'16px' }}>
        <div className="metric-card amber">
          <div className="metric-name">Potencial Solar</div>
          <div><span className="metric-value">{e.solarPotential?.toFixed(1) ?? '—'}</span><span className="metric-unit"> kWh/m²/d</span></div>
          <div className="metric-source" style={{ color: e.solarPotential >= 6 ? 'var(--sage)' : e.solarPotential >= 4 ? 'var(--amber)' : 'var(--ink-muted)' }}>{solarCat}</div>
        </div>
        <div className="metric-card blue">
          <div className="metric-name">Potencial Eólico</div>
          <div><span className="metric-value">{e.windPotential?.toFixed(1) ?? '—'}</span><span className="metric-unit"> / 10</span></div>
          <div className="metric-source" style={{ color: e.windPotential >= 7 ? 'var(--sage)' : e.windPotential >= 5 ? 'var(--amber)' : 'var(--ink-muted)' }}>{windCat}</div>
        </div>
        <div className="metric-card sage">
          <div className="metric-name">Mix Renovable</div>
          <div><span className="metric-value">{e.renewableShare != null ? Math.round(e.renewableShare) : '—'}</span><span className="metric-unit"> %</span></div>
          <div className="metric-source" style={{ color: e.renewableShare >= 60 ? 'var(--sage)' : e.renewableShare >= 30 ? 'var(--amber)' : 'var(--terracotta)' }}>{renewCat}</div>
        </div>
        <div className="metric-card teal">
          <div className="metric-name">Radiación solar</div>
          <div><span className="metric-value">{c.solarIrradiation?.toFixed(1) ?? '—'}</span><span className="metric-unit"> kWh/m²/d</span></div>
          <div className="metric-source">NASA POWER</div>
        </div>
      </div>

      <div className="section-header">Zonas de Mayor Potencial</div>

      {[
        { zone:'Solar',       icon:'☀️', score: e.solarPotential >= 6 ? 95 : e.solarPotential >= 4 ? 70 : 45, detail:'Basado en irradiación horizontal global (NASA POWER)' },
        { zone:'Eólico',      icon:'🌬️', score: e.windPotential >= 7 ? 90 : e.windPotential >= 5 ? 65 : 40, detail:'Basado en velocidad media de viento a 10m y 100m (GWA)' },
        { zone:'Hidrológico', icon:'🌊', score: territory.water?.availability > 70 ? 80 : 50, detail:'Estimado desde disponibilidad hídrica y precipitación' },
        { zone:'Geotérmico',  icon:'🌋', score: territory.risk?.volcanic === 'high' || territory.risk?.volcanic === 'very_high' ? 75 : 30, detail:'Estimado desde actividad volcánica y fallas geológicas' },
      ].map(z => (
        <div key={z.zone} className="score-bar-wrap">
          <div className="score-bar-header">
            <span className="score-bar-name">{z.icon} Potencial {z.zone}</span>
            <span className="score-bar-num">{z.score}</span>
          </div>
          <div className="score-bar-track">
            <div className="score-bar-fill" style={{ width:`${z.score}%`, background: getScoreColor(z.score) }} />
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)', marginTop:'2px' }}>{z.detail}</div>
        </div>
      ))}

      <div className="section-header" style={{ marginTop:'16px' }}>Recomendación Territorial</div>
      <div style={{ padding:'12px', background:'var(--sage-bg)', border:'1px solid var(--sage-light)', borderRadius:'var(--r-md)', fontSize:'12px', color:'var(--ink-secondary)', fontStyle:'italic', lineHeight:1.5 }}>
        {e.solarPotential >= 6
          ? `Alta irradiación solar: territorio con excelente potencial fotovoltaico. Recomendable para inversión en energía solar distribuida y centrales de gran escala.`
          : e.windPotential >= 7
          ? `Alto potencial eólico: territorio favorable para parques eólicos. Considerar evaluación de zonas costeras e insulares.`
          : `Potencial mixto moderado. Evaluar combinación solar-eólico distribuido. Revisar CNE y planificación energética local.`}
      </div>
    </div>
  );
}
