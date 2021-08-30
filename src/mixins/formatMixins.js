export const formatMixins = {
	methods: {
    msToTime(time) {
      var date = new Date(time);
        let hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
        const am_pm = date.getHours() >= 12 ? "PM" : "AM";
        hours = hours < 10 ? "0" + hours : hours;
        const minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        const result = `${hours}:${minutes} ${am_pm}`;
        return result
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