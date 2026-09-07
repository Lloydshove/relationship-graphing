# Design Review Log

Use this file to keep design decisions resumable across sessions.

## Decision Entries

| Date | Topic | Options Considered | Decision | Rationale | Approved By | Implementation Unlocked |
|---|---|---|---|---|---|---|
| 2026-09-07 | Submission architecture | Proposal queue vs direct live with controls | Direct live updates with rollback control; implementation last | Fast updates with safety via rollback | @Lloydshove | No (rollback mechanism pending) |
| 2026-09-07 | Submission auth | Anonymous vs basic auth vs stronger auth | Basic auth | Minimum control with low setup overhead | @Lloydshove | No |
| 2026-09-07 | Group rendering strategy | Layer-only vs nested/overlap support | Nested/overlapping groups | Users can be in multiple groups at once | @Lloydshove | No (detailed render spec pending) |
| 2026-09-07 | Family model | Marriage-only vs dating+marriage milestones | Dating year + marriage year; stronger grouping at marriage | Captures relationship progression over time | @Lloydshove | No (detailed schema pending) |
| 2026-09-07 | Children model | Birth-only vs staged life phases | Birth-year visibility only; smaller nodes in family | Keep initial behavior simple and time-based | @Lloydshove | No |
| 2026-09-07 | Location membership model | City vs country vs hierarchical | Country-level only for now | Limit scope for first release | @Lloydshove | No |
| 2026-09-07 | Institution groups model | Required groups vs optional | Workplaces/clubs/schools as optional toggle | Reduce clutter while preserving utility | @Lloydshove | No |
| 2026-09-07 | Multi-device/stack direction | Static only vs build output static | Must work on GitHub without separate hosting if possible | Preserve easy deployment path | @Lloydshove | No (final build policy pending) |
| 2026-09-07 | Feature order | Mixed order | Smaller changes first; submission feature last | Risk reduction and staged rollout | @Lloydshove | Yes (planning order approved) |

## Review Gate Checklist

- [x] Design package reviewed by @Lloydshove (initial requirements decisions)
- [x] Explicit approval recorded per decision
- [ ] Implementation scope tied to approved decisions only
- [ ] Any unresolved design questions tracked before coding
