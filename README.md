# Relationship Graph

This project visualizes a social relationship network in the browser using Cytoscape.js.

## Overview

The graph models:
- who met whom
- how they met (relationship type)
- optional context (workplace, event, activity, city, mediator)
- optional year for timeline filtering

## Repository Structure

```text
.
├── README.md
├── schema.md
├── COPILOT_INSTRUCTIONS.md
├── FEATURE_PLAN.md
├── DESIGN_REVIEW_LOG.md
├── DESIGN_PACKAGE_V1.md
├── .github/workflows/
│   └── build-static-artifact.yml
├── index.html
├── styles.css
├── graph.js
└── data/
    └── relationships.json
```

## Key Files

- [schema.md](./schema.md) — data schema reference for people, relationship types, and relationships.
- [index.html](./index.html) — app shell and UI controls (drawer, timeline, filters, clustering actions).
- [styles.css](./styles.css) — app styling, drawer layout, and theme styles.
- [graph.js](./graph.js) — graph loading, rendering, filtering, timeline playback, and clustering logic.
- [data/relationships.json](./data/relationships.json) — source dataset.
- [COPILOT_INSTRUCTIONS.md](./COPILOT_INSTRUCTIONS.md) — durable context and edit guidance for future agents.
- [FEATURE_PLAN.md](./FEATURE_PLAN.md) — design-first roadmap for planned feature expansion.
- [DESIGN_REVIEW_LOG.md](./DESIGN_REVIEW_LOG.md) — resumable decision log and approval gates.
- [DESIGN_PACKAGE_V1.md](./DESIGN_PACKAGE_V1.md) — detailed architecture and phased design package (no implementation).
- [.github/workflows/build-static-artifact.yml](./.github/workflows/build-static-artifact.yml) — GitHub Actions pipeline that validates data and publishes a static build artifact.

## Features

- Interactive network graph rendering
- Relationship type and context filters
- Timeline slider and animation playback
- Decade filtering
- Louvain community clustering
- Light/dark theme toggle

## Build Pipeline

This repository includes a GitHub Actions workflow at:

- [`.github/workflows/build-static-artifact.yml`](./.github/workflows/build-static-artifact.yml)

The workflow:
- runs on push, pull request, and manual trigger
- validates `data/relationships.json`
- assembles a static `dist/` directory
- uploads `dist/` as an artifact named `relationship-graph-static-site`

## Data Notes

- IDs use stable prefixes: `pX` (people), `rtX` (relationship types), `rX` (relationships).
- `year` may be `null` when unknown.
- `context` and `mediator` are optional fields on relationships.

For full schema details, see [schema.md](./schema.md).