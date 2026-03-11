# Implementation Roadmap

## Phase 1: Clarify The Core Flow

Goal:
Make the current product reflect the intended mental model with minimal structural changes.

Tasks:

1. Redirect new vehicle creation to the vehicle page.
2. Make required vs optional fields explicit in all creation flows.
3. Add setup guidance on the vehicle page when key data is missing.
4. Keep the vehicle page centered on next action plus timeline.

## Phase 2: Reduce Input Friction

Goal:
Make data entry faster and less intimidating.

Tasks:

1. Vehicle creation:
   - visually separate required and optional fields
   - keep only plate and type as required
2. Expense form:
   - group required fields first
   - visually collapse optional notes and odometer
3. Refuel form:
   - clarify required fields by fuel type
   - keep secondary fields clearly optional when possible
4. Deadlines form:
   - emphasize due date as primary
   - keep amount clearly optional

## Phase 3: Make The Vehicle Page The Operational Hub

Goal:
Ensure the vehicle page is enough for most users most of the time.

Tasks:

1. Simplify the hero/header further if needed.
2. Show one setup checklist when the vehicle is incomplete.
3. Keep the timeline readable and action-oriented.
4. Move low-value metrics out of the primary surface.

## Phase 4: Rework Review Surfaces

Goal:
Make review pages support the main flow instead of competing with it.

Tasks:

1. Movements page:
   - show a list/timeline before charts
   - keep charts as secondary analysis
2. Garage page:
   - show cleaner next-step hints per vehicle
3. Details page:
   - become purely administrative

## Phase 5: Advanced Quality Pass

Goal:
Polish product clarity and completeness after the flow is stable.

Tasks:

1. Add empty states tied to action.
2. Improve copy consistency.
3. Add visual hierarchy refinements.
4. Add tests for critical flows:
   - create vehicle
   - add deadline
   - add expense
   - add refuel

## Implementation Order For This Turn

The implementation in this turn should cover:

1. Redirect after vehicle creation to the vehicle page.
2. Clarify required and optional fields in create/update flows.
3. Add a guided setup block to the vehicle page.
4. Keep the simplified vehicle timeline as the primary reading surface.
