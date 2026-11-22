<script>
import { formatMixins } from '@/mixins/formatMixins';
import { weatherMixins } from '@/mixins/weatherMixins';
import { mapGetters } from 'vuex';
import { fetchCityPhoto } from '@/features/sources';

export default {
  name: 'WeatherNow',
  mixins: [formatMixins, weatherMixins],
  data() {
    return { photo: null, plainPhoto: false }; // plainPhoto: retry without CORS
  },
  computed: {
    ...mapGetters('location', ['location']),
    place: ({ location }) => `${location.name}|${location.region}`,
  },
  watch: {
    // a picture of the town behind the conditions, from its Wikipedia article
    place: {
      immediate: true,
      async handler() {
        const { name, region } = this.location;
        this.photo = null;
        this.plainPhoto = false;
        if (!name) return;
        try {
          this.photo = await fetchCityPhoto({ name, region });
        } catch {
          // no picture: the plain paper card
        }
      },
    },
  },
  props: {
    time: {
      type: String,
      required: true
    },
    currentWeather: {
      type: Object,
      required: true,
    },
    weatherAlerts: {
      type: Array,
      required: true,
    },
    highAndLows: {
      type: String,
      required: true,
    },
  },
};
</script>

<template>
  <div class="weather-now card" :class="{ 'weather-now--photo': photo }">
    <template v-if="photo">
      <img
        class="weather-now__photo"
        :src="photo.src"
        alt=""
        :crossorigin="plainPhoto ? null : 'anonymous'"
        @error="plainPhoto ? (photo = null) : (plainPhoto = true)"
      />
      <a
        class="weather-now__credit"
        :href="photo.file"
        target="_blank"
        rel="noopener noreferrer"
      >Photo: {{ photo.page }}, Wikimedia Commons</a>
    </template>
    <h2 class="kicker weather-now__time">
      Conditions Now · {{ time }}
    </h2>
    <div class="weather-now__icon-summary">
      <inline-svg
        class="weather-now__icon"
        :src="iconUrl(currentWeather.icon)"
        title="My Image"
        height="130"
      />
      <p class="weather-now__summary">
        {{ currentWeather.summary }}
      </p>
    </div>
    <div class="current-weather-data">
      <div class="current-weather-data__meta">
        <span class="icon-thermometer" />{{ highAndLows }}
        <span class="icon-windy-day" />{{ currentWeather.windSpeed }}
        <span class="icon-droplet" />
        {{ formatPercent(currentWeather.precipProbability) }}
      </div>
      <p class="current-weather-data__temp">
        {{ Math.round(currentWeather.temperature) }}°
      </p>
    </div>
    <div class="weather-now__alerts-wrapper">
      <ul class="weather-now__alerts">
        <li
          class="weather-now__alert"
          v-for="(alert, id) in weatherAlerts"
          :key="`WEATHERALERT${id}`"
        >
          <span class="icon-warning weather-now__alert__icon" />
          <span class="weather-now__alert__title">{{ alert.title }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>


<style lang="scss">
.weather-now {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-width: 320px;
  // the town's photo sits under a paper wash, light at the top so the place shows,
  // heavier toward the bottom where the big temperature prints
  &__photo {
    position: absolute;
    inset: 0;
    z-index: -2; // under the wash
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: sepia(0.25) saturate(0.85);
  }
  &--photo::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(180deg, rgba($paper, 0.5) 0%, rgba($paper, 0.62) 45%, rgba($paper, 0.9) 100%);
  }
  &__credit {
    position: absolute;
    right: $gap-2;
    bottom: $gap-1;
    font-size: 10px;
    font-style: italic;
    color: $ink-muted;
    &:hover {
      color: $spot;
      text-decoration: underline;
    }
  }
  display: grid;
  grid-row-gap: $gap-6;
  grid-template-rows: auto 200px auto auto;

  .flip-icon {
    color: $ink;
    transition: color 0.3s ease;
  }
  &__time {
    margin-bottom: $gap-4;
  }
  &__icon-summary {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  &__summary {
    margin-top: $gap-4;
  }
  .current-weather-data {
    display: flex;
    justify-content: space-between;
    &__temp {
      font-family: $heading-font; // was an h1; keeps the headline face as a <p>
      display: flex;
      align-self: flex-end;
      font-size: 80px;
      font-weight: 300;
      line-height: 0.75;
      color: $ink;
    }
    &__meta {
      display: grid;
      grid-template-columns: 2rem 1fr;
      grid-row-gap: 0.5rem;
      span {
        color: $ink;
      }
    }
  }
  &__alerts-wrapper {
    overflow: hidden;
    min-height: 20px;
  }
  &__alerts {
    height: 25px;
    display: flex;
    padding-left: 350px;
    padding-right: 350px;
    animation: autoScrollLeft 20s linear infinite;
  }
  &__alert {
    margin-right: 2rem;
    white-space: nowrap;
    &__icon {
      margin-right: 0.5rem;
      color: $spot !important;
    }
  }
}

@keyframes autoScrollLeft {
  100% {
    transform: translateX(-66.6666%);
  }
}
</style>