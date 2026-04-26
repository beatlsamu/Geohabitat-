// ═══════════════════════════════════════════════════════════
//  ATLAS TERRITORIAL · Motor de Scoring
//  Todos los cálculos son transparentes y documentados
// ═══════════════════════════════════════════════════════════

/**
 * SCORING DE HABITABILIDAD
 * Fórmula: weighted average de factores clave
 *
 * Pesos:
 *   - Confort climático:    20%
 *   - Calidad del aire:     15%
 *   - Disponibilidad agua:  15%
 *   - Riesgo ambiental:     20% (inverso)
 *   - Energía sostenible:   10%
 *   - Conectividad/PIB:     10%
 *   - Presión humana:       10% (inverso)
 */
export function calcHabitabilityScore(data) {
  if (!data) return { score: null, confidence: 'none', breakdown: [] };

  const c = data.climate || {};
  const e = data.energy || {};
  const aq = data.airQuality || {};
  const w = data.water || {};
  const r = data.risk || {};

  // Confort climático (0-100): mejor entre 12-22°C, 40-70% humedad
  const tempComfort = calcThermalComfort(c.tempMean, c.humidity);

  // Calidad del aire (0-100): basado en PM2.5
  const airScore = calcAirScore(aq.pm25);

  // Agua (0-100): disponibilidad directa
  const waterScore = w.availability || 50;

  // Riesgo (0-100): promedio invertido de riesgos
  const riskScore = 100 - calcRiskIndex(r);

  // Energía (0-100): % renovable + potencial
  const energyScore = calcEnergyScore(e);

  // PIB per cápita normalizado (0-100)
  const gdpScore = Math.min(100, (data.gdpPerCapita || 5000) / 1000);

  // Presión humana (0-100): invertida
  const pressureScore = 100 - calcHumanPressure(data.population, data.area);

  const weights = [0.20, 0.15, 0.15, 0.20, 0.10, 0.10, 0.10];
  const values  = [tempComfort, airScore, waterScore, riskScore, energyScore, gdpScore, pressureScore];

  const score = Math.round(
    values.reduce((sum, v, i) => sum + v * weights[i], 0)
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    confidence: 'medium',
    breakdown: [
      { name: 'Confort climático',    value: Math.round(tempComfort),  weight: 20, color: '#5A8A6A' },
      { name: 'Calidad del aire',     value: Math.round(airScore),     weight: 15, color: '#3B7F7F' },
      { name: 'Disponibilidad agua',  value: Math.round(waterScore),   weight: 15, color: '#4A7096' },
      { name: 'Seguridad ambiental',  value: Math.round(riskScore),    weight: 20, color: '#C49A27' },
      { name: 'Energía sostenible',   value: Math.round(energyScore),  weight: 10, color: '#8B6F4A' },
      { name: 'Desarrollo económico', value: Math.round(gdpScore),     weight: 10, color: '#6B5B8A' },
      { name: 'Baja saturación',      value: Math.round(pressureScore),weight: 10, color: '#B85A3A' },
    ]
  };
}

function calcThermalComfort(tempMean, humidity) {
  if (tempMean == null) return 50;
  // Óptimo: 15-20°C, 50-65% humedad
  const tempScore = 100 - Math.min(100, Math.abs(tempMean - 17.5) * 4.5);
  const humScore  = humidity ? 100 - Math.min(100, Math.abs(humidity - 57) * 1.5) : 60;
  return (tempScore * 0.7 + humScore * 0.3);
}

function calcAirScore(pm25) {
  if (pm25 == null) return 55;
  // WHO guideline: 5 µg/m³ = 100 pts; 75 µg/m³ = 0 pts
  return Math.max(0, Math.min(100, 100 - (pm25 / 75) * 100));
}

function calcRiskIndex(risk) {
  if (!risk) return 30;
  const levels = { none: 0, very_low: 5, low: 15, moderate: 40, high: 65, very_high: 85 };
  const keys = ['earthquake', 'tsunami', 'wildfire', 'flood', 'volcanic'];
  const vals = keys.map(k => levels[risk[k]] || 20);
  return vals.reduce((s, v) => s + v, 0) / keys.length;
}

