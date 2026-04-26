export default function SourcesPanel({ territory, dataQuality }) {
  const sources = [
    {
      name: 'Open-Meteo',
      url: 'https://open-meteo.com',
      type: 'Clima en tiempo real',
      license: 'Open / Sin API key',
      coverage: 'Global',
      update: 'Horaria',
      icon: '🌤️',
      used: true,
    },
    {
      name: 'NASA POWER',
      url: 'https://power.larc.nasa.gov',
      type: 'Radiación solar y climatología',
      license: 'Public Domain',
      coverage: 'Global (0.5°×0.5°)',
      update: 'Mensual',
      icon: '🛰️',
      used: true,
    },
    {
      name: 'World Bank API',
      url: 'https://data.worldbank.org',
      type: 'Indicadores socioeconómicos',
      license: 'CC BY 4.0',
      coverage: '217 países',
      update: 'Anual',
      icon: '🌐',
      used: true,
    },
    {
      name: 'OpenAQ',
      url: 'https://openaq.org',
      type: 'Calidad del aire (PM2.5, PM10)',
      license: 'CC0',
      coverage: 'Global (estaciones)',
      update: 'Tiempo real',
      icon: '💨',
      used: true,
    },
    {
      name: 'REST Countries',
      url: 'https://restcountries.com',
      type: 'Metadatos geopolíticos',
      license: 'Mozilla Public License 2.0',
      coverage: 'Global',
      update: 'Semestral',
      icon: '🗺️',
      used: true,
    },
    {
      name: 'ERA5 / Copernicus',
      url: 'https://cds.climate.copernicus.eu',
      type: 'Reanálisis climático histórico',
      license: 'Copernicus License',
      coverage: 'Global',
      update: 'Mensual',
      icon: '🌍',
      used: false,
      note: 'Requiere registro gratuito CDS'
    },
    {
      name: 'CNE / Energía Abierta',
      url: 'https://www.energiaabierta.cl',
      type: 'Energía Chile',
      license: 'Datos abiertos',
      coverage: 'Chile',
      update: 'Diaria',
      icon: '⚡',
      used: true,
      chile: true,
    },
    {
      name: 'Coordinador Eléctrico Nacional',
      url: 'https://api.coordinador.cl',
      type: 'Despacho eléctrico Chile',
      license: 'Público',
      coverage: 'Chile',
      update: 'Tiempo real',
      icon: '🔌',
      used: true,
      chile: true,
    },
    {
      name: 'INE Chile',
      url: 'https://www.ine.cl',
      type: 'Censos y estadísticas Chile',
      license: 'Público',
      coverage: 'Chile',
      update: 'Decenal (censo)',
      icon: '🇨🇱',
      used: true,
      chile: true,
    },
    {
      name: 'Global Wind Atlas',
      url: 'https://globalwindatlas.info',
      type: 'Potencial eólico',
      license: 'DTU / World Bank',
      coverage: 'Global',
      update: 'Anual',
      icon: '🌬️',
      used: false,
      note: 'Datos de referencia integrados'
    },
  ];

  const methodologies = [
    {
      score: 'Habitabilidad',
      formula: '0.20×Clima + 0.15×Aire + 0.15×Agua + 0.20×Seg. + 0.10×Energía + 0.10×PIB + 0.10×Densidad',
      confidence: 'Medio',
    },
    {
      score: 'Presión Humana',
      formula: '0.50×Densidad + 0.30×Urbanización + 0.20×Crecimiento',
      confidence: 'Bajo',
    },
    {
      score: 'Fricción Diaria',
      formula: '0.30×CalorExtremo + 0.40×Contaminación + 0.30×RiesgosActivos',
      confidence: 'Medio',
    },
    {
      score: 'Vuln. Futura',
      formula: '0.35×EstrésHídrico + 0.25×Incendios + 0.25×Inundaciones + 0.15×CalorAnual',
      confidence: 'Bajo',
    },
    {
      score: 'Score Global',
      formula: '0.30×Hab + 0.15×(100-Presión) + 0.20×(100-Fricción) + 0.20×(100-VulnFutura) + 0.15×Resiliencia',
      confidence: 'Medio',
    },
  ];

  return (
    <div className="panel-body fade-in">
      <div className="panel-title">Fuentes y Metodología</div>
      <div className="panel-subtitle">Trazabilidad completa de datos y cálculos</div>

      {dataQuality && (
        <div style={{
          padding:'12px', borderRadius:'var(--r-md)', marginBottom:'16px',
          background: dataQuality.level === 'high' ? 'var(--sage-bg)' : dataQuality.level === 'medium' ? 'var(--amber-bg)' : 'var(--terracotta-bg)',
          border: `1px solid ${dataQuality.level === 'high' ? 'var(--sage-light)' : dataQuality.level === 'medium' ? 'var(--amber)' : 'var(--terracotta)'}`,
        }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', fontWeight:700, marginBottom:'4px',
            color: dataQuality.level === 'high' ? 'var(--sage)' : dataQuality.level === 'medium' ? 'var(--amber)' : 'var(--terracotta)'
          }}>
            {dataQuality.level === 'high' ? '✓ Datos de alta calidad' : dataQuality.level === 'medium' ? '⚠ Calidad de datos media' : '⚠ Calidad de datos limitada'}
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-secondary)' }}>
            {dataQuality.okSources} de {dataQuality.totalSources} fuentes respondieron correctamente
            {dataQuality.fetchedAt && ` · Actualizado: ${new Date(dataQuality.fetchedAt).toLocaleTimeString('es-CL')}`}
          </div>
        </div>
      )}

      <div className="section-header">Fuentes de Datos</div>

      {sources.map(src => (
        <div key={src.name} style={{
          padding:'10px 12px', background:'var(--cream)', border:'1px solid var(--border-light)',
          borderRadius:'var(--r-sm)', marginBottom:'6px', opacity: src.used ? 1 : 0.6
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
            <span style={{ fontSize:'16px' }}>{src.icon}</span>
            <span style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)' }}>{src.name}</span>
            {src.chile && <span style={{ fontSize:'9px', padding:'1px 5px', background:'var(--blue-bg)', border:'1px solid var(--blue-light)', borderRadius:'99px', color:'var(--blue)', fontFamily:'var(--font-mono)' }}>CHILE</span>}
            {!src.used && <span style={{ fontSize:'9px', padding:'1px 5px', background:'var(--parchment)', border:'1px solid var(--border)', borderRadius:'99px', color:'var(--ink-faint)', fontFamily:'var(--font-mono)' }}>FALLBACK</span>}
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-muted)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2px' }}>
            <span>📦 {src.type}</span>
            <span>📜 {src.license}</span>
            <span>🌐 {src.coverage}</span>
            <span>🔄 {src.update}</span>
          </div>
          {src.note && (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)', marginTop:'4px', fontStyle:'italic' }}>
              ℹ️ {src.note}
            </div>
          )}
          <a href={src.url} target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:'3px', marginTop:'5px', fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--blue)', textDecoration:'none' }}>
            🔗 {src.url.replace('https://', '')}
          </a>
        </div>
      ))}

      <div className="section-header" style={{ marginTop:'16px' }}>Metodología de Scoring</div>

      <div className="alert alert-info" style={{ marginBottom:'12px' }}>
        <span className="alert-icon">ℹ️</span>
        <span style={{ fontSize:'11px' }}>Todos los scores son calculados con fórmulas abiertas y documentadas. Los pesos reflejan consenso de literatura científica y pueden ajustarse.</span>
      </div>

      {methodologies.map(m => (
        <div key={m.score} style={{ marginBottom:'10px', padding:'10px 12px', background:'var(--cream)', border:'1px solid var(--border-light)', borderRadius:'var(--r-sm)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
            <span style={{ fontSize:'12px', fontWeight:600, color:'var(--ink)' }}>{m.score}</span>
            <span className={`confidence-badge ${m.confidence === 'Alto' ? 'confidence-high' : m.confidence === 'Medio' ? 'confidence-medium' : 'confidence-low'}`}>
              Confianza {m.confidence}
            </span>
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-muted)', lineHeight:1.6, wordBreak:'break-word' }}>
            {m.formula}
          </div>
        </div>
      ))}

      <div className="section-header" style={{ marginTop:'16px' }}>Principios de Datos</div>
      {[
        ['🚫', 'No se inventan datos. Si una fuente falla, se usa fallback o se degrada con transparencia.'],
        ['📊', 'Toda métrica muestra su origen, fecha y nivel de confianza.'],
        ['🔓', 'Solo se usan fuentes públicas, verificables y abiertas.'],
        ['⚠️', 'Las limitaciones de datos son explícitas, nunca ocultas.'],
        ['🧬', 'La capa biológica es analítica, no médica. No reemplaza diagnósticos.'],
      ].map(([icon, text]) => (
        <div key={text} style={{ display:'flex', gap:'8px', padding:'8px 0', borderBottom:'1px solid var(--border-light)', fontSize:'12px', color:'var(--ink-secondary)' }}>
          <span>{icon}</span>
          <span>{text}</span>
        </div>
      ))}
    </div>
  );
}
