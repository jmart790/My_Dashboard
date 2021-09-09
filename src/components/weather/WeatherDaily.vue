<script>
import { weatherMixins } from "@/mixins/weatherMixins";
import { formatMixins } from "@/mixins/formatMixins";

export default {
  name: "WeatherDaily",
  mixins: [weatherMixins, formatMixins],
  props: {
    dailyForecast: {
      type: Array,
      required: true
    }
  }
};
</script>

<template>
  <div class="weather-daily card">
    <ul class="weather-daily__forecasts">
      <li
        v-for="(forecast, index) in dailyForecast"
        :key="`DAILYFORECAST${index}`"
      >
        <p class="forecast-hour">
          {{ index === 0 ? "Today" : forecast.time }}
        </p>
        <div class="weather-daily__icon-group">
          <inline-svg
            class="weather-daily__icon"
            :src="require(`@/assets/icons/weather/${forecast.icon}.svg`)"
            height="25"
            width="30"
          />
          <p class="forecast-precipitation">
            <span v-show="showPrecipitation(forecast.icon)">
              {{ forecast.precipProbability }}
            </span>
          </p>
        </div>
        <p class="weather-daily__detail"><span>H</span> {{ forecast.high }}°</p>
        <p class="weather-daily__detail"><span>L</span> {{ forecast.low }}°</p>
        <p class="weather-daily__detail">
          <span class="icon-humidity" />{{ formatPercent(forecast.humidity) }}
        </p>
        <p class="weather-daily__detail">
          <span class="icon-windy-day" /> {{ Math.round(forecast.wind) }} mph
        </p>
      </li>
    </ul>
  </div>
</template>


<style lang="scss">
.weather-daily {
  &__header {
    margin-bottom: $gap-8;
  }
  &__forecasts {
    li {
      display: grid;
      grid-template-columns: 1fr 70px repeat(2, 32px);
      align-items: center;
      column-gap: $gap-4;
      margin-bottom: $gap-6;
      @media screen and (min-width: $tablet) {
        grid-template-columns: 1fr repeat(3, 80px);
        column-gap: $gap-8;
      }
      @media screen and (min-width: $laptop-lg) {
        grid-template-columns: 1fr repeat(5, 100px);
        column-gap: $gap-8;
        margin-bottom: $gap-8;
      }
      @media screen and (min-width: $desktop) {
        column-gap: $gap-12;
      }
    }
    li:last-of-type {
      margin-bottom: unset;
    }
  }
  .forecast-hour {
    white-space: nowrap;
    span {
      font-size: 12px;
      text-transform: lowercase;
    }
  }
  &__icon-group {
    display: flex;
    align-items: center;
  }
  &__icon {
    flex-shrink: 0;
    margin-right: $gap-1;
  }
  .forecast-precipitation span {
    color: $sky;
    font-size: 12px;
  }
  &__detail span {
    display: none;
    @media screen and (min-width: $tablet) {
      display: inline;
      margin-right: $gap-1;
    }
  }
  &__detail:nth-of-type(4),
  &__detail:nth-of-type(5) {
    display: none;
    @media screen and (min-width: $laptop-lg) {
      display: block;
    }
  }
}
</style>