export function calcEnergyScore(e) {
  if (!e) return 40;
  const renewable = (e.renewableShare || 20) / 100;
  const solar = Math.min(10, e.solarPotential || 4) / 10;
  const wind  = Math.min(10, e.windPotential  || 4) / 10;
  return Math.round((renewable * 0.5 + solar * 0.25 + wind * 0.25) * 100);
}

function calcHumanPressure(population, area) {
  if (!population || !area) return 30;
  const density = population / area;
  // Normalizar: >500 p/km² = 100, <1 p/km² = 0
  return Math.min(100, (density / 500) * 100);
}

/**
 * SCORING DE PRESIÓN HUMANA
 */
export function calcHumanPressureScore(data) {
  if (!data) return { score: null, confidence: 'none', breakdown: [] };

  const densityScore = Math.min(100, ((data.population || 0) / (data.area || 1)) / 5);
  const urbanScore   = 50; // fallback
  const growthScore  = 30; // fallback

  const score = Math.round(densityScore * 0.5 + urbanScore * 0.3 + growthScore * 0.2);

  return {
    score: Math.max(0, Math.min(100, score)),
    confidence: 'low',
    breakdown: [
      { name: 'Densidad poblacional', value: Math.round(densityScore), weight: 50, color: '#B85A3A' },
      { name: 'Urbanización',         value: urbanScore,               weight: 30, color: '#C49A27' },
      { name: 'Crecimiento',          value: growthScore,              weight: 20, color: '#8B6F4A' },
    ]
  };
}

/**
 * FRICCIÓN DIARIA
 * Mide dificultad de vida cotidiana
 */
export function calcDailyFriction(data) {
  if (!data) return { score: null, confidence: 'none', breakdown: [] };

  const aq = data.airQuality || {};
  const c  = data.climate || {};

  const heatStress  = calcHeatStress(c.tempMax, c.humidity);
  const airPenalty  = aq.pm25 ? Math.min(100, (aq.pm25 / 50) * 100) : 30;
  const riskPenalty = calcRiskIndex(data.risk || {});

  const score = Math.round((heatStress * 0.3 + airPenalty * 0.4 + riskPenalty * 0.3));

  return {
    score: Math.max(0, Math.min(100, score)),
    confidence: 'medium',
    breakdown: [
      { name: 'Estrés térmico',    value: Math.round(heatStress),  weight: 30, color: '#C49A27' },
      { name: 'Contaminación',     value: Math.round(airPenalty),  weight: 40, color: '#B85A3A' },
      { name: 'Riesgos activos',   value: Math.round(riskPenalty), weight: 30, color: '#8B6F4A' },
    ]
  };
}

function calcHeatStress(tempMax, humidity) {
  if (!tempMax) return 20;
  if (tempMax < 28) return 10;
  if (tempMax < 33) return 30;
  if (tempMax < 38) return 60;
  return 85;
}

/**
 * VULNERABILIDAD FUTURA (2050)
 */
export function calcFutureVulnerability(data) {
  if (!data) return { score: null, scenarios: [] };

  const c  = data.climate || {};
  const w  = data.water   || {};
  const r  = data.risk    || {};

  const tempRise      = (c.tempMean || 15) + 1.5;  // +1.5°C por cambio climático
  const waterStress   = Math.min(100, (w.stress || 30) * 1.4);
  const wildfireRisk  = r.wildfire === 'very_high' ? 90 : r.wildfire === 'high' ? 70 : 40;
  const floodRisk     = r.flood    === 'very_high' ? 85 : r.flood    === 'high' ? 65 : 35;

  const score = Math.round(
    waterStress * 0.35 +
    wildfireRisk * 0.25 +
    floodRisk * 0.25 +
    Math.min(100, (c.tempMean || 15) * 3) * 0.15
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    confidence: 'low',
    scenarios: [
      { year: 2030, delta: -3,  label: 'Temperatura media',   unit: '+°C', icon: '🌡️', severity: 'warn' },
      { year: 2040, delta: -8,  label: 'Disponibilidad agua', unit: '%',   icon: '💧', severity: 'critical' },
      { year: 2050, delta: -12, label: 'Habitabilidad',       unit: 'pts', icon: '🏘️', severity: 'critical' },
      { year: 2050, delta: +18, label: 'Estrés hídrico',      unit: '%',   icon: '🏜️', severity: 'critical' },
      { year: 2050, delta: +25, label: 'Riesgo incendios',    unit: '%',   icon: '🔥', severity: 'warn' },
    ]
  };
}

