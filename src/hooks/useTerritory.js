// ═══════════════════════════════════════════════════════════
//  ATLAS TERRITORIAL · Hook principal de territorio
// ═══════════════════════════════════════════════════════════

import { useState, useCallback, useRef } from 'react';
import { fetchTerritoryData } from '../services/api.js';
import {
  FALLBACK_COUNTRIES,
  getScoreColor,
  getScoreLabel,
} from '../data/fallback.js';
import {
  calcHabitabilityScore,
  calcHumanPressureScore,
  calcDailyFriction,
  calcFutureVulnerability,
  calcResilience,
  calcGlobalScore,
  buildTerritorialGenome,
  calcEnergyScore,
} from '../utils/scoring.js';

export function useTerritory() {
  const [territory, setTerritory]       = useState(null);
  const [liveData, setLiveData]         = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [dataQuality, setDataQuality]   = useState(null);
  const abortRef = useRef(null);

  const selectTerritory = useCallback(async (countryCode, lat, lng) => {
    if (!countryCode) return;

    // Cancelar fetch anterior
    if (abortRef.current) abortRef.current.abort();

    setLoading(true);
    setError(null);
    setLiveData(null);

    // Carga inmediata con datos de fallback
    const fallback = FALLBACK_COUNTRIES[countryCode];
    if (fallback) {
      const merged = buildEnrichedTerritory(fallback, null);
      setTerritory(merged);
    }

    // Fetch asincrónico de datos reales
    try {
      const realLat = lat ?? fallback?.lat;
      const realLng = lng ?? fallback?.lng;

      if (realLat && realLng) {
        const live = await fetchTerritoryData(realLat, realLng, countryCode);
        setLiveData(live);

        // Merge datos reales con fallback
        const merged = buildEnrichedTerritory(fallback, live);
        setTerritory(merged);

        const okSources = live.sources?.filter(s => s.ok).length || 0;
        setDataQuality({
          totalSources: live.sources?.length || 0,
          okSources,
          level: okSources >= 4 ? 'high' : okSources >= 2 ? 'medium' : 'low',
          fetchedAt: live.fetchedAt,
        });
      }
    } catch (err) {
      console.error('[useTerritory] Error al cargar datos live:', err);
      setError('No se pudieron cargar datos en tiempo real. Usando datos de referencia.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { territory, liveData, loading, error, dataQuality, selectTerritory };
}

function buildEnrichedTerritory(fallback, live) {
  if (!fallback) return null;

  // Fusionar datos live sobre fallback
  const merged = { ...fallback };

  if (live) {
    // Clima: preferir datos live si disponibles
    merged.climate = {
      ...fallback.climate,
      tempMean:      live.climate?.tempMean      ?? fallback.climate?.tempMean,
      tempMax:       live.climate?.tempMax       ?? fallback.climate?.tempMax,
      tempMin:       live.climate?.tempMin       ?? fallback.climate?.tempMin,
      humidity:      live.climate?.humidity      ?? fallback.climate?.humidity,
      windSpeed:     live.climate?.windSpeed     ?? fallback.climate?.windSpeed,
      precipitation: live.climate?.precipitation ?? fallback.climate?.precipitation,
      solarIrradiation: live.climate?.solarIrradiation ?? fallback.climate?.solarIrradiation,
    };

    // Energía
    merged.energy = {
      ...fallback.energy,
      solarPotential: live.energy?.solarPotential ?? fallback.energy?.solarPotential,
      windPotential:  live.energy?.windPotential  ?? fallback.energy?.windPotential,
      renewableShare: live.energy?.renewableShare  ?? fallback.energy?.renewableShare,
    };

    // Calidad del aire
    if (live.airQuality?.pm25) {
      merged.airQuality = { ...fallback.airQuality, ...live.airQuality };
    }

    // Población y economía
    merged.population  = live.population  || fallback.population;
    merged.gdpPerCapita= live.gdpPerCapita || fallback.gdpPerCapita;
    merged.sources     = live.sources?.map(s => s.name) || fallback.sources;
  }

  // Calcular scores frescos
  const hab   = calcHabitabilityScore(merged);
  const press = calcHumanPressureScore(merged);
  const fric  = calcDailyFriction(merged);
  const futu  = calcFutureVulnerability(merged);
  const res   = calcResilience(merged);
  const global= calcGlobalScore(merged);

  merged.scores = {
    habitability:     hab.score   || fallback.scores?.habitability,
    humanPressure:    press.score || fallback.scores?.humanPressure,
    sustainableEnergy:calcEnergyScore(merged.energy) || fallback.scores?.sustainableEnergy,
    dailyFriction:    fric.score  || fallback.scores?.dailyFriction,
    futureVulnerability: futu.score || fallback.scores?.futureVulnerability,
    resilience:       res.score   || fallback.scores?.resilience,
    globalScore:      global      || fallback.scores?.globalScore,
  };

  merged._scoreBreakdowns = { hab, press, fric, futu, res };
  merged._genome = buildTerritorialGenome(merged);
  merged._futureScenarios = futu.scenarios;

  return merged;
}
