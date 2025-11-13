# arti gnanasekar plan – cmpm121 d3: world of bits

this file is my incremental software development plan for this d3 project.

conventions:

- `[#]` = done
- `[ ]` = not done yet
- i'll add notes / links under tasks if i need more detail or have to revise the plan.
- each milestone (d3.a, d3.b, …) gets its own section. i'll update old sections instead of
  deleting them so i have a history of how the plan changed.

---

## d3.a – core mechanics (map + grid + tokens)

goal for this milestone:\
have a playable world map where the player can move around, see a grid of cells, interact with nearby cells, and pick up / connect tokens.

### a. project + map setup

- [#] confirm the repo builds and runs the starter project without errors.
- [#] switch to a full-screen map layout with a hud at the bottom for score and held token.
- [#] load the map library from a cdn, center it on the classroom location, and make sure dragging and zooming feel normal.

### b. world grid and coordinate helpers

- [#] decide on a fixed cell size for the grid.
- [#] add helpers to convert between map coordinates and grid cells in both directions.\
  _added `latlng → cell id` and `cell id → bounds`._
- [#] add a simple way to turn a cell position into a reusable key for storing data.\
  _added `cellKey(i,j)`._

### c. deterministic token spawning

- [#] add a deterministic random generator so the same input always gives the same output.\
  _kept available for future use._
- [#] define how each cell’s base token (or emptiness) is decided from its position.\
  _initial approach implemented earlier._
- [ ] combine the base state with any player changes to get the current state of a cell.\
      _note: superseded by d3.b “memoryless cells”; robust persistence will return next assignment._
- [ ] sanity-check that reloading the page in the same map area gives the same token layout.\
      _deferred; d3.b intentionally allows farming via memoryless cells._

### d. rendering the grid on the map

- [#] when the map view changes, figure out which grid cells are visible.
- [#] draw rectangles for visible cells and remove rectangles for cells that scroll out of view.
- [#] make each cell clickable so clicks go through a shared handler.

### e. showing token contents without clicking

- [#] display token values directly on the map for cells that contain tokens.
- [#] keep the visible token icons in sync when cells become empty or change value.
- [ ] adjust the visuals so token values are easy to see and read on the map.\
      _todo: contrast + size tuning, especially at different zooms._

### f. player position and movement

- [#] track the player’s position both as grid coordinates and map coordinates.
- [#] place a marker on the map for the player’s starting location.
- [#] move the marker when the player moves and keep the map roughly centered on them.
- [#] hook up controls to move the player around the grid.\
  _now using on-screen n/w/s/e buttons; keyboard optional later._

### g. interaction radius (only nearby cells are clickable)

- [#] define how to measure distance between two cells on the grid.\
  _manhattan distance._
- [#] ignore clicks on cells that are too far away from the player.
- [#] visually highlight nearby cells and make distant cells fainter to show the radius.

### h. inventory and token “connecting”

- [#] track whether the player is currently holding a token or not.
- [#] show the current score and what the player is holding in the hud.\
  _hud shows held + bag contents + goal._
- [#] support picking up a token from a cell, dropping a token into an empty cell, and merging two matching tokens into a higher-value token that increases the score.
- [#] confirm the player can never hold more than one token at a time.\
  _enforced: one held; overflow goes to bag._
- [#] confirm clicking on distant cells does nothing and does not bypass the radius rules.

### i. testing + cleanup for d3.a

- [#] do a full walkthrough from a fresh load:
  - map is centered on the classroom (or chosen start),
  - grid covers the visible map area,
  - tokens are visible and readable,
  - movement and interactions work as intended.
- [ ] add comments to the trickier parts of the map, grid, and deterministic spawning code.
- [#] commit and push the work for this milestone with a clear message.

---

## d3.b – viewport-driven cells, null island grid, crafting win

goal for this milestone:\
separate player movement from map panning, keep cells visible to the edge of the current view, adopt an earth-spanning grid anchored at (0,0), make cells memoryless (for now), and extend crafting so a higher target value is required for victory.

### a. movement ui + map behavior

- [#] add on-screen buttons to move the player one grid step n/s/e/w.
- [#] allow panning/zooming the map without moving the player.
- [#] use the map’s `moveend/zoomend` event to trigger re-rendering of visible cells.

### b. earth-spanning grid anchored at null island

- [#] implement `latlng → cell id (i,j)` and `cell id → bounds` anchored at (0°,0°).
- [#] clamp/normalize longitude so the grid wraps across ±180°.
- [#] ensure grid cells fill the viewport all the way to the map’s edge.

### c. spawn/despawn + memoryless cells

- [#] spawn cells that come into view; despawn cells that leave view.
- [#] on spawn, give each cell a random chance to contain a token (values 1–3).
- [#] make cells memoryless: when despawned, they forget their contents (farming allowed for this milestone).
- [ ] note: replace memoryless behavior with robust persistence in the next assignment.

### d. interaction rules

- [#] allow interaction only within a manhattan radius of 3 cells from the player.
- [#] color nearby cells differently from distant ones for clear feedback.
- [#] clicking a distant cell shows a friendly “too far” status.

### e. inventory + crafting + win condition

- [#] support held token + bag; picking up fills held first, then bag.
- [#] crafting rule: two equal tokens → one of value+1.
- [#] add victory condition: craft a token with value ≥ target (shown in hud).
- [ ] stretch: add sounds/animation when crafting or winning.

### f. testing + cleanup for d3.b

- [#] verify player buttons move exactly one grid step per press.
- [#] confirm cells always cover the viewport after pans/zooms.
- [#] confirm “too far” interactions are blocked.
- [ ] pass over code comments and small visual polish (token label size/contrast).
- [#] commit and push with a clear message describing “viewport-driven cells + crafting win”.

---

## d3.c – next milestone (placeholder)

to be defined. likely topics:

- replace memoryless cells with robust, consistent per-cell state across sessions
- fuller game loop (progression, balancing, ui feedback)
- performance + polish (batching, label readability at all zooms)

---

## stretch ideas / backlog (optional)

things i might try later if there’s time:

- different token sprites instead of plain numbers.
- sub-goals / quests tied to real campus landmarks.
- sound effects when collecting / merging.
- on-map ui for showing interaction radius.
- keyboard bindings mirroring the n/w/s/e buttons.
