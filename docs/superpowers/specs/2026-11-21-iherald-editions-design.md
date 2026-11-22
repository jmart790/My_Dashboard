# iHerald: editions, features and puzzles

Approved 2026-11-21. Goal: make the iHerald feel like a real daily paper, not a feed.
Built in this order, Events last (waiting on API keys).

## 1. Look and feel
- **Ink fade** between routes: the old page fades and blurs out (~220ms), then the new
  one fades in from a slight blur (~320ms). `prefers-reduced-motion`: instant.
  (A 3D page curl and halftone photos were built first and dropped at review.)
- **Paper arrives**: on the first visit to each new edition, a rolled paper drops in and
  unfolds (~1.5s). Tap or any key skips. Reduced motion skips. Last-seen edition kept in
  localStorage.
- **Paper ages**: a warm tint over the texture deepens from 5 AM toward night, by local
  hour in the location's timezone, refreshed every 10 minutes.

## 2. Editions
- Morning Edition from 5 AM, Evening Edition from 4 PM, location time. Before 5 AM it is
  still the previous day's Evening Edition.
- News is cached per edition in localStorage, so the paper doesn't change mid-edition and
  GNews stays inside 100 calls/day.
- Masthead shows the edition ("Evening Edition · 4 PM").
- **EXTRA**: while open, every 30 minutes check NWS alerts and the local news. An NWS
  *Warning* or a new local headline with breaking language (breaking, evacuat, shooting,
  closed, manhunt, wildfire, explosion, lockdown, earthquake) not in the edition shows a red
  EXTRA banner under the masthead, linking to the story or warning. Dismissed items stay
  dismissed.

## 3. Front Page lower band
Three columns below the briefs:
- **The Almanac**: sunrise, sunset, daylight, moon phase (computed, with drawing), air
  quality (Open-Meteo air-quality API), UV, elevation. No keys.
- **Around Town**: three Wikipedia landmarks (geosearch + extracts + thumbnails), rotating
  daily from the 20 nearest.
- **100 Years Ago Today**: a Library of Congress front page from the user's state for this
  date a century ago; else any US paper that date. Shown as a clipping, links to loc.gov.
  Query: `loc.gov/collections/chronicling-america/?dates=YYYY-MM-DD&dl=page&fa=number_page:0000000001[|location_state:x]&fo=json`.

## 4. Puzzles page (new section)
Seeded by the date, progress saved in localStorage per day.
- **Headline crossword**: free-form criss-cross from words in today's headlines; clue is
  the headline with the word blanked.
- **Word jumble**: four scrambled words from today's stories; circled letters spell a
  bonus word.
- **Sudoku**: daily grid, easy or hard, unique solution.
- **Headline quiz**: five blanked headlines with four choices, links to the articles.
Puzzles that need news fall back to a built-in word list when news is unavailable.

## 5. Events page (last)
Ticketmaster + SeatGeek within 25 miles, merged on title+date+venue, chips (Music,
Sports, Arts & Theater, Comedy, Family), days Tonight / Tomorrow / This Weekend / Next
Week, expand in place. Keys `VITE_TICKETMASTER_KEY`, `VITE_SEATGEEK_CLIENT_ID`; setup note
when missing. 1h cache. Proxy Ticketmaster through the dev server if it lacks CORS.
Arts brief gains "Tonight's top event".

## Later additions
- Front Page weather box lists the full week (Today + 6 days, with rain chance).
- Weather page Conditions Now card shows the town's Wikipedia lead photo under a paper
  wash, credited to Wikimedia Commons; maps, seals and flags are skipped.

## Nav
Front Page, Weather, News, Dining, Events, Media, Puzzles.

## Tests
Unit tests for the edition clock, EXTRA rule, moon phase, every puzzle generator, and
event merging.
