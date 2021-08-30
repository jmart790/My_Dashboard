import axios from "axios";

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
        'x-rapidapi-key': process.env.VUE_APP_RAPID_API_KEY,
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
        "x-rapidapi-key": process.env.VUE_APP_RAPID_API_KEY,
        "x-rapidapi-host": "dark-sky.p.rapidapi.com",
      },
    };
    return (await axios.request(options)).data;
  }
}
