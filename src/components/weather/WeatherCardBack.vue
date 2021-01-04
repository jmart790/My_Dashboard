<template>
  <div class="weather-back">
    <ul class="weather-back__hourly-forecasts">
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
        <p>{{ forecast.temperature }}°</p>
      </li>
    </ul>

    <ul class="weather-back__daily-forecasts">
      <li v-for="(forecast, id) in dailyForecast" :key="`DAILYFORECAST${id}`">
        <p class="forecast-hour">{{ forecast.time }}</p>
        <inline-svg
          class="forecast-icon"
          :src="require(`@/assets/icons/weather/${forecast.icon}.svg`)"
          height="25"
          width="30"
        />
        <p class="forecast-precipitation">
          <span v-show="showPrecipitation(forecast.icon)">
            {{ forecast.precipProbability }}
          </span>
        </p>
        <p>{{ forecast.high }}°</p>
        <p>{{ forecast.low }}°</p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    hourlyForecast: {
      type: Array,
      required: true,
    },
    dailyForecast: {
      type: Array,
      required: true,
    },
  },
  methods: {
    showPrecipitation(weather) {
      const precipitationRelevant = ["rain", "sleet", "snow"];
      return precipitationRelevant.includes(weather);
    },
  },
};
</script>

<style lang="scss">
.weather-back {
  &__hourly-forecasts {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border-radius: 15px;
    background: rgba(128, 128, 128, 0.1);
    margin-bottom: 1rem;
    li {
      display: grid;
      grid-template-rows: 25px 20px 35px 35px;
      justify-items: center;
    }
  }
  &__daily-forecasts {
    li {
      display: grid;
      grid-template-columns: minmax(84px, 1fr) 30px minmax(25px, 55px) 40px 40px;
      grid-column-gap: 1rem;
      margin-bottom: 0.75rem;
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
}
</style>