/**
 * RESILIENCIA TERRITORIAL
 */
export function calcResilience(data) {
  if (!data) return { score: null };

  const gdpScore = Math.min(100, (data.gdpPerCapita || 5000) / 800);
  const waterRes = data.water?.availability || 50;
  const energyRes = calcEnergyScore(data.energy);

  const score = Math.round(gdpScore * 0.4 + waterRes * 0.3 + energyRes * 0.3);

  return {
    score: Math.max(0, Math.min(100, score)),
    confidence: 'medium'
  };
}

/**
 * SCORE GLOBAL COMPUESTO
 */
export function calcGlobalScore(data) {
  if (!data) return null;

  const hab  = calcHabitabilityScore(data).score   || 50;
  const pres = calcHumanPressureScore(data).score  || 50;
  const fric = calcDailyFriction(data).score       || 50;
  const futu = calcFutureVulnerability(data).score || 50;
  const res  = calcResilience(data).score          || 50;

  return Math.round(
    hab  * 0.30 +
    (100 - pres) * 0.15 +
    (100 - fric) * 0.20 +
    (100 - futu) * 0.20 +
    res  * 0.15
  );
}

/**
 * GENOMA TERRITORIAL
 * Construye el conjunto de genes de un territorio
 */
export function buildTerritorialGenome(data) {
  if (!data) return [];

  const c  = data.climate    || {};
  const e  = data.energy     || {};
  const aq = data.airQuality || {};
  const w  = data.water      || {};
  const r  = data.risk       || {};

  return [
    // Clima
    { category: 'clima', gene: 'temp_media',    label: 'Temperatura media',     value: c.tempMean,       unit: '°C',    source: 'NASA POWER',    confidence: 'high',      description: 'Temperatura media anual del territorio' },
    { category: 'clima', gene: 'temp_max',      label: 'Temperatura máxima',    value: c.tempMax,        unit: '°C',    source: 'NASA POWER',    confidence: 'high',      description: 'Temperatura máxima media mensual' },
    { category: 'clima', gene: 'temp_min',      label: 'Temperatura mínima',    value: c.tempMin,        unit: '°C',    source: 'NASA POWER',    confidence: 'high',      description: 'Temperatura mínima media mensual' },
    { category: 'clima', gene: 'humedad',       label: 'Humedad relativa',      value: c.humidity,       unit: '%',     source: 'Open-Meteo',    confidence: 'high',      description: 'Humedad relativa media anual' },
    { category: 'clima', gene: 'precipitacion', label: 'Precipitación anual',   value: c.precipitation,  unit: 'mm/año',source: 'ERA5',          confidence: 'high',      description: 'Precipitación media anual acumulada' },
    { category: 'clima', gene: 'radiacion',     label: 'Radiación solar',       value: c.solarIrradiation,unit:'kWh/m²/d',source:'NASA POWER',  confidence: 'high',      description: 'Irradiación horizontal global media diaria' },
    { category: 'clima', gene: 'viento',        label: 'Velocidad del viento',  value: c.windSpeed,      unit: 'm/s',   source: 'NASA POWER',    confidence: 'high',      description: 'Velocidad media del viento a 10m' },

    // Aire
    { category: 'aire',  gene: 'pm25',          label: 'PM2.5',                 value: aq.pm25,          unit: 'µg/m³', source: 'OpenAQ',        confidence: aq.pm25 ? 'high' : 'estimated', description: 'Partículas finas menores de 2.5 µm (WHO: <5 µg/m³)' },
    { category: 'aire',  gene: 'pm10',          label: 'PM10',                  value: aq.pm10,          unit: 'µg/m³', source: 'OpenAQ',        confidence: aq.pm10 ? 'high' : 'estimated', description: 'Partículas gruesas menores de 10 µm' },
    { category: 'aire',  gene: 'aqi',           label: 'Índice de calidad',     value: aq.aqi,           unit: 'AQI',   source: 'OpenAQ',        confidence: 'medium',    description: 'Air Quality Index — escala 0-500' },

    // Agua
    { category: 'agua',  gene: 'agua_disp',     label: 'Disponibilidad hídrica',value: w.availability,   unit: '%',     source: 'World Bank',    confidence: 'medium',    description: 'Porcentaje de disponibilidad hídrica territorial' },
    { category: 'agua',  gene: 'estres_hidrico',label: 'Estrés hídrico',        value: w.stress,         unit: '%',     source: 'Aqueduct',      confidence: 'medium',    description: 'Presión sobre recursos hídricos disponibles' },

    // Energía
    { category: 'energia',gene:'solar_pot',     label: 'Potencial solar',       value: e.solarPotential, unit: 'kWh/m²/d',source:'NASA POWER',   confidence: 'high',      description: 'Potencial de generación solar fotovoltaica' },
    { category: 'energia',gene:'eolico_pot',    label: 'Potencial eólico',      value: e.windPotential,  unit: '/10',   source: 'Global Wind Atlas',confidence:'medium',  description: 'Índice de potencial de generación eólica' },
    { category: 'energia',gene:'renov_share',   label: 'Energía renovable',     value: e.renewableShare, unit: '%',     source: 'IEA / CNE',     confidence: 'medium',    description: 'Participación de renovables en la matriz energética' },

    // Población
    { category: 'poblacion',gene:'poblacion',   label: 'Población total',       value: data.population,  unit: 'hab',   source: 'World Bank',    confidence: 'high',      description: 'Población total estimada (último censo disponible)' },
    { category: 'poblacion',gene:'densidad',    label: 'Densidad poblacional',  value: data.population && data.area ? Math.round(data.population / data.area) : null, unit:'hab/km²',source:'INE/World Bank',confidence:'high', description:'Habitantes por kilómetro cuadrado' },
    { category: 'poblacion',gene:'pib_percapita',label:'PIB per cápita',        value: data.gdpPerCapita,unit: 'USD',   source: 'World Bank',    confidence: 'high',      description: 'Producto Interno Bruto per cápita en USD (PPP)' },
  ].filter(g => g.value != null);
}

