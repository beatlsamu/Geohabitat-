# 🌍 Atlas Territorial · Motor Global de Habitabilidad

> Sistema de análisis territorial, genoma ambiental y scoring de habitabilidad. Mundo 3D interactivo, estética científica vintage, datos públicos reales.

![build](https://img.shields.io/badge/build-passing-5A8A6A) ![stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20D3-4A7096) ![data](https://img.shields.io/badge/datos-públicos%20verificables-C49A27)

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│  ATLAS TERRITORIAL                                          │
│                                                             │
│  ┌──────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Left    │  │   Globe 3D       │  │  Right Sidebar   │  │
│  │ Sidebar  │  │   (D3 Ortho.)    │  │  (8 paneles)     │  │
│  │          │  │                  │  │                  │  │
│  │ · Search │  │ · Drag/rotate    │  │ · Overview       │  │
│  │ · Modos  │  │ · Zoom scroll    │  │ · Genoma         │  │
│  │ · Chile  │  │ · Click select   │  │ · Presión Hum.   │  │
│  │ · Países │  │ · Fly-to animate │  │ · Energía        │  │
│  │          │  │ · Score colors   │  │ · Clima/Riesgo   │  │
│  └──────────┘  └──────────────────┘  │ · Futuro 2050    │  │
│                                      │ · Comparativa    │  │
│  APIs en tiempo real (con fallback): │ · Fuentes        │  │
│  Open-Meteo · NASA POWER · OpenAQ   └──────────────────┘  │
│  World Bank · REST Countries · CNE Chile                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + JSX |
| Build | Vite 5 |
| Visualización 3D | D3 v7 (geoOrthographic) + topojson-client |
| Gráficos | Recharts |
| Estilo | CSS puro (variables, sin framework) |
| APIs | Open-Meteo, NASA POWER, World Bank, OpenAQ, REST Countries |
| Datos Chile | CNE / Coordinador Eléctrico / INE |

---

## Estructura del Proyecto

```
habitabilidad-territorial/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Globe3D.jsx          # Globo D3 ortográfico interactivo
│   │   ├── Header.jsx           # Barra superior
│   │   ├── LeftSidebar.jsx      # Navegación y búsqueda
│   │   ├── RightSidebar.jsx     # Panel de análisis (8 tabs)
│   │   ├── SearchBar.jsx        # Buscador de territorios
│   │   └── panels/
│   │       ├── OverviewPanel.jsx       # Vista general + scores
│   │       ├── GenomePanel.jsx         # Genoma territorial (18+ genes)
│   │       ├── HumanPressurePanel.jsx  # Presión humana
│   │       ├── EnergyPanel.jsx         # Energía y sostenibilidad
│   │       ├── RiskPanel.jsx           # Clima y riesgo ambiental
│   │       ├── FuturePanel.jsx         # Proyecciones 2030-2050
│   │       ├── ComparePanel.jsx        # Comparativa entre territorios
│   │       └── SourcesPanel.jsx        # Fuentes y metodología
│   ├── data/
│   │   └── fallback.js          # Datos de referencia verificables
│   ├── hooks/
│   │   └── useTerritory.js      # Hook principal de estado territorial
│   ├── services/
│   │   └── api.js               # Conectores a APIs públicas
│   ├── utils/
│   │   └── scoring.js           # Motor de scoring explicable
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                # Sistema de diseño vintage
├── index.html
├── vite.config.js
└── package.json
```

---

## Instalación Local

```bash
# 1. Clonar
git clone https://github.com/tu-usuario/atlas-territorial.git
cd atlas-territorial

# 2. Instalar dependencias
npm install

# 3. Desarrollo
npm run dev
# → http://localhost:5173

# 4. Build de producción
npm run build

# 5. Preview del build
npm run preview
```

---

## Despliegue en Render

### Opción A — Static Site (recomendada)

1. Crea cuenta en [render.com](https://render.com)
2. **New → Static Site**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. Click **Create Static Site**

### Opción B — Web Service (Node)

1. **New → Web Service**
2. Configura:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve dist -p $PORT`
   - **Environment:** Node

---

## Subir a GitHub

```bash
cd atlas-territorial

git init
git add .
git commit -m "feat: Atlas Territorial v1.0 — Motor de Habitabilidad Global"

# Crear repo en GitHub y conectar:
git remote add origin https://github.com/TU_USUARIO/atlas-territorial.git
git branch -M main
git push -u origin main
```

---

## APIs Integradas

| API | Uso | Clave | Límite |
|-----|-----|-------|--------|
| [Open-Meteo](https://open-meteo.com) | Clima en tiempo real | No requerida | 10K req/día |
| [NASA POWER](https://power.larc.nasa.gov) | Radiación solar, clima | No requerida | Sin límite |
| [World Bank API](https://datahelpdesk.worldbank.org) | PIB, población, renovables | No requerida | Sin límite |
| [OpenAQ](https://openaq.org) | Calidad del aire PM2.5 | Opcional (v3) | 1K req/hora |
| [REST Countries](https://restcountries.com) | Metadatos de países | No requerida | Sin límite |
| [CNE Chile](https://www.energiaabierta.cl) | Energía Chile | No requerida | Abierta |

Todas las APIs tienen **fallback automático** a datos de referencia verificables si fallan.

---

## Motor de Scoring

### Score Global Compuesto
```
Score = 0.30×Habitabilidad + 0.15×(100-PresHumana) + 0.20×(100-Fricción)
      + 0.20×(100-VulnFutura) + 0.15×Resiliencia
```

### Habitabilidad
```
Hab = 0.20×ComfortClima + 0.15×CalidadAire + 0.15×Agua
    + 0.20×SeguridadAmb + 0.10×Energía + 0.10×PIB + 0.10×(100-Densidad)
```

Todos los cálculos son **transparentes y auditables** desde el panel Fuentes.

---

## Genoma Territorial

Cada territorio contiene **18+ genes base** distribuidos en categorías:
- 🌤️ Clima (7 genes): temperatura, humedad, precipitación, viento, radiación
- 💨 Calidad del Aire (3 genes): PM2.5, PM10, AQI
- 💧 Recursos Hídricos (2 genes): disponibilidad, estrés
- ⚡ Energía (3 genes): solar, eólico, renovables
- 👥 Población (3 genes): total, densidad, PIB per cápita

La arquitectura es **expandible**: agregar nuevos genes no rompe el sistema.

---

## Capa Biológica Derivada

Perfiles analíticos basados en datos agregados públicos (NO diagnósticos médicos):
- 🫁 Perfil respiratorio sensible
- 🌡️ Perfil de estrés térmico
- 💧 Perfil de vulnerabilidad hídrica
- 🌿 Perfil de adaptación climática

---

## Foco Chile 🇨🇱

- 16 regiones con datos específicos (INE 2023)
- Datos energéticos CNE / Coordinador Eléctrico Nacional
- Score de referencia: 65/100 (datos 2023)
- Energía renovable: 54% de la matriz (2023)
- Foco especial en potencial solar Atacama (9+ kWh/m²/d)

---

## Principios de Datos

- ❌ **No se inventan datos.** Fallback transparente si falla una fuente.
- 📊 Toda métrica muestra **origen, fecha y nivel de confianza**.
- 🔓 Solo fuentes **públicas, verificables y abiertas**.
- ⚠️ Las limitaciones son **explícitas, nunca ocultas**.
- 🧬 La capa biológica es **analítica, no médica**.

---

## Escalabilidad

Para extender el sistema:

1. **Nuevos genes al genoma** → agregar entrada en `buildTerritorialGenome()` en `scoring.js`
2. **Nueva API** → agregar función en `services/api.js` con try/catch y fallback
3. **Nuevo país** → agregar entrada en `FALLBACK_COUNTRIES` en `data/fallback.js`
4. **Nuevo panel** → crear componente en `panels/` y agregar tab en `RightSidebar.jsx`
5. **Nuevo score** → agregar función en `utils/scoring.js` y conectar en `useTerritory.js`

---

## Licencia

MIT — datos de fuentes con licencias abiertas respectivas (ver panel Fuentes en la app).
