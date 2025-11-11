// src/game/render.ts
import type { GameState } from "./state.ts";

export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { canvas } = ctx;
  const { player, coins } = state;

  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ground
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 260);
  ctx.lineTo(canvas.width, 260);
  ctx.stroke();

  // coins
  for (const coin of coins) {
    if (coin.collected) continue;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd700";
    ctx.fill();
  }

  // player
  ctx.fillStyle = "#4fc3f7";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}
