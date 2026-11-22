<script>
import { mapGetters } from "vuex";
import { formatMixins } from "@/mixins/formatMixins";
import { moonPhase, litPath } from "@/features/moon";
import { fetchAirQuality, aqiLabel } from "@/features/sources";

// The old almanac box: sun, moon and sky, from the forecast the page already has,
// plus Open-Meteo's air quality. The moon is worked out locally.
export default {
  name: "AlmanacBox",
  mixins: [formatMixins],
  data() {
    return { air: null };
  },
  computed: {
    ...mapGetters("weather", ["weather", "hasWeatherData"]),
    ...mapGetters("location", ["location"]),
    ...mapGetters("edition", ["edition"]),
    today: ({ weather, hasWeatherData }) => (hasWeatherData ? weather.daily.data[0] : null),
    daylight({ today }) {
      if (!today) return "";
      const minutes = Math.round((today.sunsetTime - today.sunriseTime) / 60);
      return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    },
    // tied to the edition clock, so it refreshes with the paper
    moon: ({ edition }) => edition && moonPhase(new Date()),
    moonPath: ({ moon }) => litPath(moon.phase, 20),
    elevation: ({ weather }) => (weather.elevation == null ? null : Math.round(weather.elevation * 3.28084)),
    aqiText: ({ air }) => (air ? `${air.aqi} · ${aqiLabel(air.aqi)}` : ""),
    placeKey: ({ location }) => `${location.lat},${location.lon}`
  },
  watch: {
    placeKey: {
      immediate: true,
      async handler() {
        const { lat, lon } = this.location;
        this.air = null;
        if (lat === "" || lat == null) return;
        try {
          this.air = await fetchAirQuality({ lat, lon });
        } catch {
          // the rest of the almanac still prints
        }
      }
    }
  }
};
</script>

<template>
  <section class="almanac">
    <h2 class="kicker">
      The Almanac
    </h2>
    <div class="almanac__moon">
      <svg
        viewBox="0 0 40 40"
        width="56"
        height="56"
        role="img"
        :aria-label="moon.name"
      >
        <circle
          cx="20"
          cy="20"
          r="19.5"
          class="almanac__moon-dark"
        />
        <path :d="moonPath" class="almanac__moon-lit" />
      </svg>
      <div>
        <p class="almanac__moon-name">
          {{ moon.name }}
        </p>
        <p class="almanac__fine">
          {{ Math.round(moon.illumination * 100) }}% lit &middot; day {{ Math.round(moon.age) }} of 29
        </p>
      </div>
    </div>
    <dl class="almanac__table">
      <template v-if="today">
        <div><dt>Sunrise</dt><dd>{{ toLocalTime(today.sunriseTime, weather.timezone) }}</dd></div>
        <div><dt>Sunset</dt><dd>{{ toLocalTime(today.sunsetTime, weather.timezone) }}</dd></div>
        <div><dt>Daylight</dt><dd>{{ daylight }}</dd></div>
      </template>
      <div v-if="air">
        <dt>Air Quality</dt><dd>{{ aqiText }}</dd>
      </div>
      <div v-if="air">
        <dt>UV Index</dt><dd>{{ Math.round(air.uv) }}</dd>
      </div>
      <div v-if="elevation != null">
        <dt>Elevation</dt><dd>{{ elevation.toLocaleString() }} ft</dd>
      </div>
    </dl>
  </section>
</template>

<style lang="scss">
.almanac {
  &__moon {
    display: flex;
    align-items: center;
    gap: $gap-3;
    padding-bottom: $gap-3;
    border-bottom: 1px solid $rule-soft;
  }
  &__moon-dark {
    fill: $ink;
  }
  &__moon-lit {
    fill: #fbf8f0;
  }
  &__moon-name {
    font-family: $heading-font;
    font-size: 19px;
    font-weight: 700;
  }
  &__fine {
    font-size: 13px;
    font-style: italic;
    color: $ink-muted;
  }
  &__table {
    margin: 0;
    > div {
      display: flex;
      justify-content: space-between;
      gap: $gap-3;
      padding: $gap-1 0;
      border-bottom: 1px dotted $rule-soft;
      &:last-child {
        border-bottom: 0;
      }
    }
    dt {
      font-family: $heading-font;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: $ink-muted;
    }
    dd {
      margin: 0;
      font-size: 15px;
      text-align: right;
    }
  }
}
</style>
