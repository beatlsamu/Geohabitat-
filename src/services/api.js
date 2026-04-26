// ═══════════════════════════════════════════════════════════
//  ATLAS TERRITORIAL · Servicios de API
//  Todas con fallback automático documentado
// ═══════════════════════════════════════════════════════════

const TIMEOUT_MS = 8000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
//  Open-Meteo — Clima actual/histórico (SIN API KEY, gratuito)
//  https://open-meteo.com/en/docs
// ─────────────────────────────────────────────────────────────
export async function fetchClimateData(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
    `&timezone=auto&forecast_days=7`;

  try {
    const data = await fetchWithTimeout(url);
    const curr = data.current || {};
    const daily = data.daily  || {};

    const maxTemps = daily.temperature_2m_max || [];
    const minTemps = daily.temperature_2m_min || [];

    return {
      source: 'Open-Meteo (live)',
      confidence: 'high',
      tempMean:      curr.temperature_2m     || null,
      tempMax:       maxTemps.length ? Math.max(...maxTemps) : null,
      tempMin:       minTemps.length ? Math.min(...minTemps) : null,
      humidity:      curr.relative_humidity_2m || null,
      windSpeed:     curr.wind_speed_10m     || null,
      precipitation: (daily.precipitation_sum || []).reduce((a, b) => a + b, 0) || null,
      _raw: data,
    };
  } catch (err) {
    console.warn('[Open-Meteo] Falló:', err.message, '— usando fallback');
    return { source: 'Fallback estático', confidence: 'low', _error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
//  NASA POWER — Radiación solar y viento (SIN API KEY)
//  https://power.larc.nasa.gov/api/temporal/climatology/point
// ─────────────────────────────────────────────────────────────
export async function fetchNASAPower(lat, lng) {
  const params = 'ALLSKY_SFC_SW_DWN,WS10M,T2M,T2MDEW';
  const url = `https://power.larc.nasa.gov/api/temporal/climatology/point` +
    `?parameters=${params}&community=RE&longitude=${lng}&latitude=${lat}&format=JSON`;

  try {
    const data = await fetchWithTimeout(url);
    const props = data?.properties?.parameter || {};
    const annual = (obj) => obj?.ANN || Object.values(obj || {})[0] || null;

    return {
      source: 'NASA POWER Climatology',
      confidence: 'high',
      solarIrradiation: annual(props.ALLSKY_SFC_SW_DWN),
      windSpeed:        annual(props.WS10M),
      tempMean:         annual(props.T2M),
      _raw: data,
    };
  } catch (err) {
    console.warn('[NASA POWER] Falló:', err.message, '— usando fallback');
    return { source: 'Fallback estático', confidence: 'low', _error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
//  World Bank — Indicadores socioeconómicos (SIN API KEY)
//  https://datahelpdesk.worldbank.org/knowledgebase/articles/898581
// ─────────────────────────────────────────────────────────────
const WB_INDICATORS = {
  population: 'SP.POP.TOTL',
  gdpPerCapita: 'NY.GDP.PCAP.PP.KD',
  urbanization: 'SP.URB.TOTL.IN.ZS',
  renewableEnergy: 'EG.FEC.RNEW.ZS',
  co2: 'EN.ATM.CO2E.PC',
  electricAccess: 'EG.ELC.ACCS.ZS',
};

export async function fetchWorldBankIndicators(countryCode) {
  const results = {};

  for (const [key, indicator] of Object.entries(WB_INDICATORS)) {
    const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}` +
      `?format=json&mrv=1&per_page=1`;
    try {
      const data = await fetchWithTimeout(url);
      const val = data?.[1]?.[0]?.value;
      results[key] = val !== null && val !== undefined ? Math.round(val * 100) / 100 : null;
      results[`${key}_year`] = data?.[1]?.[0]?.date;
    } catch (err) {
      console.warn(`[World Bank] ${key} falló:`, err.message);
      results[key] = null;
    }
  }

  return { source: 'World Bank API', confidence: 'high', ...results };
}

// ─────────────────────────────────────────────────────────────
//  OpenAQ — Calidad del aire (SIN API KEY para básico)
//  https://docs.openaq.org/
// ─────────────────────────────────────────────────────────────
export async function fetchAirQuality(lat, lng) {
  const url = `https://api.openaq.org/v3/locations?coordinates=${lat},${lng}&radius=50000&limit=5`;

  try {
    const data = await fetchWithTimeout(url, {
      headers: { 'X-API-Key': '' }
    });

    const locations = data?.results || [];
    if (!locations.length) throw new Error('No locations found');

    // Buscar PM2.5 en los primeros resultados
    const pm25Vals = [];
    for (const loc of locations) {
      for (const sensor of (loc.sensors || [])) {
        if (sensor.parameter?.name === 'pm25') {
          pm25Vals.push(sensor.latest?.value);
        }
      }
    }

    const pm25Avg = pm25Vals.filter(Boolean).length
      ? pm25Vals.filter(Boolean).reduce((a, b) => a + b) / pm25Vals.filter(Boolean).length
      : null;

    return {
      source: 'OpenAQ v3',
      confidence: pm25Avg ? 'high' : 'low',
      pm25: pm25Avg ? Math.round(pm25Avg * 10) / 10 : null,
      stationsFound: locations.length,
      _raw: data,
    };
  } catch (err) {
    console.warn('[OpenAQ] Falló:', err.message, '— usando fallback');
    return { source: 'Fallback estático', confidence: 'low', _error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
//  REST Countries — Metadatos de países (SIN API KEY)
//  https://restcountries.com/
// ─────────────────────────────────────────────────────────────
export async function fetchCountryMeta(countryCode) {
  const url = `https://restcountries.com/v3.1/alpha/${countryCode}`;
  try {
    const data = await fetchWithTimeout(url);
    const c = data[0];
    return {
      source: 'REST Countries',
      confidence: 'high',
      name:       c.name?.common,
      officialName: c.name?.official,
      flag:       c.flag,
      capital:    c.capital?.[0],
      region:     c.region,
      subregion:  c.subregion,
      area:       c.area,
      population: c.population,
      latlng:     c.latlng,
      timezones:  c.timezones,
      languages:  Object.values(c.languages || {}).join(', '),
      currencies: Object.values(c.currencies || {}).map(c => c.name).join(', '),
    };
  } catch (err) {
    console.warn('[REST Countries] Falló:', err.message);
    return { source: 'Fallback', confidence: 'low', _error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
//  Energía Abierta Chile — CNE / Coordinador Eléctrico Nacional
//  https://www.energiaabierta.cl/
// ─────────────────────────────────────────────────────────────
export async function fetchChileEnergyData(region = null) {
  // API pública del Coordinador Eléctrico Nacional
  const url = `https://api.coordinador.cl/v1/ipp/pmf/actual`;

  try {
    const data = await fetchWithTimeout(url);
    return {
      source: 'Coordinador Eléctrico Nacional',
      confidence: 'high',
      data,
    };
  } catch (err) {
    // Fallback: datos de referencia CNE 2023
    console.warn('[Chile Energy API] Falló — usando datos de referencia');
    return {
      source: 'CNE Chile 2023 (referencia)',
      confidence: 'medium',
      renewableShare: 54,
      solarCapacity:  8200,   // MW instalados
      windCapacity:   3100,   // MW instalados
      totalCapacity:  26000,  // MW
      demand:         18000,  // MW promedio
      _error: err.message,
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  GeoJSON — Fronteras mundiales
// ─────────────────────────────────────────────────────────────
export async function fetchCountriesGeoJSON() {
  const url = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
  try {
    const data = await fetchWithTimeout(url);
    return data;
  } catch (err) {
    console.warn('[GeoJSON] Falló:', err.message);
    // Retornar un GeoJSON vacío — el mapa seguirá funcionando
    return { type: 'FeatureCollection', features: [] };
  }
}

// ─────────────────────────────────────────────────────────────
//  Agregador principal — combina todas las fuentes
// ─────────────────────────────────────────────────────────────
export async function fetchTerritoryData(lat, lng, countryCode) {
  const [climate, nasa, airQuality, worldBank, countryMeta] = await Promise.allSettled([
    fetchClimateData(lat, lng),
    fetchNASAPower(lat, lng),
    fetchAirQuality(lat, lng),
    countryCode ? fetchWorldBankIndicators(countryCode) : Promise.resolve({}),
    countryCode ? fetchCountryMeta(countryCode) : Promise.resolve({}),
  ]);

  const get = (res) => res.status === 'fulfilled' ? res.value : {};

  const climateData = get(climate);
  const nasaData    = get(nasa);
  const aqData      = get(airQuality);
  const wbData      = get(worldBank);
  const metaData    = get(countryMeta);

  // Merge clima (Open-Meteo preferred, NASA fallback)
  const mergedClimate = {
    tempMean:         climateData.tempMean         ?? nasaData.tempMean         ?? null,
    tempMax:          climateData.tempMax          ?? null,
    tempMin:          climateData.tempMin          ?? null,
    humidity:         climateData.humidity         ?? null,
    windSpeed:        climateData.windSpeed        ?? nasaData.windSpeed        ?? null,
    precipitation:    climateData.precipitation    ?? null,
    solarIrradiation: nasaData.solarIrradiation    ?? null,
  };

  return {
    climate:    mergedClimate,
    airQuality: { pm25: aqData.pm25, pm10: null, aqi: aqData.pm25 ? Math.round(aqData.pm25 * 2.5) : null },
    population: wbData.population || metaData.population || null,
    area:       metaData.area || null,
    gdpPerCapita: wbData.gdpPerCapita || null,
    energy: {
      solarPotential:  nasaData.solarIrradiation || null,
      windPotential:   nasaData.windSpeed ? Math.min(10, nasaData.windSpeed) : null,
      renewableShare:  wbData.renewableEnergy || null,
    },
    water: { availability: null, stress: null },
    meta: metaData,
    sources: [
      { name: 'Open-Meteo',   url: 'https://open-meteo.com',           ok: !climateData._error },
      { name: 'NASA POWER',   url: 'https://power.larc.nasa.gov',      ok: !nasaData._error },
      { name: 'OpenAQ',       url: 'https://openaq.org',               ok: !aqData._error },
      { name: 'World Bank',   url: 'https://data.worldbank.org',       ok: Object.keys(wbData).length > 2 },
      { name: 'REST Countries',url:'https://restcountries.com',        ok: !metaData._error },
    ],
    fetchedAt: new Date().toISOString(),
  };
}
