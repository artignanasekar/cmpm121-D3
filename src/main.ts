// leaflet is loaded via <script> tag in index.html, so treat it as a global.
declare const L: any;

// simple deterministic pseudo-random function: same seed -> same value in [0,1)
function luck(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// mix row/col into a single numeric seed.
function cellSeed(row: number, col: number): number {
  return (row * 73856093) ^ (col * 19349663);
}

const PLAYER_START_LAT = 36.99898;
const PLAYER_START_LNG = -122.05502;

// size of each grid cell (degrees).
const CELL_SIZE = 0.0001;

// how many cells away from the player you’re allowed to interact.
const CLICK_RADIUS_CELLS = 3;

// chance any given cell has a token.
const TOKEN_CHANCE = 0.35;

type CellContent = {
  hasToken: boolean;
  value: number; // 0 if no token
};

type CellOverride = Partial<CellContent>;

const cellOverrides = new Map<string, CellOverride>();

// token label markers: one per cell that currently has a token.
const tokenMarkers = new Map<string, any>();

// grid cell rectangles currently rendered on the map (only for visible area).
const cellRects = new Map<string, any>();

// player state
let playerLat = PLAYER_START_LAT;
let playerLng = PLAYER_START_LNG;
let playerRow = latToRow(playerLat);
let playerCol = lngToCol(playerLng);

let holding: number | null = null;
let score = 0;

// HUD DOM elements
const scoreEl = document.getElementById("score")!;
const holdingEl = document.getElementById("holding")!;

function key(row: number, col: number): string {
  return `${row},${col}`;
}

function latToRow(lat: number): number {
  return Math.floor(lat / CELL_SIZE);
}

function lngToCol(lng: number): number {
  return Math.floor(lng / CELL_SIZE);
}

function rowToLat(row: number): number {
  return row * CELL_SIZE;
}

function colToLng(col: number): number {
  return col * CELL_SIZE;
}

/** bounds of a cell as Leaflet expects them, given integer row/col. */
function cellBounds(
  row: number,
  col: number,
): [[number, number], [number, number]] {
  const south = rowToLat(row);
  const north = rowToLat(row + 1);
  const west = colToLng(col);
  const east = colToLng(col + 1);
  return [
    [south, west],
    [north, east],
  ];
}

/** center of a cell. */
function cellCenter(row: number, col: number): [number, number] {
  const [bSouthWest, bNorthEast] = cellBounds(row, col);
  const lat = (bSouthWest[0] + bNorthEast[0]) / 2;
  const lng = (bSouthWest[1] + bNorthEast[1]) / 2;
  return [lat, lng];
}

/** deterministic base content for a cell from its (row, col). */
function baseCell(row: number, col: number): CellContent {
  const r = luck(cellSeed(row, col));
  if (r < TOKEN_CHANCE) {
    // use different ranges of r to pick different values.
    let value = 1;
    if (r < 0.12) value = 1;
    else if (r < 0.24) value = 2;
    else if (r < 0.32) value = 4;
    else value = 8;

    return { hasToken: true, value };
  }
  return { hasToken: false, value: 0 };
}

/** base + override (what we actually show / interact with). */
function getCell(row: number, col: number): CellContent {
  const b = baseCell(row, col);
  const o = cellOverrides.get(key(row, col));
  if (!o) return b;
  return {
    hasToken: o.hasToken ?? b.hasToken,
    value: o.value ?? b.value,
  };
}

/** max of row/col distance: like a Chebyshev distance in grid cells. */
function cellDistance(
  aRow: number,
  aCol: number,
  bRow: number,
  bCol: number,
): number {
  return Math.max(Math.abs(aRow - bRow), Math.abs(aCol - bCol));
}

const map = L.map("map", {
  center: [PLAYER_START_LAT, PLAYER_START_LNG],
  zoom: 18,
  minZoom: 16,
  maxZoom: 20,
  zoomControl: true,
  attributionControl: true,
});

// default tile layer.
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 20,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Player marker
const playerMarker = L.marker([playerLat, playerLng]).addTo(map);
playerMarker.bindPopup("You are here");

// regenerate visible grid whenever the map stops moving or zooming.
map.on("moveend", () => {
  updateVisibleCells();
});

function updateVisibleCells(): void {
  const bounds = map.getBounds();
  const south = bounds.getSouth();
  const north = bounds.getNorth();
  const west = bounds.getWest();
  const east = bounds.getEast();

  const minRow = latToRow(south);
  const maxRow = latToRow(north);
  const minCol = lngToCol(west);
  const maxCol = lngToCol(east);

  const neededKeys = new Set<string>();

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const k = key(row, col);
      neededKeys.add(k);

      if (!cellRects.has(k)) {
        const rect = createCellRect(row, col);
        cellRects.set(k, rect);
      }

      updateCellAppearance(row, col);
    }
  }

  // remove any rectangles / token markers that are no longer in view.
  for (const [k, rect] of cellRects) {
    if (!neededKeys.has(k)) {
      map.removeLayer(rect);
      cellRects.delete(k);

      const tokenMarker = tokenMarkers.get(k);
      if (tokenMarker) {
        map.removeLayer(tokenMarker);
        tokenMarkers.delete(k);
      }
    }
  }
}

