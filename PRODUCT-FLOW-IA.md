# Product Flow and Information Architecture

## Goal

The product should help a non-technical user do four things with minimal friction:

1. Add a vehicle quickly.
2. Record important events for that vehicle.
3. Understand what needs attention now.
4. Review history and costs without digging through multiple pages.

The interface should not optimize for dashboard density. It should optimize for confidence, orientation, and low-friction data entry.

## Core User Mental Model

Users do not think in terms of pages or entities. They think:

1. "This is my vehicle."
2. "What is the next thing I need to do?"
3. "I need to add a new expense, refuel, or deadline."
4. "I want to see what happened over time."

The product should follow that mental model directly.

## Product Structure

### Level 1: Garage

Purpose:
Select a vehicle or create a new one.

What to show:

- Vehicle identity: plate, make/model, type.
- A compact signal of the next important thing.
- Clear CTA to add a vehicle.

What not to emphasize:

- Aggregate KPIs.
- Dense cards with too many status chips.

### Level 2: Vehicle Page

Purpose:
This is the center of the product.

What to show:

- Vehicle identity and quick actions.
- One clear "next thing to handle".
- A single timeline that mixes deadlines, expenses, and refuels.
- Access to dedicated sections when the user needs depth.

What not to show:

- Multiple summary cards with low-value counts.
- Too many parallel content blocks competing for attention.

### Level 3: Dedicated Sections

Purpose:
Focused input or focused review.

Sections:

- Deadlines
- Movements
- Details

Each section should have one clear job.

## Data Model by Priority

### Vehicle Identity

Always important:

- Plate
- Vehicle type

Important but optional at creation time:

- Make
- Model
- Year
- Fuel type
- Odometer

Administrative or advanced:

- Status
- Sold date
- Sold price
- Sold notes

### Deadlines

Minimum useful input:

- Deadline type
- Due date

Optional:

- Amount

Secondary:

- Notes

### Expense

Minimum useful input:

- Date
- Category
- Amount

Optional:

- Description
- Odometer
- Notes

### Refuel

Minimum useful input:

- Date
- Amount
- Odometer
- Fuel type

Optional:

- Liters or kWh
- Notes

## Recommended User Flow

### Flow 1: First Vehicle Setup

1. User clicks `Add vehicle`.
2. Required fields are only:
   - plate
   - vehicle type
3. The system saves the vehicle immediately.
4. User lands on the vehicle page, not back on the garage list.
5. The page presents the three next recommended actions:
   - add deadlines
   - add first expense
   - add first refuel

### Flow 2: Ongoing Use

The normal loop should be:

1. Open vehicle.
2. See next important item.
3. Add one new event.
4. Confirm it in the timeline.

The timeline should become the default memory of the vehicle.

### Flow 3: Review and Maintenance

When the user wants more detail:

- Deadlines page for structured upkeep.
- Movements page for costs and trends.
- Details page for metadata and administrative edits.

## Recommended Page Responsibilities

### Garage

Main responsibility:
Vehicle selection and quick orientation.

Content:

- Vehicle list
- A compact next-step hint per vehicle
- `Add vehicle` CTA

### Vehicle Page

Main responsibility:
Current state plus unified timeline.

Content:

- Vehicle header
- Quick actions
- Next important item
- Setup guidance if core data is missing
- Timeline of deadlines, expenses, and refuels

### Deadlines Page

Main responsibility:
Maintain the three critical deadlines.

Content:

- Deadline form
- Already saved deadlines
- Clear indication that amount is optional

### Movements Page

Main responsibility:
Review spending and refueling history.

Content:

- Timeline or list first
- Charts second

Charts should support review, not replace basic readability.

### Details Page

Main responsibility:
Administrative and descriptive data.

Content:

- Plate, make, model, type
- Fuel type
- Odometer
- Status
- Sale information
- Export

## Setup Guidance

The product should explicitly support an incomplete setup.

Recommended setup checklist after vehicle creation:

- Add insurance deadline
- Add tax deadline
- Add inspection deadline
- Add first expense or first refuel

This is not an error state. It is a guided setup state.

## Design Constraints Derived From The Flow

- One page should not try to summarize everything numerically.
- Counts are lower priority than actions.
- The most useful summary is chronological, not analytical.
- Optional fields must be visibly optional.
- Advanced information should live in dedicated sections, not in the primary flow.

## Decision Summary

The product should be centered on:

1. Fast vehicle creation with minimal required data.
2. Vehicle page as the main working surface.
3. One clean timeline as the main reading experience.
4. Dedicated sections for focused tasks.
5. Progressive enrichment instead of forcing complete data upfront.
