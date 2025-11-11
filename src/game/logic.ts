// src/game/logic.ts
import type { Coin, GameState, Intent } from "./state.ts";

const GRAVITY = 900; // pixels / s^2
const MOVE_SPEED = 220; // pixels / s
const JUMP_SPEED = -400; // pixels / s
const FLOOR_Y = 260; // ground y

export function updateGame(prev: GameState, dt: number): GameState {
  const state: GameState = {
    ...prev,
    player: { ...prev.player },
    coins: prev.coins.map((c: Coin) => ({ ...c })), // <— typed 'c'
    pendingIntents: [],
  };

  for (const intent of prev.pendingIntents) {
    handleIntent(state, intent);
  }

  applyPhysics(state, dt);
  handleGroundCollision(state);
  handleCoinCollisions(state);

  return state;
}

function handleIntent(state: GameState, intent: Intent): void {
  const p = state.player;

  switch (intent) {
    case "move-left":
      p.vx = -MOVE_SPEED;
      break;
    case "move-right":
      p.vx = MOVE_SPEED;
      break;
    case "jump":
      if (p.onGround) {
        p.vy = JUMP_SPEED;
        p.onGround = false;
      }
      break;
  }
}

function applyPhysics(state: GameState, dt: number): void {
  const p = state.player;

  p.vy += GRAVITY * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
}

function handleGroundCollision(state: GameState): void {
  const p = state.player;

  if (p.y + p.height > FLOOR_Y) {
    p.y = FLOOR_Y - p.height;
    p.vy = 0;
    p.onGround = true;
  }
}

function handleCoinCollisions(state: GameState): void {
  const p = state.player;
  const pxCenter = p.x + p.width / 2;
  const pyCenter = p.y + p.height / 2;

  for (const coin of state.coins) {
    if (coin.collected) continue;

    const dx = coin.x - pxCenter;
    const dy = coin.y - pyCenter;
    const distSq = dx * dx + dy * dy;
    const r = coin.radius + Math.max(p.width, p.height) * 0.5;

    if (distSq <= r * r) {
      coin.collected = true;
      // later: score, sfx, etc.
    }
  }
}
