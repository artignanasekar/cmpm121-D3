export type CellId = { i: number; j: number }; // grid indices
export type LatLng = { lat: number; lng: number };

export type Token = { value: number }; // simple value token

export type Cell = {
  id: CellId;
  // "memoryless" contents: generated on spawn and discarded on despawn
  token: Token | null;
  rect: L.Rectangle; // Leaflet rect for rendering
  label?: L.Marker; // optional label marker
};

export type GameState = {
  cellSizeDeg: number; // e.g., 0.01°
  interactRadius: number; // in cells (Manhattan distance)
  targetValue: number; // win threshold
  playerLL: LatLng; // player true lat/lng
  playerCell: CellId; // derived
  held: Token | null;
  bag: Token[]; // secondary inventory for crafting
  hasWon: boolean;
};
