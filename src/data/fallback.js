// ═══════════════════════════════════════════════════════════
//  ATLAS TERRITORIAL · Datos de Referencia y Fallback
//  Valores basados en fuentes públicas verificables
//  Actualización de referencia: 2024
// ═══════════════════════════════════════════════════════════

export const FALLBACK_COUNTRIES = {
  CL: {
    code: 'CL', name: 'Chile', flag: '🇨🇱', region: 'South America',
    lat: -33.45, lng: -70.67,
    population: 19629590, area: 756102, gdpPerCapita: 16352,
    climate: { tempMean: 13.5, tempMax: 25, tempMin: 4, humidity: 65, precipitation: 312, solarIrradiation: 5.8, windSpeed: 4.2 },
    energy: { solarPotential: 8.5, windPotential: 7.2, renewableShare: 54, consumption: 3800 },
    airQuality: { pm25: 18.4, pm10: 32.1, aqi: 62 },
    water: { availability: 72, stress: 28, drought: 'moderate' },
    risk: { earthquake: 'very_high', tsunami: 'high', wildfire: 'high', flood: 'moderate', volcanic: 'high' },
    scores: { habitability: 71, humanPressure: 58, sustainableEnergy: 76, dailyFriction: 42, environmentalRisk: 45, futureVulnerability: 52, climaticRisk: 48, resilience: 63, globalScore: 65 },
    sources: ['INE Chile 2023', 'NASA POWER', 'CNE Chile', 'SERNAGEOMIN']
  },
  AR: {
    code: 'AR', name: 'Argentina', flag: '🇦🇷', region: 'South America',
    lat: -34.61, lng: -58.38,
    population: 45773884, area: 2780400, gdpPerCapita: 13589,
    climate: { tempMean: 17.8, tempMax: 30, tempMin: 5, humidity: 72, precipitation: 618, solarIrradiation: 5.1, windSpeed: 3.8 },
    energy: { solarPotential: 7.8, windPotential: 8.1, renewableShare: 38, consumption: 3200 },
    airQuality: { pm25: 14.2, pm10: 28.5, aqi: 51 },
    water: { availability: 68, stress: 32, drought: 'low' },
    risk: { earthquake: 'moderate', tsunami: 'low', wildfire: 'moderate', flood: 'high', volcanic: 'moderate' },
    scores: { habitability: 68, humanPressure: 45, sustainableEnergy: 65, dailyFriction: 38, environmentalRisk: 38, futureVulnerability: 48, climaticRisk: 42, resilience: 60, globalScore: 62 },
    sources: ['INDEC 2023', 'NASA POWER', 'CAMMESA']
  },
  BR: {
    code: 'BR', name: 'Brasil', flag: '🇧🇷', region: 'South America',
    lat: -15.78, lng: -47.93,
    population: 215313498, area: 8515767, gdpPerCapita: 9081,
    climate: { tempMean: 26.1, tempMax: 36, tempMin: 18, humidity: 82, precipitation: 1761, solarIrradiation: 5.4, windSpeed: 2.9 },
    energy: { solarPotential: 7.1, windPotential: 6.5, renewableShare: 84, consumption: 2800 },
    airQuality: { pm25: 22.1, pm10: 38.4, aqi: 74 },
    water: { availability: 85, stress: 15, drought: 'low' },
    risk: { earthquake: 'very_low', tsunami: 'low', wildfire: 'very_high', flood: 'very_high', volcanic: 'none' },
    scores: { habitability: 63, humanPressure: 72, sustainableEnergy: 82, dailyFriction: 55, environmentalRisk: 62, futureVulnerability: 65, climaticRisk: 58, resilience: 55, globalScore: 61 },
    sources: ['IBGE 2023', 'NASA POWER', 'ANEEL Brasil']
  },
  NO: {
    code: 'NO', name: 'Noruega', flag: '🇳🇴', region: 'Europe',
    lat: 59.91, lng: 10.75,
    population: 5421242, area: 385207, gdpPerCapita: 89202,
    climate: { tempMean: 5.8, tempMax: 18, tempMin: -5, humidity: 78, precipitation: 1414, solarIrradiation: 2.4, windSpeed: 5.8 },
    energy: { solarPotential: 3.2, windPotential: 9.4, renewableShare: 98, consumption: 26000 },
    airQuality: { pm25: 4.8, pm10: 10.2, aqi: 18 },
    water: { availability: 95, stress: 5, drought: 'none' },
    risk: { earthquake: 'low', tsunami: 'low', wildfire: 'low', flood: 'moderate', volcanic: 'none' },
    scores: { habitability: 91, humanPressure: 18, sustainableEnergy: 96, dailyFriction: 12, environmentalRisk: 15, futureVulnerability: 22, climaticRisk: 35, resilience: 92, globalScore: 88 },
    sources: ['Statistics Norway 2023', 'NASA POWER', 'Statnett']
  },
  DE: {
    code: 'DE', name: 'Alemania', flag: '🇩🇪', region: 'Europe',
    lat: 52.52, lng: 13.41,
    population: 83197430, area: 357592, gdpPerCapita: 48432,
    climate: { tempMean: 9.6, tempMax: 22, tempMin: -1, humidity: 80, precipitation: 700, solarIrradiation: 3.1, windSpeed: 4.5 },
    energy: { solarPotential: 3.8, windPotential: 7.8, renewableShare: 52, consumption: 7200 },
    airQuality: { pm25: 10.2, pm10: 19.8, aqi: 35 },
    water: { availability: 78, stress: 22, drought: 'low' },
    risk: { earthquake: 'low', tsunami: 'none', wildfire: 'low', flood: 'moderate', volcanic: 'none' },
    scores: { habitability: 85, humanPressure: 62, sustainableEnergy: 74, dailyFriction: 28, environmentalRisk: 25, futureVulnerability: 38, climaticRisk: 42, resilience: 80, globalScore: 79 },
    sources: ['Destatis 2023', 'NASA POWER', 'Bundesnetzagentur']
  },
  JP: {
    code: 'JP', name: 'Japón', flag: '🇯🇵', region: 'Asia',
    lat: 35.69, lng: 139.69,
    population: 125124989, area: 377973, gdpPerCapita: 33815,
    climate: { tempMean: 15.4, tempMax: 32, tempMin: 0, humidity: 75, precipitation: 1668, solarIrradiation: 3.9, windSpeed: 3.2 },
    energy: { solarPotential: 4.5, windPotential: 5.1, renewableShare: 22, consumption: 8600 },
    airQuality: { pm25: 11.8, pm10: 24.3, aqi: 42 },
    water: { availability: 82, stress: 18, drought: 'low' },
    risk: { earthquake: 'very_high', tsunami: 'very_high', wildfire: 'low', flood: 'very_high', volcanic: 'high' },
    scores: { habitability: 75, humanPressure: 78, sustainableEnergy: 45, dailyFriction: 35, environmentalRisk: 72, futureVulnerability: 58, climaticRisk: 62, resilience: 82, globalScore: 70 },
    sources: ['Statistics Japan 2023', 'NASA POWER', 'METI Japan']
  },
  US: {
    code: 'US', name: 'Estados Unidos', flag: '🇺🇸', region: 'North America',
    lat: 38.89, lng: -77.03,
    population: 331893745, area: 9833517, gdpPerCapita: 63544,
    climate: { tempMean: 12.2, tempMax: 28, tempMin: -2, humidity: 66, precipitation: 715, solarIrradiation: 4.8, windSpeed: 3.9 },
    energy: { solarPotential: 5.9, windPotential: 7.4, renewableShare: 21, consumption: 12800 },
    airQuality: { pm25: 8.1, pm10: 16.4, aqi: 29 },
    water: { availability: 64, stress: 36, drought: 'moderate' },
    risk: { earthquake: 'moderate', tsunami: 'moderate', wildfire: 'high', flood: 'high', volcanic: 'moderate' },
    scores: { habitability: 78, humanPressure: 55, sustainableEnergy: 52, dailyFriction: 32, environmentalRisk: 42, futureVulnerability: 45, climaticRisk: 50, resilience: 72, globalScore: 68 },
    sources: ['US Census 2023', 'NASA POWER', 'EIA']
  },
  IN: {
    code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia',
    lat: 28.63, lng: 77.22,
    population: 1428627663, area: 3287263, gdpPerCapita: 2389,
    climate: { tempMean: 25.1, tempMax: 40, tempMin: 12, humidity: 74, precipitation: 1083, solarIrradiation: 5.6, windSpeed: 3.1 },
    energy: { solarPotential: 7.3, windPotential: 5.8, renewableShare: 21, consumption: 950 },
    airQuality: { pm25: 54.4, pm10: 92.1, aqi: 152 },
    water: { availability: 42, stress: 58, drought: 'high' },
    risk: { earthquake: 'high', tsunami: 'moderate', wildfire: 'moderate', flood: 'very_high', volcanic: 'none' },
    scores: { habitability: 44, humanPressure: 92, sustainableEnergy: 48, dailyFriction: 72, environmentalRisk: 68, futureVulnerability: 78, climaticRisk: 72, resilience: 40, globalScore: 43 },
    sources: ['Census of India 2023', 'NASA POWER', 'MNRE India']
  },
  AU: {
    code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceania',
    lat: -35.28, lng: 149.13,
    population: 26177413, area: 7692024, gdpPerCapita: 53831,
    climate: { tempMean: 22.8, tempMax: 38, tempMin: 8, humidity: 57, precipitation: 534, solarIrradiation: 6.2, windSpeed: 4.1 },
    energy: { solarPotential: 8.8, windPotential: 7.6, renewableShare: 32, consumption: 9800 },
    airQuality: { pm25: 6.4, pm10: 12.8, aqi: 22 },
    water: { availability: 44, stress: 56, drought: 'high' },
    risk: { earthquake: 'low', tsunami: 'moderate', wildfire: 'very_high', flood: 'high', volcanic: 'none' },
    scores: { habitability: 76, humanPressure: 28, sustainableEnergy: 68, dailyFriction: 22, environmentalRisk: 55, futureVulnerability: 58, climaticRisk: 62, resilience: 72, globalScore: 69 },
    sources: ['ABS 2023', 'NASA POWER', 'AEMO']
  },
  ZA: {
    code: 'ZA', name: 'Sudáfrica', flag: '🇿🇦', region: 'Africa',
    lat: -25.75, lng: 28.19,
    population: 59893885, area: 1219090, gdpPerCapita: 7055,
    climate: { tempMean: 18.4, tempMax: 32, tempMin: 6, humidity: 56, precipitation: 495, solarIrradiation: 6.8, windSpeed: 4.4 },
    energy: { solarPotential: 8.2, windPotential: 7.0, renewableShare: 15, consumption: 4200 },
    airQuality: { pm25: 28.4, pm10: 52.1, aqi: 89 },
    water: { availability: 38, stress: 62, drought: 'high' },
    risk: { earthquake: 'low', tsunami: 'low', wildfire: 'high', flood: 'moderate', volcanic: 'none' },
    scores: { habitability: 52, humanPressure: 65, sustainableEnergy: 48, dailyFriction: 58, environmentalRisk: 55, futureVulnerability: 68, climaticRisk: 62, resilience: 42, globalScore: 50 },
    sources: ['Stats SA 2023', 'NASA POWER', 'NERSA']
  },
  SE: {
    code: 'SE', name: 'Suecia', flag: '🇸🇪', region: 'Europe',
    lat: 59.33, lng: 18.07,
    population: 10415811, area: 450295, gdpPerCapita: 55427,
    climate: { tempMean: 6.4, tempMax: 20, tempMin: -4, humidity: 76, precipitation: 539, solarIrradiation: 2.6, windSpeed: 5.4 },
    energy: { solarPotential: 2.9, windPotential: 8.9, renewableShare: 66, consumption: 14800 },
    airQuality: { pm25: 5.2, pm10: 11.8, aqi: 19 },
    water: { availability: 94, stress: 6, drought: 'none' },
    risk: { earthquake: 'very_low', tsunami: 'none', wildfire: 'moderate', flood: 'low', volcanic: 'none' },
    scores: { habitability: 89, humanPressure: 22, sustainableEnergy: 88, dailyFriction: 15, environmentalRisk: 18, futureVulnerability: 28, climaticRisk: 38, resilience: 90, globalScore: 85 },
    sources: ['SCB 2023', 'NASA POWER', 'Svenska Kraftnät']
  },
  CN: {
    code: 'CN', name: 'China', flag: '🇨🇳', region: 'Asia',
    lat: 39.91, lng: 116.39,
    population: 1425671352, area: 9596960, gdpPerCapita: 12556,
    climate: { tempMean: 10.8, tempMax: 28, tempMin: -6, humidity: 68, precipitation: 645, solarIrradiation: 4.2, windSpeed: 3.2 },
    energy: { solarPotential: 5.4, windPotential: 6.2, renewableShare: 31, consumption: 5320 },
    airQuality: { pm25: 38.5, pm10: 72.4, aqi: 115 },
    water: { availability: 48, stress: 52, drought: 'moderate' },
    risk: { earthquake: 'high', tsunami: 'moderate', wildfire: 'moderate', flood: 'very_high', volcanic: 'low' },
    scores: { habitability: 58, humanPressure: 88, sustainableEnergy: 62, dailyFriction: 62, environmentalRisk: 65, futureVulnerability: 60, climaticRisk: 58, resilience: 65, globalScore: 59 },
    sources: ['NBS China 2023', 'NASA POWER', 'NEA China']
  },
};

