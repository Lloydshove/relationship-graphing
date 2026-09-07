# Relationship Graph Feature Plan (Design-First)

## Purpose

Create a resumable, check-in-friendly plan for expanding the graph while keeping design and implementation strictly separated.

## Rule of Engagement

No implementation starts for any feature until design is reviewed and approved by @Lloydshove.

---

## 1) Current State Summary

- Static client-side app (`index.html`, `styles.css`, `graph.js`) with Cytoscape rendering.
- Data source is `data/relationships.json` with people, relationship types, and relationships.
- Existing UX includes filters, timeline, decade filtering, clustering, and theme toggle.
- Current graph model is edge-centric and does not yet model time-bounded group memberships as first-class entities.

---

## 2) Unified Design Direction (for all requested features)

Design around a **time-aware membership model** rather than one-off feature additions:

- **Entities**: people, groups, events, relationships.
- **Groups**: family, location, workplace, club, school (same shape, different type).
- **Memberships**: person/group links with `startYear` and optional `endYear`.
- **Family structure**: partner relationships + children linked to family group.
- **Timeline behavior**: nodes and memberships appear/disappear by year.
- **Multi-group support**: one person can belong to multiple groups simultaneously.

This keeps family/location/workplace/school/club features consistent and avoids duplicated logic.

---

## 3) Feature Workstreams (Design then Implementation)

### A. User-submitted graph changes (UI + moderation path)
**Design phase**
- Compare options: local-only drafts, file-based submissions, hosted backend/API.
- Define trust model (anonymous vs authenticated), validation, and review workflow.
- Define submission schema so additions work with time-aware memberships.

**Implementation phase (after approval)**
- Build chosen submission UX and processing path.
- Add validation and conflict-handling.

### B. Married couples grouped from marriage year
**Design phase**
- Define marriage relationship schema and family-group creation rules.
- Define timeline behavior for pre/post marriage.
- Define rendering style for couple grouping.

**Implementation phase (after approval)**
- Add schema fields and render family grouping by year.

### C. Children as smaller nodes in family group
**Design phase**
- Define child entity attributes and birth-year visibility rules.
- Define visual hierarchy within family groups.
- Define parent/child relationship semantics and data invariants.

**Implementation phase (after approval)**
- Add child rendering, sizing, and timeline-triggered appearance.

### D. Location groups with move-in/move-out years
**Design phase**
- Define location-group schema and membership intervals.
- Define overlapping memberships and transitions.
- Define display strategy when users belong to many groups at once.

**Implementation phase (after approval)**
- Add location groups and timeline-based membership transitions.

### E. Multi-device UX and possible stack/file-structure evolution
**Design phase**
- Audit current UI and interaction patterns for desktop/tablet/mobile.
- Decide whether to keep static stack or introduce framework/tooling.
- Propose file-structure refactor options if staying vanilla JS.

**Implementation phase (after approval)**
- Implement responsive layout and interaction updates.
- Apply chosen structure/tooling decision.

### F. Workplaces/clubs/schools as group nodes
**Design phase**
- Decide whether to represent them only as relationship context or first-class groups.
- Define compatibility with location/family groups and timeline.
- Define visual encoding for multiple concurrent group memberships.

**Implementation phase (after approval)**
- Add group modeling and rendering consistent with unified design.

---

## 4) Cross-Feature Design Decisions Required Before Build

1. Canonical data model versioning strategy.
2. Submission architecture choice (no backend vs hosted backend).
3. Group rendering strategy when many memberships overlap.
4. Timeline rules for simultaneous group memberships.
5. Performance guardrails for expanding graph complexity.

---

## 5) Delivery Phases and Gates

### Phase 0 — Discovery + Clarification (current)
- Capture constraints, priorities, and acceptance criteria.
- Confirm data ownership and moderation expectations.

### Phase 1 — Architecture Design Package
- Produce data-model proposal and UX behavior spec.
- Include migration strategy from current JSON schema.
- **Gate: user design review required.**

### Phase 2 — Per-Feature Design Specs
- Produce feature-specific specs A–F with trade-offs.
- Include wireframe-level interaction descriptions.
- **Gate: user design review required per feature.**

### Phase 3 — Incremental Implementation Plan
- Break approved designs into small PR-ready steps.
- Sequence by dependency and user priority.
- **Gate: explicit go-ahead before coding.**

---

## 6) Resumable Tracker

| Item | Status | Owner | Notes |
|---|---|---|---|
| Unified architecture direction | Proposed | Agent | Pending user review |
| Submission workflow decision | Open | User+Agent | Needs trust/moderation decision |
| Family/marriage schema | Open | User+Agent | Pending design spec |
| Children model and rendering | Open | User+Agent | Pending design spec |
| Location membership intervals | Open | User+Agent | Pending design spec |
| Multi-device/stack decision | Open | User+Agent | Needs constraints and hosting context |
| Institution groups (work/school/club) | Open | User+Agent | Pending ontology decision |

---

## 7) Clarifying Questions (must answer before detailed design)

1. For user-submitted changes, do you want:
   - a) direct edits to live graph after approval,
   - b) proposal queue with manual merge,
   - c) fully open edits with rollback?
2. Do you want authentication/accounts, or anonymous submissions?
3. Should family groups exist only after marriage, or also for long-term partners without marriage?
4. For children, do you want hidden-until-birth behavior only, or age-stage visuals over time?
5. For locations, are memberships city-level, country-level, or both (hierarchical)?
6. For group overlaps, do you prefer:
   - a) nested visual containers,
   - b) tag/badge memberships with focus mode,
   - c) layer toggle per group type?
7. Should workplaces/schools/clubs be historical memberships (with start/end years) like locations?
8. Is preserving a no-build static deployment requirement, or are you open to a framework/build step?
9. What is priority order across features A–F?
10. Do you want design artifacts as markdown only, or also diagram files (e.g., Mermaid in markdown)?

---

## 8) Next Step

After you answer Section 7, the next check-in will be a detailed architecture/design package with explicit alternatives, trade-offs, and recommended decisions for approval before any implementation.
