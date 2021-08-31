<script>
import { mapGetters, mapActions } from "vuex";
import PageHeader from "@/components/base/PageHeader";

export default {
  name: "NewsPage",
  components: {
    PageHeader,
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
    <article
      v-for="(article, id) in news.country"
      :key="`COUNTRY_NEWS_${id}`"
      class="card"
    >
      <p>{{ article.title }}</p>
      <p>{{ aticle.summary }}</p>
      <p>{{ article.published_date }}</p>
    </article>
  </div>
</template>


<style lang="scss">
</style>