export const CHILE_REGIONS = [
  { code: 'RM', name: 'Región Metropolitana', lat: -33.45, lng: -70.67, population: 8125072, area: 15403, capital: 'Santiago' },
  { code: 'V', name: 'Valparaíso', lat: -33.04, lng: -71.62, population: 1952651, area: 16396, capital: 'Valparaíso' },
  { code: 'IV', name: 'Coquimbo', lat: -29.95, lng: -71.34, population: 819267, area: 40580, capital: 'La Serena' },
  { code: 'II', name: 'Antofagasta', lat: -23.65, lng: -70.40, population: 691854, area: 126049, capital: 'Antofagasta' },
  { code: 'I', name: 'Tarapacá', lat: -20.21, lng: -70.15, population: 428594, area: 42226, capital: 'Iquique' },
  { code: 'XV', name: 'Arica y Parinacota', lat: -18.48, lng: -70.33, population: 246088, area: 16873, capital: 'Arica' },
  { code: 'III', name: 'Atacama', lat: -27.37, lng: -70.33, population: 329848, area: 75176, capital: 'Copiapó' },
  { code: 'VI', name: "O'Higgins", lat: -34.17, lng: -70.74, population: 1001756, area: 16387, capital: 'Rancagua' },
  { code: 'VII', name: 'Maule', lat: -35.43, lng: -71.67, population: 1101731, area: 30296, capital: 'Talca' },
  { code: 'XVI', name: 'Ñuble', lat: -36.61, lng: -71.97, population: 511482, area: 13178, capital: 'Chillán' },
  { code: 'VIII', name: 'Biobío', lat: -37.46, lng: -72.35, population: 1556805, area: 23865, capital: 'Concepción' },
  { code: 'IX', name: 'La Araucanía', lat: -38.91, lng: -72.56, population: 1014343, area: 31842, capital: 'Temuco' },
  { code: 'XIV', name: 'Los Ríos', lat: -39.82, lng: -73.24, population: 415025, area: 18430, capital: 'Valdivia' },
  { code: 'X', name: 'Los Lagos', lat: -41.47, lng: -72.94, population: 896293, area: 48584, capital: 'Puerto Montt' },
  { code: 'XI', name: 'Aysén', lat: -45.57, lng: -72.07, population: 101886, area: 108494, capital: 'Coyhaique' },
  { code: 'XII', name: 'Magallanes', lat: -53.16, lng: -70.91, population: 167169, area: 132297, capital: 'Punta Arenas' },
];

export const WORLD_REGIONS_SAMPLE = [
  ...Object.values(FALLBACK_COUNTRIES)
];

export function getCountryData(code) {
  return FALLBACK_COUNTRIES[code] || null;
}

export function getScoreColor(score) {
  if (score >= 80) return '#5A8A6A';   // sage
  if (score >= 65) return '#3B7F7F';   // teal
  if (score >= 50) return '#C49A27';   // amber
  if (score >= 35) return '#8B6F4A';   // brown
  return '#B85A3A';                     // terracotta
}

export function getScoreClass(score) {
  if (score >= 80) return 'score-excellent';
  if (score >= 65) return 'score-good';
  if (score >= 50) return 'score-moderate';
  if (score >= 35) return 'score-poor';
  return 'score-critical';
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Excelente';
  if (score >= 65) return 'Bueno';
  if (score >= 50) return 'Moderado';
  if (score >= 35) return 'Bajo';
  return 'Crítico';
}
