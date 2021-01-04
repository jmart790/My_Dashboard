<template>
  <div class="home">
    <header class="home__header">
      <h4 class="home__title">Mi Dash</h4>
      <h4 class="home__sub-title">{{location.city || ''}}, {{location.region || ''}}</h4>
    </header>
    <WeatherWidget v-if="hasLocation" :location="location"/>
  </div>
</template>

<script>
import axios from "axios";
import WeatherWidget from "@/components/weather/WeatherWidget";


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
  padding: $gap-6 $gap-5;
  background: $app-bg-fallback;
  background: $app-bg;
  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: $gap-4;
  }
  &__sub-title {
    text-align: center;
  }
}

</style>
