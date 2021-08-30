<script>
import { weatherMixins } from '@/mixins/weatherMixins';

export default {
  name: 'WeatherHourly',
  mixins: [weatherMixins],
  props: {
    hourlyForecast: {
      type: Array,
      required: true,
    },
  },
};
</script>

<template>
  <div class="weather-hourly card">
    <ul class="weather-hourly__forecasts">
      <li v-for="(forecast, id) in hourlyForecast" :key="`HOURLYFORECAST${id}`">
        <p class="forecast-hour">
          {{ id === 0 ? "Now" : forecast.time[0] }}
          <span>{{ id > 0 ? forecast.time[1] : "" }}</span>
        </p>
        <p class="forecast-precipitation">
          <span v-show="showPrecipitation(forecast.icon)">
            {{ forecast.precipProbability }}
          </span>
        </p>
        <inline-svg
          class="forecast-icon"
          :src="require(`@/assets/icons/weather/${forecast.icon}.svg`)"
          height="30"
          width="40"
        />
        <p class="weather-hourly__temp">{{ forecast.temperature }}°</p>
      </li>
    </ul>
  </div>
</template>


<style lang="scss">
.weather-hourly {
  &__forecasts {
    display: grid;
    // justify-content: space-between;
    grid-template-columns: repeat(5, 1fr);
    row-gap: $gap-6;
    column-gap: $gap-4;
    @media screen and (min-width: $laptop-lg) {
      grid-template-columns: repeat(10, 1fr);
    }
    li {
      display: grid;
      grid-template-rows: 25px 20px 35px 35px;
      justify-items: center;
    }
  }
  .forecast-hour {
    white-space: nowrap;
    span {
      font-size: 12px;
      text-transform: lowercase;
    }
  }
  .forecast-precipitation span {
    color: $sky;
    font-size: 12px;
  }
  &__temp {
    display: flex;
    align-items: center;
  }
}
</style>