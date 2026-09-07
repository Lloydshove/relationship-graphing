# Relationship Graph Feature Plan (Design-First)

## Purpose

Create a resumable, check-in-friendly plan for expanding the graph while keeping design and implementation strictly separated.

## Rule of Engagement

No implementation starts for any feature until design is reviewed and approved by @Lloydshove and captured in `DESIGN_REVIEW_LOG.md`.

---

## 1) Current State Summary

- Static client-side app (`index.html`, `styles.css`, `graph.js`) with Cytoscape rendering.
- Data source is `data/relationships.json` with people, relationship types, and relationships.
- Existing UX includes filters, timeline, decade filtering, clustering, and theme toggle.
- Current model is edge-centric and must evolve to support time-aware overlapping groups.

---

## 2) Decisions Confirmed by User (2026-09-07)

1. User submission flow: **direct live updates allowed only with rollback controls**.
2. Auth for submissions: **basic auth via GitHub identity/session**.
3. Couples: support both **dating year** and **marriage year**.
4. Couples visualization: grouping starts at dating year, then stronger grouping at marriage year.
5. Children: **birth-triggered visibility only**.
6. Locations: **country-level only (for now)**.
7. Multi-group model: **nested/overlapping groups required**.
8. Meeting groups (workplace/club/school): **optional toggle**.
9. Deployment preference: should work on GitHub with no separate hosting requirement.
10. Priority: **smaller changes first**, submission feature **last**.
11. Design artifacts: **Mermaid diagrams included**.

---

## 3) Unified Design Direction

Design around a **time-aware membership model**:

- **Entities**: people, groups, relationships, memberships.
- **Group types**: family, country, optional meeting groups.
- **Membership intervals**: `startYear`, optional `endYear`.
- **Couple milestones**: dating + marriage as timeline milestones.
- **Children**: smaller nodes, appear on birth year, linked into family grouping.
- **Overlap support**: one person can belong to multiple groups in the same year.

This keeps family/location/meeting-group features consistent and composable.

---

## 4) Implementation Ordering (Design Approved, Code Later)

1. **Schema extension design + migration plan** (dating/marriage years, country memberships, child data, optional meeting groups).
2. **Timeline/grouping behavior design** for dating vs marriage visual strength and birth-triggered child appearance.
3. **Nested/overlapping group rendering design** (country + family coexistence).
4. **Responsive/multi-device design and file-structure decision** (while keeping GitHub-friendly deployment).
5. **Optional meeting-group toggle design**.
6. **Submission system design last** (basic auth + rollback-controlled direct live updates).

---

## 5) Design and Delivery Phases

### Phase 1 — Architecture Package
- Data model v2 proposal.
- Rendering and timeline rules.
- Deployment options preserving GitHub compatibility.
- **Gate: user review required.**

### Phase 2 — Feature Design Specs (small-to-large order)
- B/C/D/E/F detailed specs first.
- A (submission feature) detailed spec last.
- **Gate: user review required per spec.**

### Phase 3 — Implementation Plan
- PR-sized sequence based on approved designs.
- Risk and rollback plan per PR.
- **Gate: explicit implementation go-ahead required.**

---

## 6) Resumable Tracker

| Item | Status | Owner | Notes |
|---|---|---|---|
| Unified architecture direction | Approved (concept) | User+Agent | Time-aware memberships + overlap support |
| Family/dating/marriage model | Approved (requirements) | User+Agent | Detailed schema pending |
| Children model and rendering | Approved (requirements) | User+Agent | Birth-only visibility |
| Country grouping model | Approved (requirements) | User+Agent | Country-level only initially; transition end inferred from next membership |
| Meeting groups model | Approved (requirements) | User+Agent | Optional toggle |
| Multi-device/stack decision | Open | User+Agent | Must preserve GitHub-friendly deployment |
| Submission workflow + rollback | Approved (requirements) | User+Agent | Direct live + GitHub basic auth + version-history rollback |

---

## 7) Remaining Clarifications Before Detailed Schema/Wireframes

1. Relationship semantics:
   - can dating end without marriage?
2. GitHub-friendly build preference:
   - keep fully no-build static,
   - or allow build step that outputs static assets for GitHub Pages?

---

## 8) Next Step

Produce `DESIGN_PACKAGE_V1.md` with:
- data schema v2 draft
- timeline/grouping behavior rules
- Mermaid diagrams for overlapping groups and lifecycle states
- implementation slices (small changes first, submissions last)
