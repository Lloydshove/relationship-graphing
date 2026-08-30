Got it, Lloyd — here’s a professional, agent‑friendly README for your repo at relationship‑graphing.
I’ve replaced the broken placeholders with direct GitHub links to each file in the master branch, including a new schema.md file. This way, future contributors can click straight through to the right place.

---

📘 Relationship Graph Project — README

1. Background & Context

This project was developed to map and visualise the social graph of Lloyd’s extended network.
The aim is to capture:

• Who met whom
• How they met (school, work, activity, event, city, language study, etc.)
• When they met (year field added for timeline analysis)
• Contextual metadata (workplace, event, activity, city, mediator)


The dataset is designed to be machine‑readable for visualisation tools (Cytoscape.js) while also being human‑readable for clarity.

Over time, the project evolved to include:

• A Bottom Drawer UI for mobile‑friendly interaction
• Filters by relationship type and context
• Timeline slider to reveal relationships year‑by‑year
• Animated playback with a play button
• Decade filtering to group relationships historically
• Clustering (Louvain algorithm) to detect communities


This README serves as the main guide for agents and contributors, explaining the rationale, file structure, and linking to all components.

---

2. File Structure

project-root/
│
├── README.md                # Main guide (this file)
├── schema.md                # Schema specification
│
├── index.html               # Main HTML file with Bottom Drawer UI
├── styles.css               # Styling for drawer, filters, timeline, clustering
├── graph.js                 # Cytoscape logic: rendering, filters, timeline, clustering
│
└── data/
    └── relationships.json   # Full dataset of people + relationships


---

3. Linked Files

• schema.md (github.com in Bing) — defines people, relationship types, and relationships structure
• index.html (github.com in Bing) — UI layout, drawer, slider, buttons, legend
• styles.css (github.com in Bing) — visual styling, animations, dark mode
• graph.js (github.com in Bing) — Cytoscape rendering, filtering, timeline, clustering logic
• data/relationships.json (github.com in Bing) — dataset of people and relationships with year fields


---

4. Schema Overview

The schema defines three core entities:

• People — unique IDs and names
• RelationshipTypes — categories of how people met
• Relationships — connections between people, with optional mediator, context, and year


See schema.md (github.com in Bing) for the full specification.

---

5. Key Features

• Mobile‑first UI — Bottom Drawer pattern
• Filters — by type and context
• Timeline slider — reveal relationships up to a given year
• Play button — animate the timeline year‑by‑year
• Decade filtering — show only relationships from a chosen decade
• Clustering — detect communities with Louvain algorithm
• Pulse animation — highlight newly appearing nodes


---

6. Development Notes

• Relationships are single‑event based (no multi‑event histories per edge).
• IDs are stable (pX for people, rX for relationships, rtX for types).
• Year field is optional (null if unknown).
• Filtering is hard filtering (non‑matching edges hidden).
• Drawer auto‑closes after filter/timeline actions for mobile usability.
• Timeline animation clears decade filters before playback.


---

7. Future Extensions

Potential next steps include:

• Decade heatmap — show density of relationships per decade
• Story mode — narrate the timeline as it animates
• Search bar — jump directly to a person
• Focus mode — isolate one person and their direct connections


---

📎 Schema File

See schema.md (github.com in Bing) for the full schema specification.

---

👉 Next step: I can generate the schema.md file content itself (with the JSON schema definition only, no dataset) so you can drop it straight into your repo. Would you like me to draft that now?