# My Dashboard

Vue 3 + Vite + Vuex 4 + Vue Router.

```
npm install
npm run dev        # dev server
npm run build      # production build
npm run test:unit  # vitest
npm run lint       # eslint
```

All data sources are free. Only news needs a key: sign up at [gnews.io](https://gnews.io), then put it in `.env.local`:

```
VITE_GNEWS_API_KEY=your-key
```

Sources:

| Data | Source |
|------|--------|
| Zip code lookup | [Zippopotam.us](https://zippopotam.us) |
| Weather | [Open-Meteo](https://open-meteo.com) |
| Weather alerts (US) | [National Weather Service](https://www.weather.gov/documentation/services-web-api) |
| News | [GNews](https://gnews.io) (free key, 100 requests/day) |
| Restaurants | [OpenStreetMap Nominatim](https://nominatim.org) |

`src/apiClient.js` reshapes each response into the shape the stores expect.
