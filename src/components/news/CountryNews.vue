<script>
import NewsSnippet from "@/components/news/NewsSnippet";
import NewsList from "@/components/news/NewsList";

export default {
  name: "CountryNews",
  components: {
    NewsSnippet,
    NewsList
  },
  props: {
    label: {
      type: String,
      required: true
    },
    news: {
      type: Array,
      required: true
    }
  }
};
</script>

<template>
  <div class="national-news card">
    <article class="national-news__main-article">
      <img :src="news[0].media" alt="Country News Image" />
      <NewsSnippet
        class="national-news__main-article-snippet"
        :article="news[0]"
        isLarge
      />
    </article>
    <NewsList
      class="national-news__list"
      label="More National News"
      :news="news.slice(1)"
    />
  </div>
</template>

<style lang="scss">
.national-news {
  height: 100%;
  display: flex;
  flex-direction: column;
  @media screen and (min-width: $desktop) {
  }
  &__main-article {
    margin-bottom: $gap-8;
    img {
      margin-bottom: $gap-4;
      width: -webkit-fill-available;
      object-fit: cover;
      object-position: center;
      border-radius: $round-1;
    }
  }
  &__list {
    max-height: 350px;
    @media screen and (min-width: $tablet) {
      max-height: 528px;
    }
    @media screen and (min-width: $desktop) {
      max-height: 500px;
    }
  }
}
</style>