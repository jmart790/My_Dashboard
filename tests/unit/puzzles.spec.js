import { describe, it, expect } from 'vitest';
import { rng } from '@/seeded';
import { wordsFromHeadlines, fallbackWords } from '@/puzzles/words';
import { buildCrossword, solutionGrid } from '@/puzzles/crossword';
import { buildJumble } from '@/puzzles/jumble';
import { buildSudoku, countSolutions } from '@/puzzles/sudoku';
import { buildQuiz } from '@/puzzles/quiz';
import { buildDailyPuzzles } from '@/puzzles';

const ARTICLES = [
  { title: "Trail Blazers rally past Lakers in overtime thriller - The Oregonian", link: 'a' },
  { title: 'Portland approves budget for Willamette riverfront parks', link: 'b' },
  { title: "Winter storm brings snow to Mount Hood's ski resorts", link: 'c' },
  { title: 'U.S. inflation cools as holiday shopping begins', link: 'd' },
  { title: 'Oregon Zoo welcomes baby otter named Pebble', link: 'e' },
  { title: 'Ducks clinch conference title with late touchdown', link: 'f' },
];

describe('wordsFromHeadlines', () => {
  it('turns headline words into blanked clues and skips filler', () => {
    const words = wordsFromHeadlines(ARTICLES);
    const rally = words.find((w) => w.answer === 'RALLY');
    expect(rally.clue).toBe('Trail Blazers ___ past Lakers in overtime thriller');
    expect(words.find((w) => w.answer === 'HOOD').clue).toBe("Winter storm brings snow to Mount ___'s ski resorts");
    expect(words.some((w) => w.answer === 'WITH' || w.answer === 'OREGONIAN' || w.answer === 'U')).toBe(false);
  });
});

describe('crossword', () => {
  const entries = [...wordsFromHeadlines(ARTICLES), ...fallbackWords()];
  const puzzle = buildCrossword(entries, rng('cw'));

  it('places a good number of interlocking words', () => {
    expect(puzzle.words.length).toBeGreaterThanOrEqual(8);
  });

  it('never lets two words disagree on a square or run into each other', () => {
    const grid = Array.from({ length: puzzle.rows }, () => Array(puzzle.cols).fill(null));
    for (const w of puzzle.words) {
      for (let i = 0; i < w.answer.length; i += 1) {
        const r = w.row + (w.across ? 0 : i);
        const c = w.col + (w.across ? i : 0);
        expect([null, w.answer[i]]).toContain(grid[r][c]);
        grid[r][c] = w.answer[i];
      }
    }
    expect(solutionGrid(puzzle)).toEqual(grid);
    // every maximal run of 2+ letters is a placed word
    const answers = new Set(puzzle.words.map((w) => w.answer));
    const runs = (lines) => lines.flatMap((line) => line.map((x) => x || ' ').join('').split(' ').filter((s) => s.length > 1));
    const cols = grid[0].map((_, c) => grid.map((row) => row[c]));
    [...runs(grid), ...runs(cols)].forEach((run) => expect(answers).toContain(run));
  });

  it('numbers starts in reading order', () => {
    const numbers = puzzle.words.map((w) => w.number);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    expect(numbers[0]).toBe(1);
  });
});

describe('jumble', () => {
  it('circled letters can spell the bonus word', () => {
    const jumble = buildJumble([...wordsFromHeadlines(ARTICLES), ...fallbackWords()], rng('j'));
    expect(jumble.words).toHaveLength(4);
    const circled = jumble.words.flatMap((w) => w.circles.map((i) => w.answer[i]));
    expect(circled.sort().join('')).toBe([...jumble.bonus.answer].sort().join(''));
    jumble.words.forEach((w) => {
      expect([...w.scrambled].sort().join('')).toBe([...w.answer].sort().join(''));
      expect(w.scrambled).not.toBe(w.answer);
    });
  });
});

describe('sudoku', () => {
  it.each(['easy', 'hard'])('%s has one solution that matches', (level) => {
    const { puzzle, solution } = buildSudoku(rng(`s-${level}`), level);
    expect(countSolutions([...puzzle])).toBe(1);
    puzzle.forEach((n, i) => n && expect(n).toBe(solution[i]));
    for (let r = 0; r < 9; r += 1) expect(new Set(solution.slice(r * 9, r * 9 + 9)).size).toBe(9);
  });
});

describe('quiz', () => {
  it('asks five questions with four choices, one per headline', () => {
    const quiz = buildQuiz([...wordsFromHeadlines(ARTICLES), ...fallbackWords()], rng('q'));
    expect(quiz).toHaveLength(5);
    quiz.forEach((q) => {
      expect(q.choices).toHaveLength(4);
      expect(q.choices).toContain(q.answer);
      expect(new Set(q.choices).size).toBe(4);
    });
    expect(new Set(quiz.map((q) => q.link)).size).toBe(5);
  });
});

describe('buildDailyPuzzles', () => {
  it('is the same for the same day and works with no news', () => {
    expect(buildDailyPuzzles(ARTICLES, '2026-11-21').crossword).toEqual(buildDailyPuzzles(ARTICLES, '2026-11-21').crossword);
    const quiet = buildDailyPuzzles([], '2026-11-21');
    expect(quiet.crossword.words.length).toBeGreaterThan(5);
    expect(quiet.jumble).not.toBeNull();
    expect(quiet.quiz).toHaveLength(5);
  });
});
