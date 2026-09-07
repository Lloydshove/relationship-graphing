# Copilot Instructions

## Project Context

This repository is a static, browser-based relationship graph viewer built with:
- `index.html` for structure and controls
- `styles.css` for layout and theming
- `graph.js` for data loading, Cytoscape rendering, and interactions
- `data/relationships.json` as the source data

## Data Model Expectations

- `people`: array of `{ id, name }`
- `relationshipTypes`: array of `{ id, label }`
- `relationships`: array containing `from`, `to`, `type`, `description`, and optional `mediator`, `context`, `year`
- ID conventions are stable: `pX`, `rtX`, `rX`

## Change Guidelines for Agents

- Keep the app dependency-light; prefer plain HTML/CSS/JS.
- Preserve compatibility with existing `relationships.json` keys.
- Keep UI controls in `index.html` aligned with handlers in `graph.js`.
- When adding filters or controls, update both markup and behavior in tandem.
- Prefer small, focused edits over broad rewrites.

## Validation Guidance

- GitHub Actions workflow `.github/workflows/build-static-artifact.yml` builds and uploads static artifacts.
- Validate by ensuring:
  - links between files remain correct
  - JSON structure stays valid
  - browser-side interactions in `graph.js` still match DOM IDs/classes in `index.html`
