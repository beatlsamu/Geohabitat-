import { getScoreColor, getScoreLabel, getScoreClass } from '../../data/fallback.js';

function ScoreBar({ name, value, weight, color }) {
  if (value == null) return null;
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-header">
        <span className="score-bar-name">{name}</span>
        <span className="score-bar-num">{value}</span>
      </div>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width:`${value}%`, background: color }} />
      </div>
    </div>
  );
}

function MetricCard({ name, value, unit, color = 'blue', source }) {
  return (
    <div className={`metric-card ${color}`}>
      <div className="metric-name">{name}</div>
      <div>
        <span className="metric-value">{value ?? '—'}</span>
        {unit && <span className="metric-unit"> {unit}</span>}
      </div>
      {source && <div className="metric-source">{source}</div>}
    </div>
  );
}

export default function OverviewPanel({ territory, loading }) {
  if (loading && !territory) {
    return (
      <div className="loading-spinner">
        <div className="spinner-ring" />
        <div className="loading-text">CARGANDO DATOS…</div>
      </div>
    );
  }

  if (!territory) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🌍</div>
        <div className="empty-title">Selecciona un territorio</div>
        <div className="empty-desc">Haz clic en el globo o busca un país para explorar su genoma territorial.</div>
      </div>
    );
  }

  const s = territory.scores || {};
  const c = territory.climate || {};
  const aq = territory.airQuality || {};
  const e = territory.energy || {};
  const w = territory.water || {};

  const scores = [
    { name: 'Habitabilidad',     value: s.habitability,      color: getScoreColor(s.habitability) },
    { name: 'Presión humana',    value: s.humanPressure,      color: getScoreColor(100 - s.humanPressure) },
    { name: 'Energía sost.',     value: s.sustainableEnergy,  color: getScoreColor(s.sustainableEnergy) },
    { name: 'Fricción diaria',   value: s.dailyFriction,      color: getScoreColor(100 - s.dailyFriction) },
    { name: 'Vulnerab. futura',  value: s.futureVulnerability,color: getScoreColor(100 - s.futureVulnerability) },
    { name: 'Resiliencia',       value: s.resilience,          color: getScoreColor(s.resilience) },
  ];

  const globalScore = s.globalScore;

  return (
    <div className="panel-body fade-in">
      <div style={{ textAlign:'center', marginBottom:'20px' }}>
        <div style={{ fontSize:'10px', fontFamily:'var(--font-mono)', color:'var(--ink-faint)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'6px' }}>Score Global Compuesto</div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'52px', fontWeight:'700', lineHeight:1, color: getScoreColor(globalScore) }}>
          {globalScore ?? '—'}
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--ink-muted)', marginTop:'4px' }}>
          {getScoreLabel(globalScore)} · escala 0–100
        </div>
      </div>

      <div className="section-header">Dimensiones del Score</div>

      <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'20px' }}>
        {scores.filter(s => s.value != null).map(sc => (
          <ScoreBar key={sc.name} name={sc.name} value={sc.value} color={sc.color} />
        ))}
      </div>

      {loading && (
        <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px', background:'var(--blue-bg)', border:'1px solid var(--blue-light)', borderRadius:'var(--r-sm)', marginBottom:'12px' }}>
          <div className="spinner-ring" style={{ width:'14px', height:'14px', borderWidth:'2px' }} />
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--blue)' }}>Actualizando con datos en tiempo real…</span>
        </div>
      )}

      <div className="section-header">Variables Clave</div>

      <div className="metric-grid">
        <MetricCard name="Temp. media" value={c.tempMean != null ? c.tempMean.toFixed(1) : null} unit="°C" color="sage" source="Open-Meteo" />
        <MetricCard name="Humedad" value={c.humidity != null ? Math.round(c.humidity) : null} unit="%" color="blue" source="Open-Meteo" />
        <MetricCard name="PM2.5" value={aq.pm25 != null ? aq.pm25.toFixed(1) : null} unit="µg/m³" color={aq.pm25 > 25 ? 'terracotta' : 'sage'} source="OpenAQ" />
        <MetricCard name="Viento" value={c.windSpeed != null ? c.windSpeed.toFixed(1) : null} unit="m/s" color="brown" source="NASA POWER" />
        <MetricCard name="Solar" value={c.solarIrradiation != null ? c.solarIrradiation.toFixed(1) : null} unit="kWh/m²/d" color="amber" source="NASA POWER" />
        <MetricCard name="Renovables" value={e.renewableShare != null ? Math.round(e.renewableShare) : null} unit="%" color="sage" source="IEA" />
      </div>

      <div className="section-header" style={{ marginTop:'16px' }}>Datos Territoriales</div>

      <div className="metric-grid">
        <MetricCard name="Población" value={territory.population ? (territory.population / 1e6).toFixed(1) : null} unit="M hab" color="brown" source="World Bank" />
        <MetricCard name="Área" value={territory.area ? Math.round(territory.area / 1000) : null} unit="mil km²" color="blue" source="World Bank" />
        <MetricCard name="PIB/cápita" value={territory.gdpPerCapita ? `$${Math.round(territory.gdpPerCapita / 1000)}K` : null} unit="" color="sage" source="World Bank" />
        <MetricCard name="Precipit." value={c.precipitation != null ? Math.round(c.precipitation) : null} unit="mm/año" color="teal" source="ERA5" />
      </div>

      <div className="section-header" style={{ marginTop:'16px' }}>Fuentes de Datos</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
        {(territory.sources || []).map(s => (
          <span key={s} className="source-tag">{s}</span>
        ))}
      </div>
    </div>
  );
}
