export default function Header({ territory, dataQuality }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CL', { day:'2-digit', month:'short', year:'numeric' });

  return (
    <header className="app-header">
      <div className="header-logo">
        <div className="header-logo-mark">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <circle cx="12" cy="12" r="10" stroke="none"/>
            <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
        <div>
          <div className="header-title">Atlas Territorial</div>
          <div className="header-subtitle">Motor Global de Habitabilidad</div>
        </div>
      </div>

      <div className="header-divider" />

      {territory && (
        <>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'14px', fontWeight:600 }}>
            {territory.flag} {territory.name}
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--ink-faint)' }}>
            Score global: {territory.scores?.globalScore ?? '—'}
          </span>
          <div className="header-divider" />
        </>
      )}

      <div className="header-spacer" />

      {dataQuality && (
        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: dataQuality.level === 'high' ? 'var(--sage)' :
                        dataQuality.level === 'medium' ? 'var(--amber)' : 'var(--terracotta)'
          }} />
          <span className="header-meta">
            {dataQuality.okSources}/{dataQuality.totalSources} fuentes
          </span>
        </div>
      )}

      <div className="header-divider" />
      <div className="header-meta">{dateStr}</div>
    </header>
  );
}
