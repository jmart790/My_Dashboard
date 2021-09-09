<script>
import PageHeader from "@/components/base/PageHeader";
import WeatherNow from "@/components/weather/WeatherNow";
import WeatherDaily from "@/components/weather/WeatherDaily";
import WeatherHourly from "@/components/weather/WeatherHourly";
import WeatherExtraDetails from "@/components/weather/WeatherExtraDetails";
import { mapGetters, mapActions } from "vuex";
import { formatMixins } from "@/mixins/formatMixins";

export default {
  name: "WeatherPage",
  mixins: [formatMixins],
  components: {
    PageHeader,
    WeatherNow,
    WeatherDaily,
    WeatherHourly,
    WeatherExtraDetails
  },
  async mounted() {
    if (this.coordinates.lat) {
      await this.getWeather(this.coordinates);
    }
  },
  watch: {
    location() {
      this.getWeather(this.coordinates);
    }
  },
  computed: {
    ...mapGetters("location", ["coordinates", "location", "cityState"]),
    ...mapGetters("weather", [
      "hasWeatherData",
      "weather",
      "highAndLows",
      "hourlyForecast",
      "dailyForecast",
      "currentDetails"
    ])
  },
  methods: {
    ...mapActions("weather", ["getWeather"])
  }
};
</script>

<template>
  <div class="weather">
    <PageHeader class="weather__header" title="Weather" :subtitle="cityState" />
    <WeatherNow
      v-if="hasWeatherData"
      class="weather__now"
      :current-weather="weather.currently"
      :weather-alerts="weather.alerts || []"
      :high-and-lows="highAndLows"
      :time="dateToShort(new Date())"
    />
    <WeatherDaily
      v-if="hasWeatherData"
      class="weather__daily"
      :daily-forecast="dailyForecast"
    />
    <WeatherHourly
      v-if="hasWeatherData"
      class="weather__hourly"
      :hourly-forecast="hourlyForecast"
    />
    <WeatherExtraDetails
      v-if="hasWeatherData"
      class="weather__details"
      :current-details="currentDetails"
    />
  </div>
</template>


<style lang="scss">
.weather {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas: "header" "now" "hourly" "daily" "details";
  gap: $gap-4;
  padding-bottom: 80px;
  @media screen and (min-width: $tablet) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "header header"
      "details now"
      "hourly  hourly"
      "daily  daily";
    gap: $gap-6;
  }
  @media screen and (min-width: $laptop) {
    grid-template-columns: 1fr 1fr 400px;
    grid-template-areas:
      "header header now"
      "hourly hourly now"
      "daily  daily  now"
      "daily  daily  details"
      "daily  daily  details"
      "daily  daily  details";
    gap: $gap-8;
  }
  &__header {
    grid-area: header;
  }
  &__now {
    grid-area: now;
  }
  &__daily {
    grid-area: daily;
  }
  &__hourly {
    grid-area: hourly;
  }
  &__details {
    grid-area: details;
  }
}
</style>