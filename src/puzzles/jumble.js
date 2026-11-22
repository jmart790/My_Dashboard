// The word jumble: four scrambled words, some letters circled. The circled letters,
// unscrambled, spell the bonus word.
import { shuffle } from '@/seeded';

const SPLITS = { 4: [1, 1, 1, 1], 5: [2, 1, 1, 1], 6: [2, 1, 2, 1], 7: [2, 2, 2, 1] };

function scramble(word, random) {
  if (new Set(word).size < 2) return word;
  for (let i = 0; i < 20; i += 1) {
    const out = shuffle([...word], random).join('');
    if (out !== word) return out;
  }
  return [...word].reverse().join('');
}

/** Positions in `word` holding `letters` (each used once), or null. */
function circlePositions(word, letters) {
  const taken = new Set();
  for (const letter of letters) {
    let found = -1;
    for (let i = 0; i < word.length; i += 1) {
      if (word[i] === letter && !taken.has(i)) {
        found = i;
        break;
      }
    }
    if (found < 0) return null;
    taken.add(found);
  }
  return [...taken].sort((a, b) => a - b);
}

/**
 * @param {Array<{answer: string, clue: string, link?: string}>} entries
 * @returns {{ words: Array<{answer, scrambled, circles: number[], clue, link}>, bonus: {answer, scrambled} } | null}
 */
export function buildJumble(entries, random) {
  const words = entries.filter((e) => e.answer.length >= 5 && e.answer.length <= 7);
  const bonuses = shuffle(entries.filter((e) => SPLITS[e.answer.length]), random);
  for (const bonus of bonuses) {
    const letters = shuffle([...bonus.answer], random);
    const sizes = SPLITS[bonus.answer.length];
    const picked = [];
    let at = 0;
    for (const size of sizes) {
      const want = letters.slice(at, at + size);
      at += size;
      const used = new Set([bonus.answer, ...picked.map((p) => p.answer)]);
      const hit = shuffle(words, random).find((w) => !used.has(w.answer) && circlePositions(w.answer, want));
      if (!hit) break;
      picked.push({ ...hit, circles: circlePositions(hit.answer, want) });
    }
    if (picked.length === 4) {
      return {
        words: picked.map((w) => ({ answer: w.answer, scrambled: scramble(w.answer, random), circles: w.circles, clue: w.clue, link: w.link })),
        bonus: { answer: bonus.answer, scrambled: scramble(bonus.answer, random), clue: bonus.clue },
      };
    }
  }
  return null;
}
