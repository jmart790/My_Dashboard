<template>
  <div class="weather" v-if="weather">
    <h1 class="weather__title">Weather</h1>
    <ul class="weather__alerts">
      <li v-for="(alert,id) in weather.alerts" :key="`WEATHERALERT${id}`">
        <span>{{alert.severity}}</span>
        <span>{{alert.title}}</span>
        <!-- <span>{{alert.description}}</span> -->
      </li>
    </ul>
    <p>{{ Math.round(weather.currently.temperature) }}°</p>
    <p>{{highAndLows}}</p>
    <hr>
    <ul class="weather__hourly-forecast">
      <li v-for="(forecast, id) in hourlyForecast" :key="`HOURLYFORECAST${id}`">
        <p class="forecast-hour">{{id === 0 ? 'Now' : forecast.time}}</p>
        <p>{{id > 0 ? forecast.precipProbability : '_'}}</p>
        <p>{{forecast.icon}}</p>
        <p>{{forecast.temperature}}</p>
      </li>
    </ul>
    <hr>
    <ul class="weather__daily-forecast">
      <li v-for="(forecast, id) in dailyForecast" :key="`DAILYFORECAST${id}`">
        <p class="forecast-hour">{{forecast.time}}</p>
        <p>{{forecast.icon}}</p>
        <p>{{forecast.precipProbability}}</p>
        <p>{{forecast.high}}</p>
        <p>{{forecast.low}}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "WeatherWidget",
  data() {
    return {
      weather: null,
    };
  },
  props: {
    location: {
      type: Object,
      required: true
    }
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

    await axios.request(options)
      .then(response => {
        this.weather = response.data;
      })
      .catch(error => {
        console.error(error);
      });
  },
  computed: {
    highAndLows() {
      if (this.weather) {
        let high = Math.round(this.weather.daily.data[0].temperatureHigh);
        let low = Math.round(this.weather.daily.data[0].temperatureLow);
        return `H: ${high}°  L: ${low}°`
      }
      return ''
    },
    hourlyForecast() {
      if (this.weather) {
        return this.weather.hourly.data.slice(0,6).map(forecast => {
          return {
            time: this.getTimeOfDay(forecast.time),
            precipProbability: this.formatPercent(forecast.precipProbability),
            icon: forecast.icon,
            temperature: Math.round(forecast.temperature)
          }
        })
      }
      return null
    },
    dailyForecast() {
      if (this.weather) {
        return this.weather.daily.data.map(forecast => {
          return {
            time: this.getDay(forecast.time),
            icon: forecast.icon,
            precipProbability: this.formatPercent(forecast.precipProbability),
            high: Math.round(forecast.temperatureHigh),
            low: Math.round(forecast.temperatureLow),
          }
        })
      }
      return null
    }
  },
  methods: {
    getTimeOfDay(date) {
      if (date) {
        let time = new Date(date * 1000).toLocaleTimeString("en-US", { timeZone: this.weather.timezone });
        let hour = time.split(" ")[0].split(":")[0];
        let ampm = time.split(" ")[1]
        return `${hour} ${ampm}`
      }
      else return ''
    },
    getDay(date) {
      const days = {0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday'}
      if (date) {
        let day = new Date(date * 1000).getDay();
        return days[day];
      }
      return ''
    },
    formatPercent(percent) {
      if (percent) {
        return `${Math.round(percent * 100)}%`
      }
      return ''
    }
  }
};
</script>

<style lang="scss">
.weather {
  overflow: hidden;
  &__alerts {
    display: flex;
    // overflow: hidden;
    // border: 1px solid blue;
    animation: autoScrollLeft 20s linear infinite;
    span {
      margin-right: 1rem;
      white-space: nowrap;
    }
  }
  &__hourly-forecast {
    display: flex;
    li {
      margin-right: 1rem;
    }
  }
  &__daily-forecast {
    li {
      display: grid;
      grid-template-columns: 200px 200px 100px 50px 50px;
      grid-column-gap: 1rem;
      margin-right: 1rem;
    }
  }
}
// icons names
// clear-day
// clear-night
// partly-cloudy-day
// partly-cloudy-night
// cloudy
// rain
// sleet
// snow
// wind
// fog
@keyframes autoScrollLeft {
  100% { 
    transform: translateX(-66.6666%);  
  }
}
</style>