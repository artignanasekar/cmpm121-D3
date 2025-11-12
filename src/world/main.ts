import { tryCraft } from "./crafting.ts";
import { latLngToCellId } from "./grid.ts";
import { World } from "./map.ts";
import type { GameState } from "./state.ts";

// initial game state
const state: GameState = {
  cellSizeDeg: 0.002, // denser than 0.01, tweak to after implementing movement
  interactRadius: 3, // cells (Manhattan)
  targetValue: 6, // win condition
  playerLL: { lat: 0.002, lng: 0.002 }, // start near Null Island
  playerCell: { i: 0, j: 0 },
  held: null,
  bag: [],
  hasWon: false,
};

// derive playerCell
state.playerCell = latLngToCellId(state.playerLL, state.cellSizeDeg);

// mount map
const world = new World(state, document.getElementById("map")!);
world.updateHUD();

// movement (one grid shift (up down left right)
function move(di: number, dj: number) {
  const lat = state.playerLL.lat + di * state.cellSizeDeg;
  const lng = state.playerLL.lng + dj * state.cellSizeDeg;
  world.setPlayer({ lat, lng });
  document.getElementById("status")!.textContent = "moved player";
}

document.getElementById("btn-n")!.addEventListener("click", () => move(+1, 0));
document.getElementById("btn-s")!.addEventListener("click", () => move(-1, 0));
document.getElementById("btn-e")!.addEventListener("click", () => move(0, +1));
document.getElementById("btn-w")!.addEventListener("click", () => move(0, -1));

// craft button
document.getElementById("craft")!.addEventListener("click", () => {
  const msg = tryCraft(state);
  document.getElementById("status")!.textContent = msg;
  world.updateHUD();
});

// drop helper to help nudge user to click a cell nearby
document.getElementById("drop")!.addEventListener("click", () => {
  world.recenterOnPlayer();
  document.getElementById("status")!.textContent =
    "click a nearby cell to drop";
});