/** create the clickable rectangle for a cell. */
function createCellRect(row: number, col: number) {
  const bounds = cellBounds(row, col);
  const rect = L.rectangle(bounds, {
    color: "#007bff",
    weight: 1,
    fillOpacity: 0.0,
    interactive: true,
  }).addTo(map);

  rect.on("click", () => {
    handleCellClick(row, col);
  });

  return rect;
}

/** update color / token label for a single cell rectangle. */
function updateCellAppearance(row: number, col: number): void {
  const k = key(row, col);
  const rect = cellRects.get(k);
  if (!rect) return;

  const content = getCell(row, col);
  const dist = cellDistance(row, col, playerRow, playerCol);
  const isNear = dist <= CLICK_RADIUS_CELLS;

  const baseStyle: any = {
    color: "#007bff",
    weight: 1,
    opacity: isNear ? 0.9 : 0.25,
    fillOpacity: isNear && content.hasToken ? 0.25 : 0.0,
  };

  rect.setStyle(baseStyle);

  // manage the token label marker so token contents are visible without clicking.
  const existingTokenMarker = tokenMarkers.get(k);

  if (content.hasToken) {
    const center = cellCenter(row, col);
    const icon = L.divIcon({
      className: "token-label",
      iconSize: [26, 26],
      html: `<div>${content.value}</div>`,
    });

    if (existingTokenMarker) {
      existingTokenMarker.setLatLng(center);
      existingTokenMarker.setIcon(icon);
    } else {
      const marker = L.marker(center, {
        icon,
        interactive: false,
      }).addTo(map);
      tokenMarkers.set(k, marker);
    }
  } else {
    if (existingTokenMarker) {
      map.removeLayer(existingTokenMarker);
      tokenMarkers.delete(k);
    }
  }
}

function handleCellClick(row: number, col: number): void {
  const dist = cellDistance(row, col, playerRow, playerCol);
  if (dist > CLICK_RADIUS_CELLS) {
    // too far away: can’t interact.
    return;
  }

  const k = key(row, col);
  const content = getCell(row, col);

  // case 1: empty hand, cell has token -> pick up
  if (holding === null && content.hasToken) {
    holding = content.value;
    holdingEl.textContent = `${holding} pts`;

    cellOverrides.set(k, { hasToken: false, value: 0 });
    updateCellAppearance(row, col);
    return;
  }

  // case 2: holding a token, cell is empty -> drop
  if (holding !== null && !content.hasToken) {
    cellOverrides.set(k, { hasToken: true, value: holding });
    holding = null;
    holdingEl.textContent = "nothing";
    updateCellAppearance(row, col);
    return;
  }

  // case 3: holding a token, cell has a token of same value -> merge (connect)
  if (holding !== null && content.hasToken && content.value === holding) {
    const newValue = content.value * 2;
    cellOverrides.set(k, { hasToken: true, value: newValue });

    // Gain score equal to the merged token value.
    score += newValue;
    scoreEl.textContent = String(score);

    holding = null;
    holdingEl.textContent = "nothing";
    updateCellAppearance(row, col);
    return;
  }

  // other combinations do nothing for now.
}

function movePlayer(deltaRow: number, deltaCol: number): void {
  playerRow += deltaRow;
  playerCol += deltaCol;

  const [lat, lng] = cellCenter(playerRow, playerCol);
  playerLat = lat;
  playerLng = lng;

  playerMarker.setLatLng([playerLat, playerLng]);
  map.panTo([playerLat, playerLng], { animate: true });

  // update appearance of nearby cells so the near/far styling stays correct.
  for (const k of cellRects.keys()) {
    const [rStr, cStr] = k.split(",");
    const r = Number(rStr);
    const c = Number(cStr);
    updateCellAppearance(r, c);
  }
}

// use globalThis instead of window to keep Deno’s linter happy
globalThis.addEventListener("keydown", (ev: KeyboardEvent) => {
  switch (ev.key) {
    case "ArrowUp":
      movePlayer(1, 0);
      break;
    case "ArrowDown":
      movePlayer(-1, 0);
      break;
    case "ArrowLeft":
      movePlayer(0, -1);
      break;
    case "ArrowRight":
      movePlayer(0, 1);
      break;
    default:
      return;
  }

  ev.preventDefault();
});

updateVisibleCells();
scoreEl.textContent = String(score);
holdingEl.textContent = "nothing";
