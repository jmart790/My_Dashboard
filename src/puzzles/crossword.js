// A free-form criss-cross: words hang off each other wherever letters match, the way
// a newspaper's "fill-in" puzzle looks. Greedy placement, best of a few seeded tries.
import { shuffle } from '@/seeded';

const SIZE = 30;

function canPlace(grid, word, row, col, across) {
  const dr = across ? 0 : 1;
  const dc = across ? 1 : 0;
  const endR = row + dr * (word.length - 1);
  const endC = col + dc * (word.length - 1);
  if (row < 0 || col < 0 || endR >= SIZE || endC >= SIZE) return -1;
  const at = (r, c) => (r < 0 || c < 0 || r >= SIZE || c >= SIZE ? null : grid[r][c]);
  if (at(row - dr, col - dc) || at(endR + dr, endC + dc)) return -1; // touching ends
  let crossings = 0;
  for (let i = 0; i < word.length; i += 1) {
    const r = row + dr * i;
    const c = col + dc * i;
    const cell = grid[r][c];
    if (cell) {
      if (cell !== word[i]) return -1;
      crossings += 1;
    } else if (at(r + dc, c + dr) || at(r - dc, c - dr)) {
      return -1; // a new letter may not sit beside another word
    }
  }
  return crossings === word.length ? -1 : crossings;
}

function write(grid, word, row, col, across) {
  for (let i = 0; i < word.length; i += 1) {
    grid[row + (across ? 0 : i)][col + (across ? i : 0)] = word[i];
  }
}

function attempt(entries, random, target) {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  const [first, ...rest] = entries;
  const placed = [{ ...first, row: Math.floor(SIZE / 2), col: Math.floor((SIZE - first.answer.length) / 2), across: true }];
  write(grid, first.answer, placed[0].row, placed[0].col, true);
  for (const entry of rest) {
    if (placed.length >= target) break;
    const options = [];
    for (const p of placed) {
      for (let i = 0; i < p.answer.length; i += 1) {
        for (let j = 0; j < entry.answer.length; j += 1) {
          if (p.answer[i] !== entry.answer[j]) continue;
          const across = !p.across;
          const r = p.across ? p.row - j : p.row + i;
          const c = p.across ? p.col + i : p.col - j;
          const score = canPlace(grid, entry.answer, r, c, across);
          if (score > 0) options.push({ r, c, across, score: score + random() * 0.5 });
        }
      }
    }
    if (!options.length) continue;
    const best = options.sort((a, b) => b.score - a.score)[0];
    write(grid, entry.answer, best.r, best.c, best.across);
    placed.push({ ...entry, row: best.r, col: best.c, across: best.across });
  }
  return placed;
}

/**
 * @param {Array<{answer: string, clue: string}>} entries candidates, best first
 * @param {() => number} random seeded
 * @returns {{ rows: number, cols: number, words: Array<{answer, clue, row, col, across, number}> }}
 */
export function buildCrossword(entries, random, { target = 12, tries = 8 } = {}) {
  const pool = entries.filter((e) => e.answer.length >= 3 && e.answer.length <= 12).slice(0, 40);
  let best = [];
  for (let t = 0; t < tries && pool.length; t += 1) {
    const [head, ...tail] = shuffle(pool, random).sort((a, b) => b.answer.length - a.answer.length);
    const placed = attempt([head, ...shuffle(tail, random)], random, target);
    if (placed.length > best.length) best = placed;
    if (best.length >= target) break;
  }
  if (!best.length) return { rows: 0, cols: 0, words: [] };
  // crop to the words' bounding box
  const minR = Math.min(...best.map((w) => w.row));
  const minC = Math.min(...best.map((w) => w.col));
  const words = best.map((w) => ({ ...w, row: w.row - minR, col: w.col - minC }));
  const rows = Math.max(...words.map((w) => w.row + (w.across ? 1 : w.answer.length)));
  const cols = Math.max(...words.map((w) => w.col + (w.across ? w.answer.length : 1)));
  // number the starts, reading order
  const starts = [...new Set(words.map((w) => `${w.row},${w.col}`))]
    .map((k) => k.split(',').map(Number))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const numbers = new Map(starts.map(([r, c], i) => [`${r},${c}`, i + 1]));
  words.forEach((w) => {
    w.number = numbers.get(`${w.row},${w.col}`);
  });
  words.sort((a, b) => a.number - b.number);
  return { rows, cols, words };
}

/** The solution grid: letters, null for black squares. */
export function solutionGrid({ rows, cols, words }) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  words.forEach((w) => write(grid, w.answer, w.row, w.col, w.across));
  return grid;
}
