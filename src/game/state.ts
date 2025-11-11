// src/game/state.ts

// High-level actions from input
export type Intent =
  | "move-left"
  | "move-right"
  | "jump";

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  onGround: boolean;
}

export interface Coin {
  x: number;
  y: number;
  radius: number;
  collected: boolean;
}

export interface GameState {
  player: Player;
  coins: Coin[];
  pendingIntents: Intent[];
}

// tweak these as you like
const PLAYER_START_X = 100;
const PLAYER_START_Y = 200;

export function createInitialState(): GameState {
  return {
    player: {
      x: PLAYER_START_X,
      y: PLAYER_START_Y,
      vx: 0,
      vy: 0,
      width: 24,
      height: 32,
      onGround: false,
    },
    coins: [
      { x: 200, y: 180, radius: 8, collected: false },
      { x: 260, y: 140, radius: 8, collected: false },
    ],
    pendingIntents: [],
  };
}
