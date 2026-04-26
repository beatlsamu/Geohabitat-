import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { FALLBACK_COUNTRIES, getScoreColor } from '../data/fallback.js';

// ISO numeric → ISO alpha-2 (subset for our dataset)
const NUM_TO_A2 = {
  '032':'AR','036':'AU','076':'BR','124':'CA','152':'CL','156':'CN',
  '276':'DE','356':'IN','392':'JP','578':'NO','710':'ZA','752':'SE',
  '826':'GB','840':'US','250':'FR','380':'IT','484':'MX','566':'NG',
  '643':'RU','410':'KR','682':'SA','764':'TH','792':'TR','818':'EG',
  '144':'LK','702':'SG','528':'NL','724':'ES','616':'PL','620':'PT',
  '040':'AT','756':'CH','056':'BE','208':'DK','246':'FI','372':'IE',
  '100':'BG','191':'HR','703':'SK','203':'CZ','348':'HU','642':'RO',
  '300':'GR','604':'PE','858':'UY','170':'CO','600':'PY','068':'BO',
  '218':'EC','862':'VE','320':'GT','340':'HN','188':'CR','192':'CU',
  '050':'BD','360':'ID','458':'MY','608':'PH','704':'VN',
  '012':'DZ','024':'AO','231':'ET','288':'GH','404':'KE','430':'LR',
  '434':'LY','504':'MA','508':'MZ','562':'NE','646':'RW','686':'SN',
  '729':'SD','834':'TZ','800':'UG','894':'ZM','716':'ZW',
};

function numToA2(id) {
  return NUM_TO_A2[String(id || '').padStart(3,'0')] || null;
}

