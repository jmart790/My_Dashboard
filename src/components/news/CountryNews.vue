<script>
import NewsArticle from "@/components/news/NewsArticle";

export default {
  name: "CountryNews",
  components: {
    NewsArticle,
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    news: {
      type: Array,
      required: true,
    },
  },
};
</script>

<template>
  <div class="country-news">
    <div class="country-news__articles">
      <NewsArticle
        v-for="(article, id) in news"
        :key="`COUNTRY_NEWS_${id}`"
        :article="article"
        class="country-news__article"
      />
    </div>
  </div>
</template>

<style lang="scss">
.country-news {
  &__title {
    margin-bottom: $gap-4;
  }
  &__articles {
    max-height: 90vh;
    overflow-y: auto;
  }
  &__article {
    height: 200px !important;
    margin-bottom: $gap-6;
  }
}
</style>