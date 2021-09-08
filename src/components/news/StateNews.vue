<script>
import NewsSnippet from "@/components/news/NewsSnippet";
import NewsList from "@/components/news/NewsList";

export default {
  name: "StateNews",
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
  <div class="state-news card">
    <NewsList
      class="state-news__list"
      label="More State News"
      :news="news.slice(1)"
    />
    <article class="state-news__main-article">
      <NewsSnippet
        class="state-news__main-article-snippet"
        :article="news[0]"
        showImage
        isLarge
      />
    </article>
  </div>
</template>

<style lang="scss">
.state-news {
  height: 100%;
  display: flex;
  flex-direction: column-reverse;
  gap: $gap-6;
  @media screen and (min-width: $laptop-lg) {
    max-height: 600px;
    flex-direction: row;
  }
  &__list {
    max-height: 350px;
    @media screen and (min-width: $laptop-lg) {
      max-height: 400px;
      flex-grow: 1;
      width: 280px;
    }
  }
  &__main-article {
    flex-shrink: 0;
    @media screen and (min-width: $laptop-lg) {
      width: 320px;
    }
    img {
      max-height: 300px;
      height: auto;
      width: 100%;
      margin-bottom: $gap-4;
      object-fit: cover;
      object-position: center;
      border-radius: $round-1;
      @media screen and (min-width: $laptop-lg) {
        width: 320px;
        height: 160px;
      }
    }
  }
  &__main-article-snippet {
    // margin: 0 $gap-8;
  }
}
</style>