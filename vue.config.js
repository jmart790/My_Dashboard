module.exports = {
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import "@/assets/scss/main.scss";`
      }
    }
  },
  lintOnSave: process.env.NODE_ENV !== 'production',
}