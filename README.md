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

## Features

- Interactive network graph rendering
- Relationship type and context filters
- Timeline slider and animation playback
- Decade filtering
- Louvain community clustering
- Light/dark theme toggle

## Data Notes

- IDs use stable prefixes: `pX` (people), `rtX` (relationship types), `rX` (relationships).
- `year` may be `null` when unknown.
- `context` and `mediator` are optional fields on relationships.

For full schema details, see [schema.md](./schema.md).