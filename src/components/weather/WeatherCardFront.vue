<template>
  <div class="weather-front">
    <!-- <h1>front</h1> -->
    <div class="flex-between mb-5 row">
      <p>{{ city }}</p>
      <p class="weather-front__time">
        {{ time[0] }} <span>{{ time[1] }}</span>
      </p>
    </div>
    <inline-svg
      class="weather-front__icon row"
      :src="require(`@/assets/icons/weather/${currentWeather.icon}.svg`)"
      title="My Image"
      height="130"
    />
    <p class="weather-front__summary row">{{ currentWeather.summary }}</p>
    <div class="current-weather-data row">
      <div class="current-weather-data__meta">
        <span class="icon-thermometer" />{{ highAndLows }}
        <span class="icon-windy-day" />{{ currentWeather.windSpeed }}
        <span class="icon-droplet" />{{
          formatPercent(currentWeather.precipProbability)
        }}
      </div>
      <h1 class="current-weather-data__temp">
        {{ Math.round(currentWeather.temperature) }}°
      </h1>
    </div>
    <div class="weather-front__alerts-wrapper row">

      <ul class="weather-front__alerts">
        <li
          class="weather-front__alert"
          v-for="(alert, id) in weatherAlerts"
          :key="`WEATHERALERT${id}`"
        >
          <span class="icon-warning weather-front__alert__icon" />
          <span class="weather-front__alert__title">{{ alert.title }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    time: {
      type: Array,
      required: true,
    },
    currentWeather: {
      type: Object,
      required: true,
    },
    weatherAlerts: {
      type: Array,
      required: true,
    },
    formatPercent: {
      type: Function,
      required: true,
    },
    highAndLows: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="scss">
.weather-front {
  display: grid;
  grid-row-gap: 1rem;
  grid-template-rows: auto auto 1fr auto auto;

  .flip-icon {
    color: $grey-2;
    transition: color 0.3s ease;
  }
  &__time span {
    font-size: 12px;
    text-transform: lowercase;
  }
  &__icon {
    justify-self: center;
  }
  &__summary {
    justify-self: center;
    font-size: 12px;
    letter-spacing: 1px;
    color: $grey-2;
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
    }
    &__meta {
      display: grid;
      grid-template-columns: 2rem 1fr;
      grid-row-gap: 0.5rem;
      span {
        color: $grey-2;
      }
    }
  }
  &__alerts-wrapper {
    overflow: hidden;
    min-height: 20px;
  }
  &__alerts {
    height: 25px;
    grid-row: 5 / 6;
    display: flex;
    padding-left: 350px;
    padding-right: 350px;
    // justify-content: flex-end;
    // direction: rtl;  /* <-- the trick */
    animation: autoScrollLeft 20s linear infinite;
  }
  &__alert {
    margin-right: 2rem;
    white-space: nowrap;
    &__icon {
      margin-right: 0.5rem;
      color: $yellow !important;
    }
  }
}

@keyframes autoScrollLeft {
  100% {
    transform: translateX(-66.6666%);
  }
}
</style>