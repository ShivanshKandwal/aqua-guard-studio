# AquaGuard Studio 2.0 🌊

**Groundwater Stress Intelligence, 3D Geospatial Simulation & Dynamic Policy Governance Platform for Delhi NCR**

Built on official **Central Ground Water Board (CGWB)** & **India-WRIS** assessment standards with multi-model predictive engines (Linear Regression, XGBoost, and LSTM).

---

## 🌟 Key Features

- **Interactive Geospatial NCR Cockpit**: Real-time Leaflet map rendering all 15 Delhi NCR district boundary polygons with live CGWB stress heat categorization (*Safe, Semi-Critical, Critical, Over-Exploited*).
- **Simulation Control Deck & Dynamic 3-15 Year Horizon**:
  - Rainfall anomaly, groundwater extraction draft, rooftop rainwater harvesting (RWH), treated STP effluent recycling, and micro-irrigation sliders.
  - Multi-model advisor recommending optimal engines across near-term (3-4y), mid-term (5-8y), and long-term (9-15y) horizons.
- **5 Multi-Telemetry Depletion Graphs**:
  1. *10-Year Water Table Depth Trajectory (mbgl)*
  2. *Annual Water Budget & Net Deficit (HAM)*
  3. *Pumping Energy Surge & Power Tariffs (₹/kWh)*
  4. *Salinity Intrusion (TDS ppm) & Borewell Failure Probability (%)*
  5. *Sectoral Consumption Breakdown (Domestic vs Agr vs Ind)*
- **AI Hydrogeology Advisor**: Conversational intelligence linked to the active district hydrogeology and live parameter overrides.
- **Policy & Governance Hub**:
  - Detailed statutory directives with CAPEX/OPEX dossiers and compliance checklists.
  - Custom PDF / Policy Synopsis AI Evaluator sandbox that projects 8-year cumulative water yields (MLD) and water table rebound curves.
- **3D Fluid WebGL Shader**: Built with `@shadergradient/react` and Three.js.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Glassmorphism UI
- **Geospatial**: Leaflet + React-Leaflet + GeoJSON
- **Visualizations**: Recharts + Lucide Icons + Framer Motion
- **State Management**: Zustand
- **3D Engine**: Three.js + `@react-three/fiber` + `@shadergradient/react`

---

## 🚀 Quickstart

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/aqua-guard-studio.git
cd aqua-guard-studio

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

---

## 📦 Build for Production

```bash
npm run build
npm run preview
```
