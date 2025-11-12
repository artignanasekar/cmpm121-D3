import { L } from "../_leafletWorkaround.ts";
import {
  cellIdToBounds,
  cellKey,
  enumerateCellsInBounds,
  latLngToCellId,
  manhattan,
} from "./grid.ts";
import type { Cell, CellId, GameState, LatLng, Token } from "./state.ts";

/** Handles Leaflet map + cell layer + interactions */
export class World {
  readonly map: L.Map;
  readonly cellLayer = L.layerGroup();
  readonly cellLabels = L.layerGroup();
  readonly playerMarker: L.CircleMarker;

  private visible = new Map<string, Cell>();

  constructor(readonly state: GameState, mount: HTMLElement) {
    this.map = L.map(mount, { worldCopyJump: true, preferCanvas: true })
      .setView([state.playerLL.lat, state.playerLL.lng], 17);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(this.map);

    this.cellLayer.addTo(this.map);
    this.cellLabels.addTo(this.map);

    this.playerMarker = L.circleMarker(
      [state.playerLL.lat, state.playerLL.lng],
      {
        radius: 6,
        weight: 2,
        color: "#046",
        fillColor: "#9df",
        fillOpacity: 0.9,
      },
    )
      .addTo(this.map)
      .bindTooltip("you", {
        permanent: true,
        direction: "top",
        offset: L.point(0, -8),
      });

    this.map.on("moveend zoomend", () => this.refresh());
    this.refresh();
  }

  recenterOnPlayer() {
    this.map.setView(
      [this.state.playerLL.lat, this.state.playerLL.lng],
      this.map.getZoom(),
      { animate: true },
    );
  }

  setPlayer(ll: LatLng) {
    this.state.playerLL = ll;
    this.state.playerCell = latLngToCellId(ll, this.state.cellSizeDeg);
    this.playerMarker.setLatLng([ll.lat, ll.lng]);
    this.refresh();
  }

  /** Recompute which cells are visible and (re)spawn/despawn memorylessly */
  refresh() {
    const bounds = this.map.getBounds();
    const wanted = enumerateCellsInBounds(bounds, this.state.cellSizeDeg);
    const wantedKeys = new Set(wanted.map(cellKey));

    // despawn cells that are no longer visible
    for (const [k, c] of this.visible) {
      if (!wantedKeys.has(k)) {
        c.rect.remove();
        if (c.label) c.label.remove();
        this.visible.delete(k);
      }
    }

    // spawn needed cells
    for (const id of wanted) {
      const key = cellKey(id);
      if (this.visible.has(key)) continue;

      // memoryless spawn: random token (30% chance) with values 1..3
      const token: Token | null = Math.random() < 0.3
        ? { value: 1 + Math.floor(Math.random() * 3) }
        : null;

      const b = cellIdToBounds(id, this.state.cellSizeDeg);
      const rect = L.rectangle(
        [[b.bottom, b.left], [b.top, b.right]],
        {
          weight: 1,
          color: this.isInteractable(id) ? "#56a" : "#bbb",
          fillColor: token ? "#ffe" : "#f9f9f9",
          fillOpacity: 0.35,
        },
      ).addTo(this.cellLayer);

      // label showing token value (if any)
      let label: L.Marker<any> | null = null;
      if (token) {
        const center: [number, number] = [
          (b.bottom + b.top) / 2,
          (b.left + b.right) / 2,
        ];
        label = L.marker(center, {
          interactive: false,
          keyboard: false,
          icon: L.divIcon({
            className: "",
            html: `<div style="font-weight:700">${token.value}</div>`,
          }),
        }).addTo(this.cellLabels);
      }

      const cell: Cell = { id, token, rect, label };
      this.visible.set(key, cell);

      rect.on("click", () => this.onCellClick(cell));
    }

    // recolor for interaction radius feedback
    for (const c of this.visible.values()) {
      c.rect.setStyle({
        color: this.isInteractable(c.id) ? "#56a" : "#bbb",
      });
    }
  }

  private isInteractable(id: CellId): boolean {
    return manhattan(id, this.state.playerCell) <= this.state.interactRadius;
  }

  private onCellClick(cell: Cell) {
    const status = document.getElementById("status")!;
    if (!this.isInteractable(cell.id)) {
      status.innerHTML = `<span class="warn">too far to interact</span>`;
      return;
    }

    // pick up token if present and we can hold or bag it
    if (cell.token) {
      if (!this.state.held) {
        this.state.held = cell.token;
      } else {
        this.state.bag.push(cell.token);
      }
      // remove from cell (memoryless cell can respawn later when offscreen)
      cell.token = null;
      cell.rect.setStyle({ fillColor: "#f9f9f9" });
      if (cell.label) {
        cell.label.remove();
        cell.label = null;
      }
      status.textContent = "picked up token";
      this.updateHUD();
      return;
    }

    // if empty and we're holding something, drop the held token here
    if (!cell.token && this.state.held) {
      cell.token = this.state.held;
      this.state.held = null;
      const b = cellIdToBounds(cell.id, this.state.cellSizeDeg);
      const center: [number, number] = [
        (b.bottom + b.top) / 2,
        (b.left + b.right) / 2,
      ];
      cell.label = L.marker(center, {
        interactive: false,
        keyboard: false,
        icon: L.divIcon({
          className: "",
          html: `<div style="font-weight:700">${cell.token.value}</div>`,
        }),
      }).addTo(this.cellLabels);
      cell.rect.setStyle({ fillColor: "#ffe" });
      status.textContent = "dropped token";
      this.updateHUD();
      return;
    }

    status.textContent = "nothing to do";
  }

  updateHUD() {
    (document.getElementById("player-ij")!).textContent =
      `i=${this.state.playerCell.i}, j=${this.state.playerCell.j}`;
    (document.getElementById("held")!).textContent = this.state.held
      ? `${this.state.held.value}`
      : "—";
    (document.getElementById("bag")!).textContent = `[${
      this.state.bag.map((t) => t.value).join(", ")
    }]`;
    const status = document.getElementById("status")!;
    if (this.state.hasWon) {
      status.innerHTML =
        `<span class="win">victory! crafted ≥ ${this.state.targetValue}</span>`;
    }
  }
}
