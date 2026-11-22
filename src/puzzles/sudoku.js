// Daily sudoku: fill a grid by seeded backtracking, then take out clues one at a time,
// putting each back if the puzzle would stop having exactly one solution.
import { shuffle } from '@/seeded';

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function fits(grid, i, n) {
  const r = Math.floor(i / 9);
  const c = i % 9;
  const br = r - (r % 3);
  const bc = c - (c % 3);
  for (let k = 0; k < 9; k += 1) {
    if (grid[r * 9 + k] === n || grid[k * 9 + c] === n) return false;
    if (grid[(br + Math.floor(k / 3)) * 9 + bc + (k % 3)] === n) return false;
  }
  return true;
}

function fill(grid, random) {
  const i = grid.indexOf(0);
  if (i < 0) return true;
  for (const n of shuffle(DIGITS, random)) {
    if (fits(grid, i, n)) {
      grid[i] = n;
      if (fill(grid, random)) return true;
    }
  }
  grid[i] = 0;
  return false;
}

/** Number of solutions, stopping at `limit`. */
export function countSolutions(grid, limit = 2) {
  const i = grid.indexOf(0);
  if (i < 0) return 1;
  let count = 0;
  for (const n of DIGITS) {
    if (fits(grid, i, n)) {
      grid[i] = n;
      count += countSolutions(grid, limit - count);
      grid[i] = 0;
      if (count >= limit) break;
    }
  }
  return count;
}

const GIVENS = { easy: 38, hard: 27 };

/**
 * @param {'easy'|'hard'} level
 * @returns {{ puzzle: number[], solution: number[] }} 81 cells each, 0 = blank
 */
export function buildSudoku(random, level = 'easy') {
  const solution = Array(81).fill(0);
  fill(solution, random);
  const puzzle = [...solution];
  let givens = 81;
  for (const i of shuffle([...Array(81).keys()], random)) {
    if (givens <= GIVENS[level]) break;
    const keep = puzzle[i];
    puzzle[i] = 0;
    if (countSolutions([...puzzle]) !== 1) puzzle[i] = keep;
    else givens -= 1;
  }
  return { puzzle, solution };
}
