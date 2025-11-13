import type { GameState, Token } from "./state.ts";

export function tryCraft(state: GameState): string {
  // crafting rule: combine two equal tokens -> one token of value+1
  // sources: state.held and state.bag[]
  const pool: Token[] = [];
  if (state.held) pool.push(state.held);
  for (const t of state.bag) pool.push(t);

  // count by value
  const counts = new Map<number, number>();
  for (const t of pool) counts.set(t.value, (counts.get(t.value) ?? 0) + 1);

  // find highest value that has at least 2
  let target: number | null = null;
  for (const v of [...counts.keys()].sort((a, b) => b - a)) {
    if ((counts.get(v) ?? 0) >= 2) {
      target = v;
      break;
    }
  }
  if (target === null) return "no matching pair to craft";

  // consume two tokens of 'target'
  let need = 2;
  const newBag: Token[] = [];
  const consume = (
    t: Token,
  ): boolean => (t.value === target && need > 0 ? (need--, true) : false);

  // prefer consuming from bag first, keep held if possible
  for (const t of state.bag) {
    if (!consume(t)) newBag.push(t);
  }
  if (state.held && need > 0) {
    if (!consume(state.held)) newBag.unshift(state.held);
    state.held = null;
  }

  // add crafted result to held if empty, else to bag
  const crafted: Token = { value: target + 1 };
  if (!state.held) state.held = crafted;
  else newBag.push(crafted);
  state.bag = newBag;

  // victory check
  if (crafted.value >= state.targetValue) state.hasWon = true;

  return `crafted ${target}+${target} → ${crafted.value}`;
}
