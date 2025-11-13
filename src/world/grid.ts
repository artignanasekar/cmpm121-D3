import type { CellId, LatLng } from "./state.ts";

export function clampLng(lng: number): number {
  // keep longitudes in [-180, 180)
  const x = ((lng + 180) % 360 + 360) % 360 - 180;
  return x;
}

export function latLngToCellId(ll: LatLng, cellSizeDeg: number): CellId {
  const i = Math.floor((ll.lat - 0) / cellSizeDeg); // anchored at 0 lat (Null Island)
  const j = Math.floor((clampLng(ll.lng) - 0) / cellSizeDeg); // anchored at 0 lng
  return { i, j };
}

export function cellIdToBounds(id: CellId, cellSizeDeg: number) {
  const top = (id.i + 1) * cellSizeDeg;
  const left = (id.j) * cellSizeDeg;
  const bottom = id.i * cellSizeDeg;
  const right = (id.j + 1) * cellSizeDeg;
  return { top, left: clampLng(left), bottom, right: clampLng(right) };
}

export function cellKey(id: CellId): string {
  return `${id.i}:${id.j}`;
}

export function manhattan(a: CellId, b: CellId): number {
  return Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
}

/** enumerate all cell ids overlapping a leaflet LatLngBounds */
export function enumerateCellsInBounds(
  b: L.LatLngBounds,
  cellSizeDeg: number,
): CellId[] {
  const minLat = Math.floor(b.getSouth() / cellSizeDeg);
  const maxLat = Math.floor(b.getNorth() / cellSizeDeg);
  const minLng = Math.floor(b.getWest() / cellSizeDeg);
  const maxLng = Math.floor(b.getEast() / cellSizeDeg);

  const out: CellId[] = [];
  for (let i = minLat; i <= maxLat; i++) {
    for (let j = minLng; j <= maxLng; j++) {
      out.push({ i, j });
    }
  }
  return out;
}
