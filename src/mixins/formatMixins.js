export const formatMixins = {
	methods: {
    toLocalTime(seconds, timeZone) {
      return new Date(seconds * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone });
    },
    formatPercent(percent) {
      return `${Math.round(percent * 100)}%`;
    },
    dateToShort(date) {
      const longEnUSFormatter = new Intl.DateTimeFormat('en-US', {
        year:  'numeric',
        month: 'short',
        day:   'numeric',
      });
      return longEnUSFormatter.format(date);
    }
  }
}