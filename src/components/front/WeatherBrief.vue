<script>
import { mapGetters } from "vuex";
import { weatherMixins } from "@/mixins/weatherMixins";
import JumpLine from "@/components/front/JumpLine.vue";

// Conditions now and the next three days, from the weather store.
export default {
  name: "WeatherBrief",
  components: { JumpLine },
  mixins: [weatherMixins],
  computed: {
    ...mapGetters("weather", ["weather", "hasWeatherData", "highAndLows", "dailyForecast", "error"]),
    now: ({ weather }) => weather.currently,
    alert: ({ weather }) => (weather.alerts || [])[0] || null,
    nextDays: ({ dailyForecast }) => dailyForecast.slice(1, 4)
  }
};
</script>

<template>
  <section class="w-brief">
    <h2 class="kicker">
      The Weather
    </h2>
    <template v-if="hasWeatherData">
      <div class="w-brief__now">
        <img class="w-brief__icon ink-keyline" :src="iconUrl(now.icon)" alt="" />
        <div>
          <p class="w-brief__temp">
            {{ Math.round(now.temperature) }}&deg;
          </p>
          <p class="w-brief__summary">
            {{ now.summary }}
          </p>
        </div>
      </div>
      <p class="w-brief__line">
        High / Low {{ highAndLows }} &middot; Rain {{ Math.round(now.precipProbability * 100) }}%
      </p>
      <p v-if="alert" class="w-brief__alert">
        {{ alert.title }}
      </p>
      <ul class="w-brief__days">
        <li v-for="day in nextDays" :key="day.time">
          <span class="w-brief__day">{{ day.time.slice(0, 3) }}</span>
          <img class="w-brief__mini ink-keyline" :src="iconUrl(day.icon)" alt="" />
          <span>{{ day.high }}&deg; / {{ day.low }}&deg;</span>
        </li>
      </ul>
    </template>
    <p v-else class="front-note">
      {{ error ? "The forecast didn't make this edition." : "Setting type…" }}
    </p>
    <JumpLine to="Weather" section="Weather" :page="2" />
  </section>
</template>

<style lang="scss">
.w-brief {
  &__now {
    display: flex;
    align-items: center;
    gap: $gap-3;
  }
  &__icon {
    width: 72px;
    height: 72px;
  }
  &__temp {
    font-family: $heading-font;
    font-size: 48px;
    font-weight: 700;
    line-height: 1;
  }
  &__summary {
    font-family: $heading-font;
    font-style: italic;
  }
  &__line {
    margin-top: $gap-2;
    font-size: 14px;
  }
  &__alert {
    margin-top: $gap-2;
    font-family: $heading-font;
    font-weight: 700;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: $spot;
  }
  &__days {
    margin: $gap-3 0 0;
    padding: 0;
    list-style: none;
    li {
      display: flex;
      align-items: center;
      gap: $gap-2;
      padding: $gap-1 0;
      border-top: 1px solid $rule-soft;
      font-size: 14px;
    }
  }
  &__day {
    width: 3.5em;
    font-family: $heading-font;
    font-weight: 700;
  }
  &__mini {
    width: 28px;
    height: 28px;
  }
}
</style>
