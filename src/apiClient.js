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
   * @param {*} payload is expecting city or state or country
   * @returns an array of news objects
   */
  async getNewsByLocation(payload) {
    var options = {
      method: 'GET',
      url: 'https://free-news.p.rapidapi.com/v1/search',
      params: {q: payload, lang: 'en', page_size: '10'},
      headers: {
        'x-rapidapi-host': 'free-news.p.rapidapi.com',
        'x-rapidapi-key': rapidApiKey
      }
    };
    return (await axios.request(options)).data;
  },
}

