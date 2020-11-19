<template>
  <div class="weather" v-if="weather">    
    <div class="weather__current">
      <div class="flex-between mb-5">
        <p class="weather__current__city">{{location.city}}</p>
        <p class="weather__current__time">{{formattedTime.time}} <span>{{formattedTime.ampm}}</span></p>
      </div>
      <inline-svg
        class="weather__current__icon" 
        :src="require(`../assets/icons/weather/${weather.currently.icon}.svg`)"   
        title="My Image"
        height="130"
      />
      <p class="weather__current__summary">{{weather.currently.summary}}</p>
      <div class="current-weather-data">
        <div class="current-weather-data__meta">
          <span class="icon-thermometer" />{{highAndLows}}
          <span class="icon-windy-day" />{{weather.currently.windSpeed}}
          <span class="icon-droplet" />{{formatPercent(weather.currently.precipProbability)}} 
        </div>
        <h1 class="current-weather-data__temp">{{ Math.round(weather.currently.temperature) }}°</h1>
      </div>
      <div class="weather__alerts-wrapper">
      <ul class="weather__alerts">
        <li 
          class="weather__alert"
          v-for="(alert,id) in weather.alerts" 
          :key="`WEATHERALERT${id}`"
        >
          <span class="icon-warning weather__alert__icon" />
          <span class="weather__alert__title">{{alert.title}}</span>
        </li>
      </ul>
    </div>
    </div>

    <!-- <ul class="weather__hourly-forecasts" v-show="false">
      <li 
        v-for="(forecast, id) in hourlyForecast" 
        :key="`HOURLYFORECAST${id}`"
      >
        <p class="forecast-hour">{{id === 0 ? 'Now' : forecast.time}}</p>
        <p>{{forecast.precipProbability}}</p>
        <span :class="forecast.icon"/>
        <p>{{forecast.temperature}}</p>
      </li>
    </ul> -->
    <!-- <hr> -->
    <!-- <ul class="weather__daily-forecasts" v-show="false">
      <li v-for="(forecast, id) in dailyForecast" :key="`DAILYFORECAST${id}`">
        <p class="forecast-hour">{{forecast.time}}</p>
        <span :class="forecast.icon" />
        <p>{{forecast.precipProbability}}</p>
        <p>{{forecast.high}}</p>
        <p>{{forecast.low}}</p>
      </li>
    </ul> -->
  </div>
</template>

<script>
/* eslint-disable */
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
        // eslint-disable-next-line 
        console.error(error);
      });
  },
  computed: {
    formattedTime() {
      if (this.weather) {
        let formatted = new Date(this.weather.currently.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        return {time: formatted.split(" ")[0], ampm: formatted.split(" ")[1]};
      }
      return ''
    },
    highAndLows() {
      if (this.weather) {
        let high = Math.round(this.weather.daily.data[0].temperatureHigh);
        let low = Math.round(this.weather.daily.data[0].temperatureLow);
        return `${high}° / ${low}°`
      }
      return ''
    },
    hourlyForecast() {
      if (this.weather) {
        return this.weather.hourly.data.slice(0,6).map(forecast => {
          return {
            time: this.getTimeOfDay(forecast.time),
            precipProbability: this.formatPercent(forecast.precipProbability),
            icon: this.weatherIconVendor(forecast.icon),
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
            icon: this.weatherIconVendor(forecast.icon),
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
      return `${Math.round(percent * 100)}%`
    },
    weatherIconVendor(value) {
      const weatherIcons = { 
        'clear-day': 'icon-sun', 
        'clear-night': 'icon-moon',  
        'partly-cloudy-day': 'icon-cloudy',
        'partly-cloudy-night': 'icon-cloud',
        'cloudy': 'icon-cloud1',
        'rain': 'icon-rainy1',
        'sleet': 'icon-weather3',
        'snow': 'icon-snowy2',
        'wind': 'icon-windy1',
        'fog': 'icon-weather2'
      }
      return weatherIcons[value] || value;
    }
  }
};
</script>

<style lang="scss">
.weather {
  overflow: hidden;
  max-width: 400px;
  height: 450px;
  padding: 2rem;
  padding-bottom: .5rem;
  border-radius: 20px;
  border: 1px solid #363636b9;
  background: rgb(4,4,4);
  background: linear-gradient(55deg, rgba(4,4,4,1) 5%,#282627 95%);
  box-shadow: -4px 4px 24px rgba(0,0,0, .2);
  & * {
    color: $white;
  }

  &__current {
    height: 100%;
    display: grid;
    grid-row-gap: 1rem;
    grid-template-rows: auto auto 1fr auto auto;
    &__time {
      span {
        font-size: 12px;
        text-transform: lowercase;
      }
    }
    &__icon {
      // margin-bottom: 1rem;
      justify-self: center;
    }
    &__summary {
      justify-self: center;
      // margin-bottom: 3rem;
      font-size: 12px;
      letter-spacing: 1px;
      color: #949494;
    }
    .current-weather-data {
      display: flex;
      justify-content: space-between;
      &__temp {
        display: flex;
        align-self: flex-end;
        font-size: 80px;
        font-weight: 300;
        line-height: .75;
      }
      &__meta {
        display: grid;
        grid-template-columns: 2rem 1fr;
        grid-row-gap: .5rem;
        span {
          color: #949494;
        }
      }
    }
  }


  &__hourly-forecasts {
    display: flex;
    li {
      margin-right: 2rem;
      display: grid;
      grid-template-rows: repeat(4, 30px);
    }
  }
  &__daily-forecasts {
    li {
      display: grid;
      grid-template-columns: 150px 30px 75px 30px 30px;
      grid-column-gap: 1rem;
      margin-right: 1rem;
      margin-bottom: .5rem;
    }
  }
  &__alerts-wrapper {
    overflow: hidden;
  }
  &__alerts {
    display: flex;
    animation: autoScrollLeft 20s linear infinite;
  }
  &__alert {
    margin-right: 2rem;
    white-space: nowrap;
    &__icon {
      margin-right: .5rem;
      color: $yellow;
    }
  }
}
@keyframes autoScrollLeft {
  100% { 
    transform: translateX(-66.6666%);  
  }
}
</style>