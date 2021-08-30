export const weatherMixins = {
	methods: {
    showPrecipitation(weather) {
      const precipitationRelevant = ["rain", "sleet", "snow"];
      return precipitationRelevant.includes(weather);
    },
  }
}