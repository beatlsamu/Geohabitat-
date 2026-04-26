import { useState } from 'react';
import OverviewPanel from './panels/OverviewPanel.jsx';
import GenomePanel from './panels/GenomePanel.jsx';
import HumanPressurePanel from './panels/HumanPressurePanel.jsx';
import EnergyPanel from './panels/EnergyPanel.jsx';
import RiskPanel from './panels/RiskPanel.jsx';
import FuturePanel from './panels/FuturePanel.jsx';
import ComparePanel from './panels/ComparePanel.jsx';
import SourcesPanel from './panels/SourcesPanel.jsx';

const TABS = [
  { id:'overview',  label:'Overview' },
  { id:'genome',    label:'Genoma' },
  { id:'pressure',  label:'Presión' },
  { id:'energy',    label:'Energía' },
  { id:'risk',      label:'Riesgo' },
  { id:'future',    label:'Futuro' },
  { id:'compare',   label:'Comparar' },
  { id:'sources',   label:'Fuentes' },
];

export default function RightSidebar({ territory, loading, dataQuality }) {
  const [activeTab, setActiveTab] = useState('overview');

  const renderPanel = () => {
    switch (activeTab) {
      case 'overview':  return <OverviewPanel territory={territory} loading={loading} />;
      case 'genome':    return <GenomePanel territory={territory} />;
      case 'pressure':  return <HumanPressurePanel territory={territory} />;
      case 'energy':    return <EnergyPanel territory={territory} />;
      case 'risk':      return <RiskPanel territory={territory} />;
      case 'future':    return <FuturePanel territory={territory} />;
      case 'compare':   return <ComparePanel territory={territory} />;
      case 'sources':   return <SourcesPanel territory={territory} dataQuality={dataQuality} />;
      default:          return null;
    }
  };

  return (
    <aside className="app-sidebar-right">
      {/* Territory header */}
      {territory ? (
        <div className="territory-header">
          <div className="territory-flag">{territory.flag}</div>
          <div className="territory-name">{territory.name}</div>
          <div className="territory-region">{territory.region}</div>
          <div className="territory-coords">
            {territory.lat?.toFixed(2)}°, {territory.lng?.toFixed(2)}° · {territory.area ? `${(territory.area/1000).toFixed(0)}K km²` : ''}
          </div>
        </div>
      ) : (
        <div style={{ padding:'16px', borderBottom:'1px solid var(--border-light)' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'15px', color:'var(--ink-muted)', fontStyle:'italic' }}>
            Ningún territorio seleccionado
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--ink-faint)', marginTop:'4px' }}>
            Haz clic en el globo o busca un país
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="tab-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {renderPanel()}
      </div>
    </aside>
  );
}
