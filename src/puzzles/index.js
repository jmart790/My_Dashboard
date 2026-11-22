import { rng } from '@/seeded';
import { wordsFromHeadlines, fallbackWords } from './words';
import { buildCrossword } from './crossword';
import { buildJumble } from './jumble';
import { buildSudoku } from './sudoku';
import { buildQuiz } from './quiz';

/**
 * Every puzzle for one day, seeded by the date so a rebuild gives the same set.
 * News words go first; the built-in list fills gaps on a slow news day.
 */
export function buildDailyPuzzles(articles, day) {
  const news = wordsFromHeadlines(articles);
  const entries = [...news, ...fallbackWords().filter((f) => !news.some((n) => n.answer === f.answer))];
  return {
    day,
    crossword: buildCrossword(entries, rng(`crossword|${day}`)),
    jumble: buildJumble(entries, rng(`jumble|${day}`)),
    sudoku: {
      easy: buildSudoku(rng(`sudoku|${day}|easy`), 'easy'),
      hard: buildSudoku(rng(`sudoku|${day}|hard`), 'hard'),
    },
    quiz: buildQuiz(entries, rng(`quiz|${day}`)),
  };
}
