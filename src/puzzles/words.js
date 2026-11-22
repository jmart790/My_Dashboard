// Words for the day's puzzles, pulled from the headlines, each with its headline
// as a fill-in-the-blank clue. A small built-in list tops it up on a slow news day.

const STOP = new Set(`about above after again against also among amid area back been before being
below between both came come could does down during each even ever every first from have here
into just know last like made make many more most much must near next only other over said same
says see should since some still such take than that their them then there these they this
those through today told under until upon very want week were what when where which while
whom with without would year years your news report reports latest update updates video photos
watch live says new top best amid via inc`.split(/\s+/));

const FALLBACK = [
  ['EDITION', 'The Morning ___ hits the stoop at five'],
  ['HEADLINE', 'Big type across the top of page one'],
  ['NEWSPRINT', 'Cheap paper this is printed on'],
  ['COLUMN', 'A writer\'s regular spot, or a vertical run of type'],
  ['DATELINE', 'Where and when a story was filed'],
  ['PRESS', 'Stop the ___!'],
  ['EDITOR', 'Who decides what runs'],
  ['BYLINE', 'Where the writer gets credit'],
  ['SCOOP', 'Story nobody else has'],
  ['ALMANAC', 'Box of sunrises and moon phases'],
  ['WEATHER', 'It\'s on page two'],
  ['FORECAST', 'Tomorrow\'s weather, today'],
  ['CROSSWORD', 'You\'re doing one'],
  ['COMICS', 'The funny pages'],
  ['SPORTS', 'Section with the box scores'],
  ['CAPTION', 'Words under a photo'],
  ['MASTHEAD', 'Nameplate atop the front page'],
  ['ARCHIVE', 'Where back issues go'],
  ['TABLOID', 'Half-size paper, often loud'],
  ['REPORTER', 'One who files the story'],
  ['CIRCULATION', 'How many copies go out'],
  ['DEADLINE', 'When copy is due'],
  ['INK', 'It gets on your fingers'],
  ['PAGE', 'Front ___'],
  ['STORY', 'What a reporter files'],
  ['EXTRA', '___! ___! Read all about it!'],
  ['SECTION', 'Sports, or Arts, or Business'],
  ['LETTERS', 'Readers write to the editor with these'],
  ['OPINION', 'Op-ed page offering'],
  ['MORNING', 'When the first edition lands'],
];

/**
 * @param {Array<{title: string, link?: string}>} articles
 * @returns {Array<{answer: string, clue: string, link?: string, fromNews: boolean}>}
 *   one entry per distinct answer, news words first
 */
export function wordsFromHeadlines(articles = [], { min = 4, max = 11 } = {}) {
  const out = new Map();
  for (const { title = '', link } of articles) {
    const headline = title.replace(/\s+-\s+[^-]+$/, ''); // drop " - Source Name"
    for (const token of headline.split(/\s+/)) {
      // plain words only (a trailing 's or punctuation is fine): skips U.S., co-op, 3M
      const match = token.match(/^["“‘(]?([A-Za-z]+)(?:['’]s)?[,.:;!?"”’)]*$/);
      if (!match) continue;
      const word = match[1];
      const answer = word.toUpperCase();
      if (answer.length < min || answer.length > max || STOP.has(word.toLowerCase()) || out.has(answer)) continue;
      out.set(answer, { answer, clue: headline.replace(new RegExp(`\\b${word}\\b`, 'g'), '___'), link, fromNews: true });
    }
  }
  return [...out.values()];
}

export function fallbackWords() {
  return FALLBACK.map(([answer, clue]) => ({ answer, clue, fromNews: false }));
}
