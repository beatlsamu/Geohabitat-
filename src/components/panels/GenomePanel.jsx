import { useState } from 'react';

const CATEGORY_LABELS = {
  clima:     { label: 'Clima',      icon: '🌤️', color: 'var(--blue)' },
  aire:      { label: 'Calidad del Aire', icon: '💨', color: 'var(--teal)' },
  agua:      { label: 'Recursos Hídricos', icon: '💧', color: 'var(--blue)' },
  energia:   { label: 'Energía',    icon: '⚡', color: 'var(--amber)' },
  poblacion: { label: 'Población',  icon: '👥', color: 'var(--brown)' },
};

function ConfidenceBadge({ level }) {
  const cls = {
    high:      'confidence-high',
    medium:    'confidence-medium',
    low:       'confidence-low',
    estimated: 'confidence-estimated',
  }[level] || 'confidence-estimated';

  const labels = { high:'Alta', medium:'Media', low:'Baja', estimated:'Estimado' };
  return <span className={`confidence-badge ${cls}`}>{labels[level] || level}</span>;
}

function GeneCard({ gene }) {
  const [expanded, setExpanded] = useState(false);

  const fmt = (v) => {
    if (v == null) return '—';
    if (typeof v === 'number') return v > 1000000 ? (v/1e6).toFixed(1) + 'M' : v.toLocaleString('es-CL', { maximumFractionDigits: 1 });
    return String(v);
  };

  return (
    <div className="genome-gene" onClick={() => setExpanded(!expanded)} style={{ cursor:'pointer' }}>
      <div className="gene-name">{gene.label}</div>
      <div className="gene-description" style={{ fontSize:'11px', color:'var(--ink-faint)' }}>
        {expanded ? gene.description : gene.source}
      </div>

      <div className="gene-value-wrap">
        <div className="gene-value">{fmt(gene.value)}</div>
        <div className="gene-unit">{gene.unit}</div>
      </div>

      {expanded && (
        <div style={{ gridColumn:'1 / -1', marginTop:'8px', paddingTop:'8px', borderTop:'1px solid var(--border-light)', display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
          <ConfidenceBadge level={gene.confidence} />
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)' }}>
            Fuente: {gene.source}
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)', flex:1, textAlign:'right' }}>
            {gene.description}
          </span>
        </div>
      )}
    </div>
  );
}

export default function GenomePanel({ territory }) {
  if (!territory) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🧬</div>
        <div className="empty-title">Sin territorio seleccionado</div>
        <div className="empty-desc">El genoma territorial agrupa todas las variables ambientales, climáticas y sociales de un lugar.</div>
      </div>
    );
  }

  const genome = territory._genome || [];
  const categories = {};
  for (const gene of genome) {
    if (!categories[gene.category]) categories[gene.category] = [];
    categories[gene.category].push(gene);
  }

  return (
    <div className="panel-body fade-in">
      <div className="panel-title">Genoma Territorial</div>
      <div className="panel-subtitle">{genome.length} genes activos · clic en un gen para expandir</div>

      <div className="alert alert-info">
        <span className="alert-icon">ℹ️</span>
        <span>El genoma territorial es expandible. Cada gen incluye valor, fuente y nivel de confianza. Esta arquitectura permite agregar nuevas variables sin romper el sistema.</span>
      </div>

      {Object.entries(CATEGORY_LABELS).map(([cat, meta]) => {
        const genes = categories[cat];
        if (!genes || !genes.length) return null;

        return (
          <div key={cat} style={{ marginBottom:'16px' }}>
            <div className="section-header">
              <span>{meta.icon}</span>
              <span style={{ color: meta.color }}>{meta.label}</span>
            </div>
            {genes.map(g => <GeneCard key={g.gene} gene={g} />)}
          </div>
        );
      })}

      <div className="section-header">Capa Biológica Derivada</div>
      <div className="alert alert-warning" style={{ marginBottom:'8px' }}>
        <span className="alert-icon">⚠️</span>
        <span style={{ fontSize:'11px' }}>Perfiles analíticos derivados de datos agregados públicos. No representan diagnósticos médicos individuales.</span>
      </div>

      {[
        { icon:'🫁', name:'Perfil respiratorio', desc:'Condiciones para sensibilidad respiratoria', score: territory.airQuality?.pm25 < 10 ? 'Favorable' : territory.airQuality?.pm25 < 25 ? 'Moderado' : 'Desfavorable' },
        { icon:'🌡️', name:'Estrés térmico',      desc:'Exposición a calor y frío extremos',        score: territory.climate?.tempMax < 28 ? 'Confortable' : territory.climate?.tempMax < 33 ? 'Moderado' : 'Elevado' },
        { icon:'💧', name:'Vulnerabilidad hídrica', desc:'Acceso sostenible a agua potable',        score: territory.water?.availability > 70 ? 'Seguro' : territory.water?.availability > 45 ? 'Adecuado' : 'Limitado' },
        { icon:'🌿', name:'Adaptación climática', desc:'Capacidad territorial ante cambio climático',score: territory.scores?.habitability > 70 ? 'Alta' : territory.scores?.habitability > 50 ? 'Media' : 'Baja' },
      ].map(p => (
        <div key={p.name} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px', background:'var(--cream)', border:'1px solid var(--border-light)', borderRadius:'var(--r-sm)', marginBottom:'6px' }}>
          <span style={{ fontSize:'20px' }}>{p.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'13px', fontWeight:600, color:'var(--ink)' }}>{p.name}</div>
            <div style={{ fontSize:'11px', color:'var(--ink-muted)', fontStyle:'italic' }}>{p.desc}</div>
          </div>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', fontWeight:700,
            color: p.score === 'Favorable' || p.score === 'Confortable' || p.score === 'Seguro' || p.score === 'Alta' ? 'var(--sage)' :
                   p.score === 'Moderado' || p.score === 'Adecuado' || p.score === 'Media' ? 'var(--amber)' : 'var(--terracotta)'
          }}>{p.score}</span>
        </div>
      ))}
    </div>
  );
}
