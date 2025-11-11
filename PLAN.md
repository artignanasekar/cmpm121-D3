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
- [ ] add helpers to convert between map coordinates and grid cells in both directions.
- [#] add a simple way to turn a cell position into a reusable key for storing data.

### c. deterministic token spawning

- [#] add a deterministic random generator so the same input always gives the same output.
- [#] define how each cell’s base token (or emptiness) is decided from its position.
- [#] combine the base state with any player changes to get the current state of a cell.
- [ ] sanity-check that reloading the page in the same map area gives the same token layout.

### d. rendering the grid on the map

- [#] when the map view changes, figure out which grid cells are visible.
- [#] draw rectangles for visible cells and remove rectangles for cells that scroll out of view.
- [#] make each cell clickable so clicks go through a shared handler.

### e. showing token contents without clicking

- [#] display token values directly on the map for cells that contain tokens.
- [#] keep the visible token icons in sync when cells become empty or change value.
- [ ] adjust the visuals so token values are easy to see and read on the map.

### f. player position and movement

- [#] track the player’s position both as grid coordinates and map coordinates.
- [#] place a marker on the map for the player’s starting location.
- [#] move the marker when the player moves and keep the map roughly centered on them.
- [#] hook up keyboard controls so arrow keys move the player around the grid.

### g. interaction radius (only nearby cells are clickable)

- [#] define how to measure distance between two cells on the grid.
- [#] ignore clicks on cells that are too far away from the player.
- [#] visually highlight nearby cells and make distant cells fainter to show the radius.

### h. inventory and token “connecting”

- [#] track whether the player is currently holding a token or not.
- [#] show the current score and what the player is holding in the hud.
- [#] support picking up a token from a cell, dropping a token into an empty cell, and merging two matching tokens into a higher-value token that increases the score.
- [ ] confirm the player can never hold more than one token at a time.
- [ ] confirm clicking on distant cells does nothing and does not bypass the radius rules.

### i. testing + cleanup for d3.a

- [ ] do a full walkthrough from a fresh load:
  - map is centered on the classroom,
  - grid covers the visible map area,
  - tokens are visible and readable,
  - movement and interactions work as intended.
- [ ] add comments to the trickier parts of the map, grid, and deterministic spawning code.
- [ ] commit and push the work for this milestone with a clear message.

---

## d3.b – next milestone (placeholder)

i’ll fill this in once i have the d3.b assignment details.\
planned sections:

- map ui & feedback improvements
- more interesting token rules / scoring
- save / load and/or other design patterns
- extra affordances & polish

---

## d3.c – next milestone (placeholder)

to be defined. likely topics:

- full game loop (win/lose conditions)
- additional ux polish / animations
- final playtesting + balancing

---

## stretch ideas / backlog (optional)

things i might try later if there’s time:

- different token sprites instead of plain numbers.
- sub-goals / quests tied to real campus landmarks.
- sound effects when collecting / merging.
- on-map ui for showing interaction radius.
