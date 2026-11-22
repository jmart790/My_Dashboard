// The headline quiz: a headline with one word blanked, four choices. Wrong answers
// are other words from today's news of a similar length, so they look plausible.
import { shuffle } from '@/seeded';

/**
 * @param {Array<{answer, clue, link, fromNews}>} entries
 * @returns {Array<{ clue: string, answer: string, choices: string[], link?: string }>}
 */
export function buildQuiz(entries, random, count = 5) {
  const news = entries.filter((e) => e.fromNews);
  const pool = news.length >= 8 ? news : entries;
  const used = new Set();
  const questions = [];
  for (const entry of shuffle(pool, random)) {
    if (questions.length >= count) break;
    const source = entry.link || entry.clue;
    if (used.has(source)) continue; // one question per headline
    const decoys = shuffle(
      pool.filter((e) => e.answer !== entry.answer && !entry.clue.toUpperCase().includes(e.answer)),
      random
    )
      .sort((a, b) => Math.abs(a.answer.length - entry.answer.length) - Math.abs(b.answer.length - entry.answer.length))
      .slice(0, 3)
      .map((e) => e.answer);
    if (decoys.length < 3) continue;
    used.add(source);
    questions.push({
      clue: entry.clue,
      answer: entry.answer,
      choices: shuffle([entry.answer, ...decoys], random),
      link: entry.link,
    });
  }
  return questions;
}
