# Pacific Seabed Intelligence Tracker

An interactive OSINT-style dashboard for tracking **Pacific deep-sea life discoveries**, **critical minerals**, **deep-seabed mining policy**, and **AI/data-center supply-chain risk**.

This project is designed to look and feel like a high-end intelligence tracker: clickable map-style signals, composite risk scoring, event filtering, mineral-to-data-center mapping, source links, exportable data, charts, and a LinkedIn-ready narrative panel.

![Project type](https://img.shields.io/badge/project-OSINT%20tracker-cyan)
![Focus](https://img.shields.io/badge/focus-AI%20infrastructure%20%2B%20critical%20minerals-blue)
![Status](https://img.shields.io/badge/status-prototype-orange)

## Why this matters

AI infrastructure is not only a software story. It is also a power, copper, cooling, grid, supply-chain, and environmental-risk story.

The Pacific seabed, especially the **Clarion-Clipperton Zone**, is being watched for polymetallic nodules containing manganese, nickel, copper, cobalt, and rare earth elements. At the same time, scientists continue to describe new deep-sea species from these same ecosystems.

This tracker connects those threads.

## Features

- Interactive command-center dashboard
- Clickable Pacific/CCZ signal map
- Search and filter by event type or mineral
- Composite risk scoring
- Mineral-to-data-center relevance matrix
- Ranked intelligence feed
- Source links for each signal
- Export filtered data to JSON or CSV
- Timeline chart for discovery, permit, market, and risk momentum
- LinkedIn-ready post generator

## Tech stack

- React
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- Recharts

## Install locally

```bash
npm install
npm run dev
```

Then open the local URL shown in your terminal.

## Build

```bash
npm run build
npm run preview
```

## Data model

The main dataset is located at:

```text
src/data/events.json
```

Each event includes:

```json
{
  "id": "unique-event-id",
  "date": "YYYY-MM-DD",
  "region": "Clarion-Clipperton Zone",
  "type": "Regulatory / Permit",
  "status": "Under review",
  "coordinates": { "x": 52, "y": 56 },
  "headline": "Short event headline",
  "summary": "Plain-English intelligence summary",
  "minerals": ["Copper", "Nickel"],
  "dataCenterRelevance": 91,
  "biodiversityRisk": 89,
  "miningMomentum": 96,
  "confidence": 86,
  "depth": "Abyssal nodule field",
  "source": "Reuters / NOAA",
  "sourceUrl": "https://example.com",
  "linkedinAngle": "Why this matters to a professional audience"
}
```

## Risk score

The prototype uses a simple composite score:

```text
Composite Risk =
  biodiversityRisk * 0.42
+ miningMomentum * 0.34
+ dataCenterRelevance * 0.24
```

This can be adjusted inside `src/App.jsx`.

## Source watchlist

Recommended sources to monitor:

- NOAA Ocean Service
- NOAA Ocean Exploration
- Federal Register
- International Seabed Authority
- USGS
- BOEM
- Reuters
- ScienceDaily
- ZooKeys / Pensoft
- Current Biology
- Natural History Museum
- Company filings and investor releases from seabed-mining firms

## GitHub Pages deployment

This repo includes a GitHub Actions workflow at:

```text
.github/workflows/deploy.yml
```

After pushing to GitHub:

1. Go to **Settings**
2. Go to **Pages**
3. Under **Build and deployment**, choose **GitHub Actions**
4. Push to the `main` branch

## Suggested LinkedIn angle

> AI is not just a software story anymore.  
> It is becoming a minerals, power, infrastructure, and environmental-risk story.

Use the in-app LinkedIn panel for a full copy-ready post.

## Disclaimer

This is a prototype research and visualization tool. It is not investment advice, legal advice, environmental advice, or a live regulatory database. Verify all events and sources before presenting the tracker as current intelligence.
