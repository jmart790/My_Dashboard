<script>
import { mapGetters, mapActions } from "vuex";
import PageHeader from "@/components/base/PageHeader";
import CountryNews from "@/components/news/CountryNews";
import LocalNews from "@/components/news/LocalNews";
import StateNews from "@/components/news/StateNews";

export default {
  name: "NewsPage",
  components: {
    PageHeader,
    CountryNews,
    LocalNews,
    StateNews
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
    ...mapGetters("news", ["news", "isLoading"])
  },
  methods: {
    ...mapActions("news", ["getLocalNews", "getStateNews", "getCountryNews"]),
    filterArticles(articles) {
      const articlesWithContent = articles.filter(
        article =>
          article.media && article.clean_url && article.title && article.summary
      );
      const seen = new Set();
      const articlesWithoutDupes = articlesWithContent.filter(article => {
        const duplicate = seen.has(article.title);
        seen.add(article.title);
        return !duplicate;
      });
      return articlesWithoutDupes;
    }
  }
};
</script>

<template>
  <div class="news">
    <PageHeader class="news__header" title="News" :subtitle="cityState" />
    <LocalNews
      v-if="news.local.length"
      label="Local"
      :news="filterArticles(news.local)"
      class="news__local"
    />
    <CountryNews
      v-if="news.country.length"
      label="National"
      :news="filterArticles(news.country)"
      class="news__country"
    />
    <StateNews
      v-if="news.state.length"
      label="State"
      :news="filterArticles(news.state)"
      class="news__state"
    />
  </div>
</template>


<style lang="scss">
.news {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas: "header" "local" "state" "country";
  gap: $gap-4;
  padding-bottom: 80px;
  @media screen and (min-width: $tablet) {
    gap: $gap-6;
  }
  @media screen and (min-width: $laptop) {
    grid-template-columns: 1fr 1fr 400px;
    grid-template-rows: auto auto auto;
    grid-template-areas:
      "header header country"
      "local  local  country"
      "state  state  state";
    gap: $gap-8;
  }
  @media screen and (min-width: $desktop) {
    // max-height: 100vh;
    grid-template-areas:
      "header header country"
      "local  local  country"
      "state  state  country";
  }
  &__header {
    grid-area: header;
    margin-bottom: $gap-3;
  }
  &__local {
    grid-area: local;
  }
  &__state {
    grid-area: state;
  }
  &__country {
    grid-area: country;
  }
}
</style>