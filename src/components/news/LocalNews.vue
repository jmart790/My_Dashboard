<script>
import NewsSnippet from "@/components/news/NewsSnippet";
import NewsList from "@/components/news/NewsList";

export default {
  name: "LocalNews",
  components: {
    NewsSnippet,
    NewsList
  },
  props: {
    news: {
      type: Array,
      required: true
    }
  }
};
</script>

<template>
  <div class="local-news card">
    <article class="local-news__main-article">
      <img :src="news[0].media" alt="Local News Image" />
      <NewsSnippet
        class="local-news__main-article-snippet"
        :article="news[0]"
        isLarge
      />
    </article>
    <NewsList
      class="local-news__list"
      label="More Local News"
      :news="news.slice(1)"
    />
  </div>
</template>

<style lang="scss">
.local-news {
  // border: 1px solid yellow;
  width: 100%;
  display: grid;
  gap: $gap-6;
  @media screen and (min-width: $desktop) {
    height: fit-content;
    grid-template-columns: 1fr auto;
  }
  @media screen and (min-width: $desktop) {
    max-height: 420px;
    height: 100%;
  }
  &__list {
    // border: 1px solid green;
    max-height: 350px;
    @media screen and (min-width: $laptop) {
      height: 100%;
    }
    @media screen and (min-width: $desktop) {
      max-height: unset;
      height: 80%;
      width: 280px;
    }
  }
  &__main-article {
    // border: 1px solid orange;
    display: flex;
    flex-direction: column;
    gap: $gap-4;
    @media screen and (min-width: $desktop) {
      flex-direction: row;
      height: 80%;
    }
    img {
      max-height: 300px;
      width: 100%;
      object-fit: cover;
      object-position: center;
      border-radius: $round-1;

      @media screen and (min-width: $desktop) {
        max-height: 100%;
        max-width: 500px;
      }
    }
  }
  &__main-article-snippet {
    height: fit-content;
    @media screen and (min-width: $desktop) {
      max-width: 300px;
      margin: 0 $gap-8;
    }
  }
}
</style>