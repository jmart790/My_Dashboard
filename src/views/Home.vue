<template>
  <div class="home">
    <h1 class="home__title">My Dashboard Dot Com</h1>
    <h2 class="home__sub-title">{{location.city || ''}}, {{location.region || ''}}</h2>
    <WeatherWidget v-if="hasLocation" :location="location"/>
  </div>
</template>

<script>
import axios from "axios";
import WeatherWidget from "@/components/WeatherWidget";


export default {
  name: 'Home',
  components: {
    WeatherWidget
  },
  data() {
    return {
      hasLocation: false,
      location: {
        city: '',
        region: '',
        latitude: '',
        longitude: ''
      },
      isLoading: false,
      error: null,
    }
  },
  async created() {
    const options = {
      method: 'GET',
      url: 'https://ip-geolocation-ipwhois-io.p.rapidapi.com/json/',
      params: {ip: '68.254.126.158'},
      headers: {
        'x-rapidapi-key': process.env.VUE_APP_RAPID_API_KEY,
        'x-rapidapi-host': 'ip-geolocation-ipwhois-io.p.rapidapi.com'
      }
    };
    this.isLoading = true;
    await axios.request(options).then(response => {
      this.location = response.data;
      this.hasLocation = true;
    }).catch(error => {
      this.error = error
    });
    this.isLoading = false;
  }
}
</script>

<style lang="scss">
.home {
  height: 100vh;
  width: 100vw;
  padding: 24px 20px;
  background: rgb(34,34,34);
  background: linear-gradient(45deg, rgba(34,34,34,1) 15%, rgba(22,22,22,1) 100%);

  &__title {
    font-size: 40px;
    text-align: center;
    color: $primary;
    text-shadow: 2px 2px 0 $grey;
  }
  &__sub-title {
    text-align: center;
  }
}
</style>
