<script>
import NewsSnippet from "@/components/news/NewsSnippet.vue";

export default {
  name: "NewsList",
  components: {
    NewsSnippet,
  },
  props: {
    news: {
      type: Array,
      required: true,
    },
    label: {
      type: String,
      default: "",
    },
  },
};
</script>

<template>
  <div class="news-list">
    <h3 class="kicker">
      {{ label }}
    </h3>
    <div class="news-list__articles">
      <NewsSnippet
        v-for="article in news.slice(1)"
        :key="`NEWS_SNIPPET_${article['_id']}`"
        class="news-list__article"
        :article="article"
      />
    </div>
  </div>
</template>

<style lang="scss">
.news-list {
  padding: $gap-6;
  padding-right: $gap-4;
  background: transparent;
  border-top: 1px solid $ink;
  border-radius: 0;
  overflow-y: hidden;
  h3 {
    margin-bottom: $gap-4;
    font-weight: 400;
    font-size: 14px;
  }
  &__articles {
    height: 93%;
    overflow: auto;
    display: grid;
    column-gap: $gap-4;
    row-gap: $gap-6;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    scrollbar-width: thin;
    scrollbar-color: $ink transparent;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: $ink;
    }
  }
  &__article {
    margin-right: $gap-4;
    font-size: 14px;
  }
}
</style>