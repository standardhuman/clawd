# SailorSkills Marketplace: Trust Graph Design

*Created: July 8, 2026*
*Status: Building — 3 sub-agents active (schema, traversal, UI)*

## The Idea

Replace directory-style service discovery with a **trust graph** — the same way marina communities actually work. When Bob needs a hull diver in Emeryville, he doesn't want a list. He wants someone *vouched for* by people he trusts.

## Node Types

### Person
The primary node. Everyone is a person first.
- `id`, `name`, `type` (boat_owner | service_provider | both | sailor)
- A person can be multiple types

### Boat
- `id`, `name`, `type` (sailboat | powerboat | etc.)
- Connected to an owner and a location (where it's kept)

### Location
- `id`, `name`, `type` (marina | service_area | business_location | sailing_grounds)
- Examples: Berkeley Marina, Emeryville, San Francisco Bay, Richardson Bay
- Locations can be hierarchical (Berkeley Marina → Berkeley → East Bay → SF Bay Area)

### Skill
- `id`, `name`, `category`
- Examples: hull_cleaning, fiberglass_repair, electrical, canvas, sail_making, rigging, detailing, engine_work, plumbing, sailing_instruction

## Edge Types

### Person → Person: RECOMMENDS
The most important edge. Directional. Carries trust.
- `strength` (strong | standard | casual) — how well they know each other
- `context` (optional) — what they'd recommend them for
- Example: Ichiru → Brian (strong, context: hull_cleaning)

### Person → Skill: PROVIDES
Service providers connected to what they do.
- `verified` (boolean) — has someone confirmed this?
- Example: Brian → hull_cleaning

### Skill → Location: SERVED_IN (scoped to provider)
Where a provider offers a specific skill. This is a **hyperedge** (Person + Skill + Location):
- Brian + hull_cleaning + Berkeley ✓
- Brian + hull_cleaning + Emeryville ✗
- Brian + sailing_instruction + Berkeley ✓
- Brian + sailing_instruction + SF ✓
- Brian + sailing_instruction + Richmond ✓
- Kaio + hull_cleaning + Emeryville ✓
- Kaio + hull_cleaning + Oakland ✓
- Lowell + canvas + Berkeley ✓
- Lowell + canvas + Sausalito ✓ (etc.)
- Lowell + hull_cleaning + Richmond ✓
- Lowell + hull_cleaning + Brickyard Cove ✓

### Person → Boat: OWNS
- Example: Bob Smith → Spirit

### Boat → Location: KEPT_AT
- Example: Spirit → Emeryville

### Person → Location: BASED_IN
- Where a person lives/operates from
- Example: Brian → Berkeley, Ichiru → Berkeley

## The Traversal (Bob's Search)

Bob Smith wants: **hull cleaning in Emeryville**

```
Query: SKILL=hull_cleaning, LOCATION=Emeryville

1. Start at Bob Smith
2. Traverse RECOMMENDS edges outward
3. At each person node, check:
   - Do they PROVIDE hull_cleaning?
   - Is that skill SERVED_IN Emeryville?
4. If yes → return that person + the path

Result:
  Bob Smith →[recommends]→ Ichiru →[recommends]→ Brian →[recommends]→ Kaio
  Kaio PROVIDES hull_cleaning SERVED_IN Emeryville ✓
  
  Path length: 3 hops
  Trust chain: Bob trusts Ichiru, Ichiru trusts Brian, Brian trusts Kaio
```

If Kaio were also connected to someone Bob knows directly, the shorter path would rank higher.

## Brian's Seed Network (Starting Graph)

### Service Providers Brian Can Map Immediately
| Person | Skills | Locations |
|--------|--------|-----------|
| Brian Cline | hull_cleaning, sailing_instruction | Berkeley (hull), Bay-wide (sailing) |
| Kaio (Maya's Diving) | hull_cleaning | Emeryville, Oakland, + more |
| Ichiru | electrical, fiberglass, engine, plumbing, component_install | Emeryville, Berkeley, + more |
| Lowell Harris | canvas, hull_cleaning | Berkeley (canvas), Richmond/Brickyard (diving) |
| *~20 more providers Brian knows* | *various* | *various* |

### Boat Owners Brian Can Seed
- ~150 boat owners from SailorSkills client list (Notion)
- Each has: boat name, location, and Brian as a direct connection
- Many would have their own recommendation edges to add

### Initial Graph Density Estimate
- ~175 person nodes (150 owners + 25 providers)
- ~175 RECOMMENDS edges from Brian alone
- ~25 PROVIDES edges
- ~50+ SERVED_IN edges
- If each of those 175 people adds even 3 recommendations → ~525 more edges
- That's a usable graph for the East Bay

## Expansion Vectors

### Crew Finding
- New edge type: Person → SEEKS_CREW / AVAILABLE_AS_CREW
- Skill nodes like racing_crew, delivery_crew, cruising_crew
- Location matters (where are they sailing from/to)

### Sailing Grounds & Local Knowledge
- Location type: sailing_grounds
- New edge: Person → KNOWS_ABOUT → Location (sailing_grounds)
- Traverse: "Who knows about anchoring in Richardson Bay?" → find people connected to that location with local knowledge
- People love sharing this — good for engagement and cold start

### Events & Community
- Latitude 38 crew parties, races, rendezvous
- Event nodes connected to locations and people
- Natural way to form new recommendation edges (you meet someone at a crew party, you add them)

## Open Questions

1. **Data entry UX** — How does Brian (or anyone) enter recommendations? Needs to be dead simple. "I recommend [person] for [skill] in [location]" as a single interaction.
2. **Trust decay** — Do old recommendations lose weight? Should there be a "last confirmed" timestamp?
3. **Privacy** — Do people need to opt in to be nodes? Can Brian add Ichiru without Ichiru being on the platform?
4. **Negative signals** — Is there a "don't recommend" edge? Probably not explicitly, but absence of recommendation is itself a signal.
5. **Graph storage** — Neo4j (native graph DB), or model it in Supabase with junction tables? Supabase is simpler and Brian already uses it. Graph queries via recursive CTEs or a lightweight graph layer.
6. **Display** — How do you show the trust path to Bob? A visual graph? A sentence? "Kaio, recommended by Brian, who is recommended by Ichiru (your connection)"?

## Technical Direction

For MVP, Supabase with relational tables modeling the graph is probably fine:
- `people` table
- `boats` table  
- `locations` table
- `skills` table
- `recommendations` (person_id → person_id, strength, context)
- `provider_skills` (person_id → skill_id)
- `skill_locations` (person_id → skill_id → location_id)
- `boat_ownership` (person_id → boat_id)
- `boat_locations` (boat_id → location_id)

Traversal via recursive CTE in Postgres (Supabase supports this natively). Only move to Neo4j if query complexity demands it.
