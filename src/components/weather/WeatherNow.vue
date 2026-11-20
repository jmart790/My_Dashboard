<script>
import { formatMixins } from '@/mixins/formatMixins';
import { weatherMixins } from '@/mixins/weatherMixins';

export default {
  name: 'WeatherNow',
  mixins: [formatMixins, weatherMixins],
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
  <div class="weather-now card">
    <h3 class="kicker weather-now__time">
      Conditions Now · {{ time }}
    </h3>
    <div class="weather-now__icon-summary">
      <inline-svg
        class="weather-now__icon ink-keyline"
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
      <h1 class="current-weather-data__temp">
        {{ Math.round(currentWeather.temperature) }}°
      </h1>
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
  min-width: 320px;
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