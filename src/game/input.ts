// src/game/input.ts
import type { Intent } from "./state.ts";

type IntentCallback = (intent: Intent) => void;

const KEY_TO_INTENT_DOWN: Record<string, Intent> = {
  ArrowLeft: "move-left",
  ArrowRight: "move-right",
  ArrowUp: "jump",
  " ": "jump", // space bar
};

export function attachInputHandlers(
  target: Window,
  enqueueIntent: IntentCallback,
) {
  target.addEventListener("keydown", (ev: KeyboardEvent) => {
    const intent = KEY_TO_INTENT_DOWN[ev.key];
    if (!intent) return;

    ev.preventDefault();
    enqueueIntent(intent);
  });
}
