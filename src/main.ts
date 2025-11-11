// src/main.ts

import { attachInputHandlers } from "./game/input.ts";
import { updateGame } from "./game/logic.ts";
import { render } from "./game/render.ts";
import { createInitialState } from "./game/state.ts";
import "./style.css";

// Create a root container for the game UI
const root = document.createElement("div");
root.id = "game-root";

// Clear any existing HTML and attach our root
document.body.innerHTML = "";
document.body.appendChild(root);

// Optional title / debug text
const title = document.createElement("h1");
title.textContent = "D3 Core Mechanics Prototype";
title.style.margin = "0 0 4px";
title.style.fontSize = "1rem";
root.appendChild(title);

// Optional instructions
const instructions = document.createElement("p");
instructions.textContent =
  "Use ← → to move, ↑ or Space to jump. (You can customize this later!)";
instructions.style.margin = "0 0 8px";
instructions.style.fontSize = "0.85rem";
root.appendChild(instructions);

// Create the canvas where we render the game
const canvas = document.createElement("canvas");
canvas.width = 480;
canvas.height = 320;
root.appendChild(canvas);

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("Could not get 2D canvas context");
}

// ---- GAME STATE ----
let state = createInitialState();

// Hook up keyboard → intent queue
attachInputHandlers(window, (intent) => {
  state.pendingIntents.push(intent);
});

// ---- MAIN GAME LOOP ----
let lastTime = performance.now();

function frame(now: number) {
  const dt = (now - lastTime) / 1000; // seconds
  lastTime = now;

  // Core mechanics step
  state = updateGame(state, dt);

  // Draw current state
  render(ctx, state);

  requestAnimationFrame(frame);
}

// Start the loop
requestAnimationFrame(frame);