export default function Globe3D({ onCountrySelect, selectedCode, mode = 'habitability' }) {
  const svgRef    = useRef(null);
  const wrapRef   = useRef(null);
  const stateRef  = useRef({
    rotation: [-70, 33, 0],
    scale: 1,
    features: [],
    dragging: false,
    dragStart: null,
    rotStart: null,
    autoTimer: null,
    animFrame: null,
  });

  const [loaded, setLoaded]   = useState(false);
  const [loadErr, setLoadErr] = useState(false);
  const [dims, setDims]       = useState({ w: 700, h: 560 });
  const [tooltip, setTooltip] = useState(null);

  // Measure container
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (!wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      if (r.width > 0) setDims({ w: r.width, h: r.height });
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Load geodata — try topojson, fallback to geojson
  useEffect(() => {
    const topoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
    const geoUrl  = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';

    fetch(topoUrl)
      .then(r => r.json())
      .then(async topo => {
        try {
          const { feature } = await import('topojson-client');
          stateRef.current.features = feature(topo, topo.objects.countries).features;
        } catch {
          stateRef.current.features = [];
        }
        setLoaded(true);
      })
      .catch(() => {
        fetch(geoUrl)
          .then(r => r.json())
          .then(geo => {
            stateRef.current.features = geo.features || [];
            setLoaded(true);
          })
          .catch(() => setLoadErr(true));
      });
  }, []);

  const getScore = useCallback((a2) => {
    const d = FALLBACK_COUNTRIES[a2];
    if (!d) return null;
    if (mode === 'habitability')  return d.scores?.habitability;
    if (mode === 'humanPressure') return d.scores?.humanPressure;
    if (mode === 'energy')        return d.scores?.sustainableEnergy;
    if (mode === 'risk')          return 100 - (d.scores?.futureVulnerability ?? 50);
    return d.scores?.globalScore;
  }, [mode]);

  // Main render
  useEffect(() => {
    if (!loaded || !svgRef.current) return;
    const st = stateRef.current;
    const { w, h } = dims;
    const R  = Math.min(w, h) * 0.42;
    const cx = w / 2, cy = h / 2;

    const svg = d3.select(svgRef.current).attr('width', w).attr('height', h);
    svg.selectAll('*').remove();

    // ── Projection ──────────────────────────────────────────
    const proj = d3.geoOrthographic()
      .scale(R * st.scale)
      .translate([cx, cy])
      .clipAngle(90)
      .rotate(st.rotation);

    const pathFn = d3.geoPath().projection(proj);

    // ── Defs ────────────────────────────────────────────────
    const defs = svg.append('defs');
    const oceanGrad = defs.append('radialGradient').attr('id','ocean-grad').attr('cx','40%').attr('cy','35%');
    oceanGrad.append('stop').attr('offset','0%').attr('stop-color','#D6E8F5');
    oceanGrad.append('stop').attr('offset','100%').attr('stop-color','#A8C5DE');

    const atmGrad = defs.append('radialGradient').attr('id','atm-grad').attr('cx','50%').attr('cy','50%');
    atmGrad.append('stop').attr('offset','70%').attr('stop-color','transparent');
    atmGrad.append('stop').attr('offset','100%').attr('stop-color','rgba(180,210,240,0.25)');

    // ── Ocean ────────────────────────────────────────────────
    const sphere = svg.append('circle')
      .attr('cx',cx).attr('cy',cy).attr('r', R * st.scale)
      .attr('fill','url(#ocean-grad)');

    // ── Graticule ────────────────────────────────────────────
    const grat = d3.geoGraticule().step([20,20]);
    const gratG = svg.append('path')
      .datum(grat())
      .attr('d', pathFn)
      .attr('fill','none')
      .attr('stroke','rgba(120,160,200,0.2)')
      .attr('stroke-width',0.6);

    // Equator
    svg.append('path')
      .datum({ type:'Feature', geometry:{ type:'LineString', coordinates: d3.range(-180,180,1).map(x=>[x,0]) }})
      .attr('d', pathFn)
      .attr('fill','none')
      .attr('stroke','rgba(120,160,200,0.4)')
      .attr('stroke-width',1)
      .attr('stroke-dasharray','4 4');

    // ── Countries ─────────────────────────────────────────────
    const countriesG = svg.append('g');

    countriesG.selectAll('path')
      .data(st.features)
      .join('path')
      .attr('d', pathFn)
      .attr('fill', d => {
        const a2 = numToA2(d.id) || d.properties?.iso_a2 || d.properties?.ISO_A2;
        if (a2 === selectedCode) return '#4A7096';
        const score = getScore(a2);
        if (score == null) return '#CFC8B5';
        return getScoreColor(score);
      })
      .attr('fill-opacity', d => {
        const a2 = numToA2(d.id) || d.properties?.iso_a2 || d.properties?.ISO_A2;
        return a2 === selectedCode ? 1 : 0.78;
      })
      .attr('stroke','rgba(80,60,40,0.5)')
      .attr('stroke-width',0.4)
      .style('cursor','pointer')
      .on('mouseover', function(event, d) {
        const a2 = numToA2(d.id) || d.properties?.iso_a2 || d.properties?.ISO_A2;
        const c  = FALLBACK_COUNTRIES[a2];
        if (c) setTooltip({ x: event.offsetX, y: event.offsetY, country: c });
        d3.select(this).attr('stroke','#4A7096').attr('stroke-width',1.5).attr('fill-opacity',1);
      })
      .on('mousemove', function(event) {
        setTooltip(p => p ? { ...p, x: event.offsetX, y: event.offsetY } : null);
      })
      .on('mouseout', function(event, d) {
        const a2 = numToA2(d.id) || d.properties?.iso_a2 || d.properties?.ISO_A2;
        setTooltip(null);
        d3.select(this).attr('stroke','rgba(80,60,40,0.5)').attr('stroke-width',0.4)
          .attr('fill-opacity', a2 === selectedCode ? 1 : 0.78);
      })
      .on('click', function(event, d) {
        const a2 = numToA2(d.id) || d.properties?.iso_a2 || d.properties?.ISO_A2;
        const c  = FALLBACK_COUNTRIES[a2];
        if (!c) return;
        stopAuto();
        onCountrySelect?.(a2, c.lat, c.lng, c.name);
        // Smooth fly-to
        const target = [-c.lng, -c.lat, 0];
        const from   = [...proj.rotate()];
        let t = 0;
        const fly = () => {
          t += 0.025;
          if (t >= 1) { st.rotation = target; redraw(); return; }
          const e = d3.easeCubicInOut(t);
          st.rotation = [
            from[0] + (target[0] - from[0]) * e,
            from[1] + (target[1] - from[1]) * e,
            0,
          ];
          redraw();
          st.animFrame = requestAnimationFrame(fly);
        };
        st.animFrame = requestAnimationFrame(fly);
      });

    // ── Selected marker ──────────────────────────────────────
    if (selectedCode) {
      const c = FALLBACK_COUNTRIES[selectedCode];
      if (c) {
        const pt = proj([c.lng, c.lat]);
        if (pt) {
          svg.append('circle')
            .attr('cx', pt[0]).attr('cy', pt[1]).attr('r', 7)
            .attr('fill','none').attr('stroke','#4A7096').attr('stroke-width',2.5).attr('opacity',0.9);
          svg.append('circle')
            .attr('cx', pt[0]).attr('cy', pt[1]).attr('r', 3)
            .attr('fill','#4A7096').attr('opacity',0.9);
        }
      }
    }

    // ── Atmosphere ───────────────────────────────────────────
    svg.append('circle')
      .attr('cx',cx).attr('cy',cy).attr('r', R * st.scale + 6)
      .attr('fill','none')
      .attr('stroke','rgba(160,200,230,0.4)')
      .attr('stroke-width',8);

    // ── Vintage border rings ──────────────────────────────────
    svg.append('circle').attr('cx',cx).attr('cy',cy).attr('r', R * st.scale)
      .attr('fill','none').attr('stroke','#B0A488').attr('stroke-width',1.5);
    svg.append('circle').attr('cx',cx).attr('cy',cy).attr('r', R * st.scale + 8)
      .attr('fill','none').attr('stroke','#D4C9B0').attr('stroke-width',0.5);
    svg.append('circle').attr('cx',cx).attr('cy',cy).attr('r', R * st.scale + 14)
      .attr('fill','none').attr('stroke','#E8E0D0').attr('stroke-width',0.5);

    // ── Redraw function (for drag/zoom) ────────────────────────
    function redraw() {
      const curR = R * st.scale;
      proj.rotate(st.rotation).scale(curR);
      sphere.attr('r', curR);
      gratG.attr('d', pathFn);
      countriesG.selectAll('path').attr('d', pathFn);
      svg.selectAll('circle.sel-ring,circle.sel-dot').remove();
      if (selectedCode) {
        const c = FALLBACK_COUNTRIES[selectedCode];
        if (c) {
          const pt = proj([c.lng, c.lat]);
          if (pt) {
            svg.append('circle').attr('class','sel-ring')
              .attr('cx',pt[0]).attr('cy',pt[1]).attr('r',7)
              .attr('fill','none').attr('stroke','#4A7096').attr('stroke-width',2.5).attr('opacity',0.9);
            svg.append('circle').attr('class','sel-dot')
              .attr('cx',pt[0]).attr('cy',pt[1]).attr('r',3)
              .attr('fill','#4A7096').attr('opacity',0.9);
          }
        }
      }
    }

    // ── Drag ─────────────────────────────────────────────────
    const drag = d3.drag()
      .on('start', e => {
        stopAuto();
        st.dragging  = true;
        st.dragStart = [e.x, e.y];
        st.rotStart  = [...st.rotation];
        svg.style('cursor','grabbing');
      })
      .on('drag', e => {
        const dx = e.x - st.dragStart[0];
        const dy = e.y - st.dragStart[1];
        const k  = 90 / (R * st.scale);
        st.rotation = [
          st.rotStart[0] + dx * k,
          Math.max(-80, Math.min(80, st.rotStart[1] - dy * k)),
          0,
        ];
        redraw();
      })
      .on('end', () => { st.dragging = false; svg.style('cursor','grab'); });

    svg.call(drag);

    // ── Zoom ─────────────────────────────────────────────────
    svg.on('wheel.zoom', e => {
      e.preventDefault();
      st.scale = Math.max(0.5, Math.min(5, st.scale * (e.deltaY < 0 ? 1.12 : 0.89)));
      redraw();
    });

    // ── Auto-rotate ───────────────────────────────────────────
    st.autoTimer = setInterval(() => {
      if (!st.dragging) {
        st.rotation[0] += 0.12;
        redraw();
      }
    }, 50);

    function stopAuto() {
      if (st.autoTimer) { clearInterval(st.autoTimer); st.autoTimer = null; }
      if (st.animFrame) { cancelAnimationFrame(st.animFrame); st.animFrame = null; }
    }

    return () => {
      stopAuto();
      svg.on('wheel.zoom', null);
    };
  }, [loaded, dims, selectedCode, mode, getScore, onCountrySelect]);

  const modeName = { habitability:'HABITABILIDAD', humanPressure:'PRESIÓN HUMANA', energy:'ENERGÍA SOST.', risk:'SEGURIDAD' }[mode] || 'SCORE GLOBAL';

  return (
    <div ref={wrapRef} className="globe-wrap" style={{ position:'relative', width:'100%', height:'100%', overflow:'hidden',
      background:'linear-gradient(135deg, #F5F0E8 0%, #EDE8DC 100%)' }}>

      {/* Grid texture */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:`linear-gradient(var(--border-light) 1px,transparent 1px),linear-gradient(90deg,var(--border-light) 1px,transparent 1px)`,
        backgroundSize:'48px 48px', opacity:0.35 }} />

      {/* Atlas watermark */}
      <div style={{ position:'absolute', top:14, left:'50%', transform:'translateX(-50%)',
        fontFamily:'var(--font-display)', fontSize:'11px', fontStyle:'italic',
        color:'rgba(30,26,20,0.28)', letterSpacing:'0.12em', pointerEvents:'none', whiteSpace:'nowrap', zIndex:5 }}>
        Atlas Territorial · Motor de Habitabilidad Global
      </div>

      {/* Cardinal points */}
      {loaded && <>
        <div style={{ position:'absolute', top:'50%', left:16, transform:'translateY(-50%)', fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--ink-faint)', letterSpacing:'0.1em', pointerEvents:'none' }}>W</div>
        <div style={{ position:'absolute', top:'50%', right:16, transform:'translateY(-50%)', fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--ink-faint)', letterSpacing:'0.1em', pointerEvents:'none' }}>E</div>
        <div style={{ position:'absolute', top:40, left:'50%', transform:'translateX(-50%)', fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--ink-faint)', letterSpacing:'0.1em', pointerEvents:'none' }}>N</div>
        <div style={{ position:'absolute', bottom:60, left:'50%', transform:'translateX(-50%)', fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--ink-faint)', letterSpacing:'0.1em', pointerEvents:'none' }}>S</div>
      </>}

      {/* Globe SVG */}
      {loadErr ? (
        <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px' }}>
          <div style={{ fontSize:'48px', opacity:0.4 }}>🌍</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--ink-muted)' }}>Geodatos no disponibles · usa el panel lateral</div>
        </div>
      ) : !loaded ? (
        <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px' }}>
          <div className="spinner-ring" style={{ width:'36px', height:'36px', borderWidth:'2px' }} />
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--ink-muted)', letterSpacing:'0.1em' }}>CARGANDO GEODATOS…</div>
        </div>
      ) : (
        <svg ref={svgRef} style={{ display:'block', cursor:'grab', userSelect:'none' }} />
      )}

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position:'absolute',
          left: Math.min(tooltip.x + 14, dims.w - 210),
          top:  Math.max(tooltip.y - 90, 8),
          background:'rgba(250,250,245,0.97)',
          border:'1px solid var(--border)',
          borderRadius:'var(--r-md)',
          padding:'10px 14px',
          pointerEvents:'none',
          boxShadow:'var(--shadow-md)',
          zIndex:100, minWidth:'190px',
        }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'14px', fontWeight:700, marginBottom:'8px' }}>
            {tooltip.country.flag} {tooltip.country.name}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
            {[['Score Global',tooltip.country.scores?.globalScore],['Habitabilidad',tooltip.country.scores?.habitability],['Energía',tooltip.country.scores?.sustainableEnergy],['Resiliencia',tooltip.country.scores?.resilience]].map(([l,v])=>(
              <div key={l}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:'8px', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--ink-faint)' }}>{l}</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'18px', fontWeight:700, color:getScoreColor(v), lineHeight:1 }}>{v??'—'}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--ink-faint)', marginTop:'6px', paddingTop:'5px', borderTop:'1px solid var(--border-light)' }}>
            Clic para explorar →
          </div>
        </div>
      )}

      {/* Bottom overlay */}
      <div className="globe-overlay-info">
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.06em', color:'var(--ink-muted)' }}>
          Arrastra · Scroll zoom · Clic para seleccionar
        </span>
      </div>

      {/* Legend */}
      <div className="globe-legend">
        <div className="legend-title">{modeName}</div>
        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--terracotta)' }}>0</span>
          <div className="legend-gradient" />
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--sage)' }}>100</span>
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'8px', color:'var(--ink-faint)', marginTop:'3px', textAlign:'center' }}>
          {Object.keys(FALLBACK_COUNTRIES).length} países indexados
        </div>
      </div>
    </div>
  );
}
