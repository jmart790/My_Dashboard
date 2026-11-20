<script>
import PageHeader from "@/components/base/PageHeader.vue";
import WeatherNow from "@/components/weather/WeatherNow.vue";
import WeatherDaily from "@/components/weather/WeatherDaily.vue";
import WeatherHourly from "@/components/weather/WeatherHourly.vue";
import WeatherExtraDetails from "@/components/weather/WeatherExtraDetails.vue";
import ErrorCard from "@/components/base/ErrorCard.vue";
import Skeleton from "@/components/base/Skeleton.vue";
import SkeletonItem from "@/components/base/SkeletonItem.vue";
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
    WeatherExtraDetails,
    ErrorCard,
    Skeleton,
    SkeletonItem
  },
  mounted() {
    this.load();
  },
  watch: {
    location() {
      this.load();
    }
  },
  computed: {
    ...mapGetters("location", {
      coordinates: "coordinates",
      location: "location",
      cityState: "cityState",
      locationError: "error"
    }),
    ...mapGetters("weather", { weatherError: "error" }),
    // ready: show data; error: nothing to show and a lookup failed; else still loading
    status() {
      if (this.hasWeatherData) return "ready";
      if (this.weatherError || (this.locationError && !this.location.name)) return "error";
      return "loading";
    },
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
    ...mapActions("weather", ["getWeather"]),
    ...mapActions("location", { retryLocation: "init" }),
    load() {
      if (this.coordinates.lat !== "") this.getWeather(this.coordinates);
    },
    retry() {
      if (this.location.name) this.load();
      else this.retryLocation();
    }
  }
};
</script>

<template>
  <div class="weather">
    <PageHeader class="weather__header" title="Weather" :subtitle="cityState" />
    <template v-if="status === 'loading'">
      <Skeleton class="weather__now">
        <SkeletonItem height="180px" width="100%" />
        <SkeletonItem shape="text" :lines="3" width="100%" />
      </Skeleton>
      <Skeleton class="weather__hourly">
        <SkeletonItem shape="text" :lines="4" width="100%" />
      </Skeleton>
      <Skeleton class="weather__daily">
        <SkeletonItem shape="text" :lines="7" width="100%" />
      </Skeleton>
    </template>
    <ErrorCard
      v-else-if="status === 'error'"
      class="weather__hourly"
      category="WEATHER"
      :message-option="1"
      show-refresh-btn
      @request-data="retry"
    >
      <inline-svg src="@/assets/illustrations/undraw_Weather_notification.svg" />
    </ErrorCard>
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