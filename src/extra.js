// EXTRA! What's big enough to stop the presses between editions: an NWS Warning
// (not a watch or advisory), or a local headline with breaking language that wasn't
// in the edition the reader already has.

const BREAKING = /\b(breaking|evacuat\w*|shooting|manhunt|wildfire|explosion|lockdown|earthquake|tsunami|closed|shelter in place)\b/i;

export const isWarning = (alert) => /\bwarning\b/i.test(alert.title || '');
export const isBreaking = (title = '') => BREAKING.test(title);

/**
 * @param {{ alerts: Array<{id?: string, title: string, headline?: string}>,
 *   articles: Array<{_id: string, title: string, link: string}>,
 *   editionTitles: string[], dismissed: string[] }} input
 * @returns {Array<{ id: string, kind: 'weather'|'news', title: string, link?: string }>}
 */
export function extrasFrom({ alerts = [], articles = [], editionTitles = [], dismissed = [] }) {
  const seen = new Set(editionTitles);
  const skip = new Set(dismissed);
  const weather = alerts.filter(isWarning).map((a) => ({
    id: `nws:${a.id || a.title}`,
    kind: 'weather',
    title: a.headline || a.title,
  }));
  const news = articles
    .filter((a) => !seen.has(a.title) && isBreaking(a.title))
    .map((a) => ({ id: `news:${a.link || a._id}`, kind: 'news', title: a.title, link: a.link }));
  return [...weather, ...news].filter((x) => !skip.has(x.id));
}
