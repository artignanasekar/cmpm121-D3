// src/luck.ts

// Simple deterministic pseudo-random function: same seed -> same value in [0,1)
export function luck(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Mix row/col into a single numeric seed.
export function cellSeed(row: number, col: number): number {
  // XOR of two large-ish primes times row/col
  return (row * 73856093) ^ (col * 19349663);
}
