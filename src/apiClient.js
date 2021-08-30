import axios from "axios";
const rapidApiKey = process.env.VUE_APP_RAPID_API_KEY;

export default {
  /**
   *
   * @returns no location data object
   * @params is a string zipcode
   */
  async getLocation(params) {
    const options = {
      method: 'GET',
      url: 'https://weatherapi-com.p.rapidapi.com/timezone.json',
      params: {q: params },
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com'
      }
    };
    return (await axios.request(options)).data;
  },
  /**
   * 
   * @param {*} an object containing lat and lon coordinates
   * @returns a weather object
   */
  async getWeather({ lat,lon }) {
    const options = {
      method: "GET",
      url: `https://dark-sky.p.rapidapi.com/${lat},${lon}`,
      params: { lang: "en", units: "auto" },
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "dark-sky.p.rapidapi.com",
      },
    };
    return (await axios.request(options)).data;
  },
  /**
   * 
   * @param {*} payload is expecting city or state
   * @returns an array of news objects
   */
  async getNewsByLocation(payload) {
    const options = {
      method: 'GET',
      url: 'https://google-news1.p.rapidapi.com/geolocation',
      params: {geo: payload, country: 'US', lang: 'en', limit: '50', media: 'true'},
      headers: {
        'x-rapidapi-host': 'google-news1.p.rapidapi.com',
        'x-rapidapi-key': rapidApiKey
      }
    };
    return (await axios.request(options)).data;
  },
  /**
   * 
   * @param {*} payload is a country or providence
   * @returns an array of news objects
   */
  async getTopNewsHeadlines(payload) {
    const options = {
      method: 'GET',
      url: 'https://google-news1.p.rapidapi.com/top-headlines',
      params: {country: payload, lang: 'en', limit: '50', media: 'true'},
      headers: {
        'x-rapidapi-host': 'google-news1.p.rapidapi.com',
        'x-rapidapi-key': rapidApiKey
      }
    };
    return (await axios.request(options)).data;
  }
}