export const BIOLOGICAL_PROFILES = {
  respiratorio: {
    name: 'Perfil respiratorio sensible',
    icon: '🫁',
    description: 'Estimación de condiciones para personas con sensibilidad respiratoria',
    calc: (data) => {
      const aq = data?.airQuality || {};
      const pm25 = aq.pm25 || 20;
      if (pm25 < 10) return { level: 'Favorable', score: 85, color: '#5A8A6A' };
      if (pm25 < 25) return { level: 'Moderado',  score: 60, color: '#C49A27' };
      if (pm25 < 50) return { level: 'Desfavorable', score: 35, color: '#8B6F4A' };
      return { level: 'Crítico', score: 15, color: '#B85A3A' };
    }
  },
  termico: {
    name: 'Perfil de estrés térmico',
    icon: '🌡️',
    description: 'Evaluación de exposición a calor y frío extremos',
    calc: (data) => {
      const tempMax = data?.climate?.tempMax || 25;
      if (tempMax < 28) return { level: 'Confortable', score: 88, color: '#5A8A6A' };
      if (tempMax < 33) return { level: 'Moderado',    score: 62, color: '#C49A27' };
      if (tempMax < 38) return { level: 'Elevado',     score: 38, color: '#8B6F4A' };
      return { level: 'Severo', score: 18, color: '#B85A3A' };
    }
  },
  hidrico: {
    name: 'Perfil de vulnerabilidad hídrica',
    icon: '💧',
    description: 'Acceso a agua potable y disponibilidad hídrica sostenible',
    calc: (data) => {
      const avail = data?.water?.availability || 50;
      if (avail > 75) return { level: 'Seguro',     score: 90, color: '#5A8A6A' };
      if (avail > 55) return { level: 'Adecuado',   score: 68, color: '#3B7F7F' };
      if (avail > 35) return { level: 'Limitado',   score: 42, color: '#C49A27' };
      return { level: 'Crítico', score: 20, color: '#B85A3A' };
    }
  },
  climatico: {
    name: 'Perfil de adaptación climática',
    icon: '🌿',
    description: 'Capacidad del territorio para sostener poblaciones en escenarios de cambio climático',
    calc: (data) => {
      const hab = data?.scores?.habitability || 50;
      if (hab > 75) return { level: 'Alta capacidad',  score: 82, color: '#5A8A6A' };
      if (hab > 60) return { level: 'Media',           score: 62, color: '#3B7F7F' };
      if (hab > 45) return { level: 'Baja',            score: 40, color: '#C49A27' };
      return { level: 'Crítica', score: 20, color: '#B85A3A' };
    }
  },
};
