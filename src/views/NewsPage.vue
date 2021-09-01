<script>
import { mapGetters, mapActions } from "vuex";
import PageHeader from "@/components/base/PageHeader";
import CountryNews from "@/components/news/CountryNews";

export default {
  name: "NewsPage",
  components: {
    PageHeader,
    CountryNews,
  },
  async mounted() {
    if (this.location) {
      await this.getLocalNews(this.location.name);
      await this.getStateNews(this.location.region);
      await this.getCountryNews(this.location.country);
    }
  },
  computed: {
    ...mapGetters("location", ["location", "cityState"]),
    ...mapGetters("news", ["news", "isLoading"]),
  },
  methods: {
    ...mapActions("news", ["getLocalNews", "getStateNews", "getCountryNews"]),
  },
};
</script>

<template>
  <div class="news">
    <PageHeader class="news__header" title="News" :subtitle="cityState" />
    <CountryNews
      v-if="news.country.length"
      :label="location.country"
      :news="news.country"
      class="news__country"
    />
  </div>
</template>


<style lang="scss">
.news {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas: "header" "weather";
  gap: $gap-4;
  padding-bottom: 80px;
  @media screen and (min-width: $tablet) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "header header"
      "country country";
    gap: $gap-6;
  }
  @media screen and (min-width: $laptop) {
    grid-template-columns: 1fr 1fr 450px;
    grid-template-areas:
      "header header country"
      ".  .  country";
  }
  &__header {
    grid-area: header;
    margin-bottom: $gap-3;
  }
  &__country {
    grid-area: country;
  }
}
</style>