---
status: Accepted
owner: unassigned
reviewers: []
updated_at: 2026-10-31
feature_size: M
ticket: focus-steps
---

# 0003 — Count open-stair time as visibility segments

- **Status:** Accepted
- **Date:** 2026-10-31
- **Deciders:** Owner (during design walk)

## Context

Time on an open stair runs only while the Owner can see the app. Closing the last view, a crash, or a power loss must add 0 seconds for the gap. Several views count that time once (`spec.md` AC-08, §6). The storage shape of that rule must be fixed before data-model and implement.

## Decision drivers

- Shown finished time within 1 second of the counted span, or of a correction (`spec.md` §6).
- Gap while the app is not visible adds 0 seconds (`spec.md` §6).
- Several views must not double-count (`spec.md` AC-08, AC-15).

## Considered options

1. **Visibility segments** — persist accumulated seconds plus the start of the current visible segment; when the app is no longer visible, close the segment into accumulated; several views share one open-stair record.
2. **Start/stop wall clock only** — one open timestamp and one done timestamp; visibility is not modelled (fails AC-08).
3. **Client heartbeat** — the page periodically reports visibility; the server adds deltas.

## Decision outcome

**Chosen:** Option 1. Product rules for starting, pausing, and finishing a segment live in module `service` code (`home` / `open-stair` as they touch the open stair). Exact column names belong to data-model. Marking done freezes the accumulated span onto the finished stair. A correction replaces that finished span (feature behaviour already in the spec).

## Consequences

**Positive**
- Matches AC-08 and the §6 “gap adds 0 seconds” measurement.
- One open-stair row naturally de-duplicates several browser views.

**Negative**
- The process must learn when the last view is gone (page lifecycle / visibility signals) and persist a pause; a missed pause until the next request is an accepted skew bounded by the 1-second NFR where possible.
- Schema is richer than a single elapsed integer on an open row.

**Neutral**
- Heartbeat was rejected for v1; segment close on hide/unload is the signal path.

## Links

- Spec: [[../spec.md]] AC-08, §6
- SAD: [[../sad.md]] §4 / §6
- Related: [[0002-split-product-into-home-open-stair-and-correct-modules]]
