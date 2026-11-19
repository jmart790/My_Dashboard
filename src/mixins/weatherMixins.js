const icons = import.meta.glob('@/assets/icons/weather/*.svg', { eager: true, query: '?url', import: 'default' });

export const weatherMixins = {
  methods: {
    showPrecipitation(weather) {
      const precipitationRelevant = ['rain', 'sleet', 'snow'];
      return precipitationRelevant.includes(weather);
    },
    iconUrl(name) {
      return icons[`/src/assets/icons/weather/${name}.svg`];
    },
  },
};
