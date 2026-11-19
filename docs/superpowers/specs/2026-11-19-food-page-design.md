# Food Page Build-Out: Design

Date: 2026-11-19
Status: Approved in chat, pending spec review

## Goal

Finish the Food page. Today it shows a working restaurant list (OpenStreetMap via Nominatim) next to three unfinished placeholders: "Featured", "map", and "sort btns go here". This spec replaces all three.

## Data available

Each restaurant from `apiClient.getRestaurants` has: `id`, `name`, `cuisine`, `address`, `hours` (raw OSM `opening_hours` string, may be empty), `distance` (miles), `url`. There are no photos, ratings, or prices. Nominatim returns at most 40 results.

## Changes

### 1. Data layer

- `apiClient.getRestaurants` adds `lat` and `lon` (numbers) to each restaurant. The map pins and directions links need them.
- `apiClient.getLocation` also returns `timezone` (IANA name, for example `America/Denver`). It comes from Open-Meteo (`/v1/forecast?latitude&longitude&timezone=auto`, reading only the `timezone` field), requested right after Zippopotam returns coordinates. If that call fails, `timezone` is `null` and "open now" uses the browser's timezone.
- The location store keeps `timezone` on `location`.

### 2. Opening hours

- Add the `opening_hours` npm package. It is the reference parser for OSM's hours syntax.
- New module `src/openingHours.js` exports one function: `isOpenNow(hours, { timezone, lat, lon }, now = new Date())`. It returns `true`, `false`, or `null`. `null` means unknown: the string is empty or fails to parse. The coordinates let the library resolve `sunrise`/`sunset` and US public holidays (`PH`).
- The library reads the Date's local fields, so the function builds a Date whose local wall-clock fields equal the current time in `timezone` (via `Intl.DateTimeFormat(...).formatToParts`). It passes that Date to the library.
- Parsed `opening_hours` objects are cached by string so the 40-item list doesn't re-parse on every render.
- Only the Food page imports this module, so the library stays out of the main bundle.

### 3. Restaurants store

New state in `store/modules/restaurants.js`:

| State | Type | Default |
|-------|------|---------|
| `sort` | `'distance' \| 'name'` | `'distance'` |
| `openNow` | boolean | `false` |
| `cuisine` | string or `null` | `null` (all) |
| `featuredId` | string or `null` | `null` |

The store needs the location's timezone and coordinates for open-now checks. It reads them through `rootGetters['location/location']`.

Getters:

- `filteredRestaurants`: applies the cuisine filter, then the open-now filter, then the sort. With `openNow` on, a place counts only if `openStatus[id]` is `'open'`, so places with unknown hours are hidden.
- `cuisines`: the cuisines present in the full list with counts, most common first, capped at 8.
- `featured`: the restaurant with `featuredId` (looked up in the full list, so a filter change never leaves a dangling id), or `null`.
- `openStatus`: an object mapping each restaurant id to `'open'`, `'closed'`, or `'unknown'` (from `isOpenNow`'s `true`/`false`/`null`). The badge, the list dots, and the filter all read it. Vuex caches getters, so open/closed is computed when the list or location changes, not every minute. A page left open for hours can show stale status until the next search.

Mutations and actions:

- `setSort`, `setOpenNow`, `setCuisine`, `clearFilters`.
- `selectRestaurant(id)` sets `featuredId`.
- `shuffleFeatured`: picks a random restaurant from `filteredRestaurants`, excluding the current one when more than one is available. If the filtered list is empty, it sets `featuredId` to `null`.
- After `getRestaurants` succeeds, it runs an initial pick. That pick is random among places open now; if none are open, it is random among the whole list.
- When `getRestaurants` loads a new location, the filters reset.

### 4. Featured card (`components/food/FeaturedRestaurant.vue`)

- One of the three unDraw food illustrations, chosen by the restaurant's position in the list, as on the list cards.
- Name, a cuisine chip, and an open/closed/unknown badge.
- The raw hours string, or "Hours not listed".
- Address and distance.
- Buttons and links:
  - Shuffle button, which runs `shuffleFeatured`.
  - "Website": the restaurant's `url`. For places without a website this is the OSM page, labelled "OpenStreetMap".
  - "Directions": `https://www.google.com/maps/dir/?api=1&destination={lat},{lon}`.
  - Both links open in a new tab.
- Empty state, shown when filters leave nothing: a message and a "Clear filters" button.

### 5. Map (`components/food/RestaurantMap.vue`)

- Add `leaflet` (1.9.x). Use OSM tiles from `https://tile.openstreetmap.org/{z}/{x}/{y}.png` with the required "© OpenStreetMap contributors" attribution.
- The map is created in `onMounted` and destroyed in `onBeforeUnmount`.
- Pins show `filteredRestaurants` as `circleMarker`s styled with the theme colors. Using `circleMarker` means no marker image assets need bundling. The featured pin uses the theme salmon color with a larger radius.
- Clicking a pin runs `selectRestaurant`. Each pin has a tooltip with the restaurant name.
- When the featured place changes, the map pans to it. When the list changes, the map fits its bounds to all pins, with the searched location as a fallback center.
- The map has a fixed minimum height so it is visible on mobile.

### 6. List and controls

- `RestaurantList.vue` replaces the placeholder with a controls row:
  - A sort toggle: "Nearest" or "A–Z".
  - An "Open now" toggle.
  - Cuisine chips: "All" plus up to 8 cuisines.
- Controls are `<button>`s with `aria-pressed`.
- The list renders `filteredRestaurants`.
- `Restaurant.vue` becomes a `<button>` that runs `selectRestaurant`, replacing the external link. The website link moves to the Featured card.
  - The featured item is highlighted and gets `aria-current="true"`.
  - The cuisine chip row gains a small open/closed dot.

### 7. Page states (`views/FoodPage.vue`)

- Loading: skeletons for the Featured card and the list, reusing `base/Skeleton` and `SkeletonItem`.
- Error: `ErrorCard` with `category="FOOD"` and a retry button that runs `getRestaurants` again.
- Empty (no restaurants near the zip): a short message in the list area. Featured and the map are hidden.
- Layout fix: the existing grid defines a `map` area, but the map element is never assigned to it. The fix adds the missing `&__map { grid-area: map; }`.

## Testing

- `tests/unit/openingHours.spec.js`: open, closed, and unknown cases for `Mo-Fr 09:00-17:00` at fixed instants in `America/Denver` and `America/New_York`. One case shows the same instant is open in one zone and closed in the other. Empty and garbage strings return `null`.
- `tests/unit/restaurantsStore.spec.js`: sort by name, cuisine filter, the open-now filter hiding unknown hours, `cuisines` counts and order, `shuffleFeatured` respecting filters and avoiding a repeat, and the initial pick preferring open places.
- Browser check: Miami and Denver zips; pins render; clicking a pin and a list item updates Featured; shuffle; each filter; mobile width.

## Out of scope

Favorites, a search box, paging past 40 results, and ratings, photos, or prices (OSM has none).
