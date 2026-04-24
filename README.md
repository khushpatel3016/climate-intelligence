# 🌍 Climatica — Global Climate Intelligence

An end-to-end climate analysis platform that reads real-time weather data, renders interactive global heatmaps, runs AI-powered risk assessments, and generates 10-year climate projections — all through a web interface.

Built from scratch. No templates. No boilerplate.

---

## What this actually is

Most "climate dashboards" just embed a weather widget and slap a chart on top. This one builds the full intelligence pipeline manually:

- Render a full interactive world map using D3 and TopoJSON — no map libraries
- Click any country and fetch live temperature, humidity, and wind data from OpenWeatherMap
- Calculate WBGT (Wet Bulb Globe Temperature) on the fly from raw weather metrics
- Embed that data into a structured prompt and send it to Gemini AI
- Get back a risk score, primary climate threats, mitigation strategies, and a 10-year projection
- Toggle between thermal heat index and rainfall overlays across Past, Present, and Future scenarios

No generic answers. The AI only reasons from real weather data at the location you clicked.

---

## What's been built

**World Map Engine**
Full SVG globe rendered with D3 and TopoJSON. Every country is a clickable path. Color is computed per-country based on latitude and time period — not loaded from a file. Two overlay modes: WBGT thermal heat index and estimated annual rainfall.

**Real-Time Weather Layer**
On country click, coordinates are extracted and sent to OpenWeatherMap. Returns live temperature, humidity, wind speed, and weather description. WBGT is calculated client-side using the psychrometric formula. Falls back to simulation if the key is missing or invalid — the app never breaks.

**AI Risk Assessment**
Temperature and humidity go into a structured Gemini prompt with a strict JSON response schema. Returns a risk score from 0–100, a list of primary threats, mitigation strategies, a future projection paragraph, and a confidence level. Score is clamped and mapped to severity labels: Low, Moderate, High, Critical.

**Time Machine**
Three-state toggle — Past, Present, Future. Changes the thermal calculation across the entire map in real time. Past subtracts 2°C from WBGT baselines. Future adds 3°C. Lets you see how a region's risk profile shifts across decades.

**Intelligence Dashboard**
Live right-hand panel that populates the moment analysis comes back. Shows temperature, humidity, wind speed, WBGT index, risk score with color-coded severity, primary threats, mitigation strategies, and the full 10-year projection text.

**Global AI Insight Bar**
On load, global climate stats (avg temp, CO2 level, sea level rise) are sent to Gemini. Returns a two-sentence expert insight displayed as a live scrolling headline at the top of the app.

---

## System Flow

```
Country Click
 └─► Coordinates Extracted (D3 TopoJSON)
      └─► OpenWeatherMap API → temp, humidity, wind
           └─► WBGT Calculated (psychrometric formula)
                └─► Structured Prompt → Gemini AI
                     └─► Risk Score / Threats / Strategies / Projection
                          └─► Intelligence Dashboard
```

---

## Web Interface

Five panels, one layout:

| Panel | What it does |
|---|---|
| World Map | Interactive D3 globe, click any country |
| View Toggle | Switch between Heat Index and Rainfall overlays |
| Time Machine | Scrub between Past, Present, and Future scenarios |
| Intelligence Dashboard | Live AI risk analysis for the selected region |
| Report Modal | Submit a climate observation from anywhere in the app |

The workflow is connected end to end — clicking a country triggers weather fetch, which triggers AI analysis, which populates the dashboard automatically.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Map rendering | D3.js + TopoJSON |
| Weather data | OpenWeatherMap API |
| AI analysis | Google Gemini (`gemini-3-flash-preview`) |
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| Animations | Motion (Framer Motion) |
| Build tool | Vite 6 |
| Runtime | Node.js |

---

## Project Structure

```
climalens/
├── src/
│   ├── components/
│   │   ├── WorldMap.tsx          # D3 globe, WBGT + rainfall overlays
│   │   ├── ClimateDashboard.tsx  # Right-hand AI intelligence panel
│   │   ├── TimeMachine.tsx       # Past / Present / Future toggle
│   │   └── ReportModal.tsx       # User report submission
│   ├── services/
│   │   ├── geminiService.ts      # Gemini AI prompts, schema, risk scoring
│   │   └── weatherService.ts     # OpenWeatherMap fetch + WBGT calculation
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx                   # Root layout, state, API key handling
│   └── main.tsx
├── index.html
├── .env
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Setup

```bash
git clone https://github.com/your-username/climalens.git
cd climalens

npm install
```

Get a free Gemini API key at https://aistudio.google.com/app/apikey

Get a free OpenWeatherMap key at https://openweathermap.org/api

```bash
# Create .env in the project root
VITE_GEMINI_API_KEY="your-gemini-key"
VITE_OPENWEATHER_API_KEY="your-openweather-key"
```

```bash
npm run dev
```

Opens at http://localhost:3000

The OpenWeatherMap key is optional — the app runs in Demo Mode without it using simulated climate data.

---

## Full Workflow

```
1. Open the app → Gemini generates a global climate headline
2. Click any country → live weather is fetched for that location
3. WBGT is calculated → AI risk analysis runs automatically
4. Dashboard populates → threats, strategies, and projection appear
5. Toggle Time Machine → see how the region's thermal risk shifts over time
6. Switch to Rainfall view → compare precipitation patterns across the globe
```

Or submit a climate observation using the report button — bottom right, always visible.

---

## Author

**Your Name** — [GitHub](https://github.com/your-username)