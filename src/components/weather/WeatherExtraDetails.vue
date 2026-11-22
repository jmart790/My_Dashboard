<script>
import { formatMixins } from '@/mixins/formatMixins';

export default {
  name: "WeatherExtraDetails",
  mixins: [formatMixins],
  props: {
    currentDetails: {
      type: Object,
      required: true
    }
  }
}
</script>

<template>
  <div class="weather-details card">
    <h2 class="kicker weather-details__kicker">
      Today's Details
    </h2>
    <figure>
      <figcaption>Daily Summary</figcaption>
      <p>{{ currentDetails.summary }}</p>
    </figure>
    <figure>
      <figcaption>Sunrise</figcaption>
      <p>{{ toLocalTime(currentDetails.sunriseTime, currentDetails.timezone) }}</p>
    </figure>
    <figure>
      <figcaption>Sunset</figcaption>
      <p>{{ toLocalTime(currentDetails.sunsetTime, currentDetails.timezone) }}</p>
    </figure>
    <figure>
      <figcaption>Humidty</figcaption>
      <p>{{ formatPercent(currentDetails.humidity) }}</p>
    </figure>
    <figure>
      <figcaption>Chance of rain</figcaption>
      <p>{{ formatPercent(currentDetails.precipProbability) }}</p>
    </figure>
    <figure>
      <figcaption>Wind</figcaption>
      <p>{{ Math.round(currentDetails.windSpeed) }} mph</p>
    </figure>
    <figure>
      <figcaption>Visibility</figcaption>
      <p>{{ currentDetails.visibility }} mi</p>
    </figure>
  </div>
</template>

<style lang="scss">
.weather-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $gap-4;
  background: unset !important;
  box-shadow: unset !important;
  &__kicker {
    grid-column: 1/-1;
  }
  figure {
    &:first-of-type {
      grid-column: 1/-1;
      max-width: 32ch;
    }
    figcaption {
      font-size: 14px;
    }
    p {
      color: $ink;
    }
  }

}
</style>