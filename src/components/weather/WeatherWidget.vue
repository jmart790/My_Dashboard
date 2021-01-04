<template>
  <div class="weather-widget" v-if="weather">
    <div
      class="weather-widget__card"
      :class="{ 'weather-widget__card--flipped': isCardFlipped }"
      @click="flipCard"
    >
      <WeatherCardFront
        class="weather-widget__front"
        :city="location.city || ''"
        :time="formattedTime"
        :currentWeather="weather.currently"
        :weatherAlerts="weather.alerts || []"
        :formatPercent="formatPercent"
        :highAndLows="highAndLows"
      />
      <WeatherCardBack
        class="weather-widget__back"
        :hourlyForecast="hourlyForecast"
        :dailyForecast="dailyForecast"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import axios from "axios";
import WeatherCardFront from "./WeatherCardFront";
import WeatherCardBack from "./WeatherCardBack";

export default {
  name: "WeatherWidget",
  components: { WeatherCardFront, WeatherCardBack },
  data() {
    return {
      weather: null,
      isCardFlipped: false,
      formattedTime: [],
    };
  },
  props: {
    location: {
      type: Object,
      required: true,
    },
  },
  async created() {
    const options = {
      method: "GET",
      url: `https://dark-sky.p.rapidapi.com/${this.location.latitude},${this.location.longitude}`,
      params: { lang: "en", units: "auto" },
      headers: {
        "x-rapidapi-key": process.env.VUE_APP_RAPID_API_KEY,
        "x-rapidapi-host": "dark-sky.p.rapidapi.com",
      },
    };

    await axios
      .request(options)
      .then((response) => {
        this.weather = response.data;
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.error(error);
      });
    this.getCurrentTime();
    setInterval(this.getTime, 60000);
  },
  computed: {
    highAndLows() {
      if (this.weather) {
        let high = Math.round(this.weather.daily.data[0].temperatureHigh);
        let low = Math.round(this.weather.daily.data[0].temperatureLow);
        return `${high}° / ${low}°`;
      }
      return "";
    },
    hourlyForecast() {
      if (this.weather) {
        return this.weather.hourly.data.slice(0, 5).map((forecast) => {
          return {
            time: this.getTimeOfDay(forecast.time),
            precipProbability: this.formatPercent(forecast.precipProbability),
            icon: forecast.icon,
            temperature: Math.round(forecast.temperature),
          };
        });
      }
      return null;
    },
    dailyForecast() {
      if (this.weather) {
        return this.weather.daily.data.slice(0, 7).map((forecast) => {
          return {
            time: this.getDay(forecast.time),
            icon: forecast.icon,
            precipProbability: this.formatPercent(forecast.precipProbability),
            high: Math.round(forecast.temperatureHigh),
            low: Math.round(forecast.temperatureLow),
          };
        });
      }
      return null;
    },
  },
  methods: {
    getCurrentTime() {
      let time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      let splitTime = [time.split(" ")[0], time.split(" ")[1]];
      this.formattedTime = splitTime;
    },
    flipCard() {
      this.isCardFlipped = !this.isCardFlipped;
    },
    getTimeOfDay(date) {
      if (date) {
        let time = new Date(date * 1000).toLocaleTimeString("en-US", {
          timeZone: this.weather.timezone,
        });
        let hour = time.split(" ")[0].split(":")[0];
        let ampm = time.split(" ")[1];
        return [hour, ampm];
      } else return "";
    },
    getDay(date) {
      const days = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
      };
      if (date) {
        let day = new Date(date * 1000).getDay();
        return days[day];
      }
      return "";
    },
    formatPercent(percent) {
      return `${Math.round(percent * 100)}%`;
    },
  },
};
</script>

<style lang="scss">
.weather-widget {
  position: relative;
  max-width: 400px;
  height: 450px;
  & * {
    color: $white;
  }

  &__card {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 20px;
    box-shadow: -4px 4px 24px rgba(0, 0, 0, 0.2);
    transform-style: preserve-3d;
    transition: all 1s ease;

    &--flipped {
      transform: rotateY(180deg);
    }
  }

  &__front,
  &__back {
    position: absolute;
    height: 100%;
    width: 100%;
    padding: 1rem 1.5rem;
    padding-bottom: 0.5rem;
    border-radius: 20px;
    background: $card-bg-color;
  }

  &__front {
    z-index: 2;
    backface-visibility: hidden;
  }
  &__back {
    transform: rotateY(180deg);
    backface-visibility: hidden;
  }

  &:hover {
    .weather-widget__card {
      cursor: pointer;
    }
  }
}
</style>