// One day's puzzles and the reader's progress, kept in localStorage. Only today's
// is kept: the puzzles are frozen when first built, so the 4 PM edition's new
// headlines don't swap the crossword out from under someone halfway through.
const KEY = 'myDashboard.puzzles.v1';

export function loadDay(day) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && saved.day === day) return saved;
  } catch {
    // unreadable: start the day fresh
  }
  return null;
}

export function saveDay(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage blocked or full: progress lasts for this visit
  }
}
