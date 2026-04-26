import { useState, Suspense, lazy } from 'react';
import Header from './components/Header.jsx';
import LeftSidebar from './components/LeftSidebar.jsx';
import RightSidebar from './components/RightSidebar.jsx';
import { useTerritory } from './hooks/useTerritory.js';

// Lazy load Globe3D — es pesado (three.js)
const Globe3D = lazy(() => import('./components/Globe3D.jsx'));

export default function App() {
  const [globeMode, setGlobeMode]   = useState('habitability');
  const { territory, loading, error, dataQuality, selectTerritory } = useTerritory();

  const handleCountrySelect = (code, lat, lng, name) => {
    selectTerritory(code, lat, lng);
  };

  return (
    <div className="app-shell">
      {/* ── Header ── */}
      <Header territory={territory} dataQuality={dataQuality} />

      {/* ── Left sidebar ── */}
      <LeftSidebar
        onCountrySelect={handleCountrySelect}
        selectedCode={territory?.code}
        globeMode={globeMode}
        onGlobeModeChange={setGlobeMode}
      />

      {/* ── Globe 3D main area ── */}
      <main className="app-main">
        <Suspense fallback={
          <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px', background:'var(--parchment)' }}>
            <div className="spinner-ring" style={{ width:'40px', height:'40px', borderWidth:'3px' }} />
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--ink-muted)', letterSpacing:'0.1em' }}>CARGANDO MOTOR 3D…</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)' }}>Inicializando Three.js y geodatos</div>
          </div>
        }>
          <Globe3D
            onCountrySelect={handleCountrySelect}
            selectedCode={territory?.code}
            mode={globeMode}
          />
        </Suspense>

        {/* Error banner */}
        {error && (
          <div style={{
            position:'absolute', top:'16px', left:'50%', transform:'translateX(-50%)',
            background:'rgba(250,243,220,0.96)', border:'1px solid var(--amber)',
            borderRadius:'var(--r-md)', padding:'10px 16px',
            fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--ink-secondary)',
            boxShadow:'var(--shadow-md)', maxWidth:'400px', zIndex:50,
            display:'flex', alignItems:'center', gap:'8px',
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </main>

      {/* ── Right sidebar ── */}
      <RightSidebar
        territory={territory}
        loading={loading}
        dataQuality={dataQuality}
      />
    </div>
  );
}
