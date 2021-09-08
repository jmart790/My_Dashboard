<script>
import NewsSnippet from "@/components/news/NewsSnippet";

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
      default: false,
    },
  },
};
</script>

<template>
  <div class="news-list">
    <h3>{{ label }}</h3>
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
  background: $app-bg;
  border-radius: $round-2;
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
    &::-webkit-scrollbar {
      width: 10px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: $primary;
      background-image: -webkit-gradient(
        linear,
        left bottom,
        left top,
        color-stop(0.2, $primary-lt),
        color-stop(0.7, $primary),
        color-stop(1, $primary-dk)
      );
      border-radius: 8px;
    }
  }
  &__article {
    margin-right: $gap-4;
    font-size: 14px;
  }
}
</style>