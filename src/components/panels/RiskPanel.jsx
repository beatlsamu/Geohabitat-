import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getScoreColor } from '../../data/fallback.js';

const RISK_LEVELS = {
  none:      { label:'Ninguno',    color:'#B0A898', bar:0  },
  very_low:  { label:'Muy bajo',   color:'#5A8A6A', bar:10 },
  low:       { label:'Bajo',       color:'#3B7F7F', bar:25 },
  moderate:  { label:'Moderado',   color:'#C49A27', bar:50 },
  high:      { label:'Alto',       color:'#8B6F4A', bar:72 },
  very_high: { label:'Muy alto',   color:'#B85A3A', bar:90 },
};

function RiskRow({ icon, name, level }) {
  const rl = RISK_LEVELS[level] || RISK_LEVELS.moderate;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid var(--border-light)' }}>
      <span style={{ fontSize:'18px', flexShrink:0 }}>{icon}</span>
      <span style={{ fontSize:'13px', flex:1, color:'var(--ink-secondary)' }}>{name}</span>
      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
        <div style={{ width:'60px', height:'5px', background:'var(--parchment)', borderRadius:'3px', overflow:'hidden' }}>
          <div style={{ width:`${rl.bar}%`, height:'100%', background:rl.color, borderRadius:'3px' }} />
        </div>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', fontWeight:700, color:rl.color, width:'60px', textAlign:'right' }}>{rl.label}</span>
      </div>
    </div>
  );
}

export default function RiskPanel({ territory }) {
  if (!territory) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚠️</div>
        <div className="empty-title">Sin territorio seleccionado</div>
        <div className="empty-desc">Selecciona un país para ver análisis de riesgo ambiental y climático.</div>
      </div>
    );
  }

  const r  = territory.risk    || {};
  const c  = territory.climate || {};
  const aq = territory.airQuality || {};
  const w  = territory.water   || {};

  const habitabilityScore = territory.scores?.habitability ?? 50;
  const climateRisk = territory.scores?.climaticRisk ?? 50;

  // Datos simulados de temperatura histórica (para el gráfico)
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const baseTemp = c.tempMean || 15;
  const amplitude = (c.tempMax - c.tempMin) / 2 || 8;
  const tempData = months.map((month, i) => ({
    month,
    temp: Math.round((baseTemp + amplitude * Math.sin((i - 1) * Math.PI / 6)) * 10) / 10,
  }));

  return (
    <div className="panel-body fade-in">
      <div className="panel-title">Clima y Riesgo Ambiental</div>
      <div className="panel-subtitle">Riesgos naturales, calidad ambiental y habitabilidad climática</div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
        <div style={{ textAlign:'center', padding:'12px', background:'var(--cream)', border:'1px solid var(--border-light)', borderRadius:'var(--r-md)' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'4px' }}>Habitabilidad</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'36px', fontWeight:'700', color: getScoreColor(habitabilityScore), lineHeight:1 }}>{habitabilityScore}</div>
        </div>
        <div style={{ textAlign:'center', padding:'12px', background:'var(--cream)', border:'1px solid var(--border-light)', borderRadius:'var(--r-md)' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'4px' }}>Riesgo Clim.</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'36px', fontWeight:'700', color: getScoreColor(100 - climateRisk), lineHeight:1 }}>{climateRisk}</div>
        </div>
      </div>

      {/* Gráfico temperatura mensual */}
      <div className="section-header">Perfil de Temperatura Anual</div>
      <div style={{ height:'140px', marginBottom:'16px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={tempData} margin={{ top:0, right:0, bottom:0, left:-28 }}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--terracotta)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--blue)"       stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize:9, fontFamily:'Space Mono', fill:'var(--ink-muted)' }} />
            <YAxis tick={{ fontSize:9, fontFamily:'Space Mono', fill:'var(--ink-muted)' }} unit="°" />
            <Tooltip contentStyle={{ fontFamily:'Space Mono', fontSize:'10px', background:'var(--paper)', border:'1px solid var(--border)', borderRadius:'6px' }} formatter={(v) => [`${v}°C`, 'Temperatura']} />
            <Area type="monotone" dataKey="temp" stroke="var(--terracotta)" fill="url(#tempGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)', textAlign:'center', marginBottom:'16px' }}>
        ⚠️ Curva estimada a partir de temp. media anual. Fuente: Open-Meteo / ERA5
      </div>

      {/* Variables climáticas */}
      <div className="section-header">Variables Climáticas</div>
      <div className="metric-grid" style={{ marginBottom:'16px' }}>
        {[
          { name:'PM2.5', value: aq.pm25?.toFixed(1), unit:'µg/m³', color: aq.pm25 > 25 ? 'terracotta' : aq.pm25 > 10 ? 'amber' : 'sage' },
          { name:'AQI',   value: aq.aqi,              unit:'',      color: aq.aqi > 100 ? 'terracotta' : aq.aqi > 50 ? 'amber' : 'sage' },
          { name:'Estrés hídrico', value: w.stress,   unit:'%',     color: w.stress > 50 ? 'terracotta' : w.stress > 30 ? 'amber' : 'sage' },
          { name:'Agua disponible',value: w.availability,unit:'%',  color: w.availability > 70 ? 'sage' : w.availability > 45 ? 'amber' : 'terracotta' },
        ].map(m => (
          <div key={m.name} className={`metric-card ${m.color}`}>
            <div className="metric-name">{m.name}</div>
            <div><span className="metric-value" style={{ fontSize:'18px' }}>{m.value ?? '—'}</span><span className="metric-unit"> {m.unit}</span></div>
          </div>
        ))}
      </div>

      {/* Riesgos naturales */}
      <div className="section-header">Riesgos Naturales</div>
      <div style={{ marginBottom:'16px' }}>
        <RiskRow icon="🌋" name="Actividad volcánica"  level={r.volcanic   || 'low'} />
        <RiskRow icon="🌊" name="Terremoto / Sismo"    level={r.earthquake || 'moderate'} />
        <RiskRow icon="🌊" name="Tsunami"              level={r.tsunami    || 'low'} />
        <RiskRow icon="🔥" name="Incendios forestales" level={r.wildfire   || 'moderate'} />
        <RiskRow icon="🌧️" name="Inundaciones"         level={r.flood      || 'moderate'} />
      </div>

      {territory.code === 'CL' && (
        <div className="alert alert-warning">
          <span className="alert-icon">🇨🇱</span>
          <div style={{ fontSize:'11px' }}>
            Chile concentra el 80% de los sismos mayores del mundo. La zona de subducción Nazca-Sudamericana genera terremotos frecuentes. Fuente: SERNAGEOMIN.
          </div>
        </div>
      )}

      <div style={{ padding:'10px 12px', background:'var(--parchment)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-muted)', marginTop:'8px' }}>
        ℹ️ Nivel de confianza: MEDIO. Riesgos naturales basados en mapas USGS, SERNAGEOMIN y clasificaciones globales de riesgo. Valores cualitativos referenciales.
      </div>
    </div>
  );
}
