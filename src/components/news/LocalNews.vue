<script>
import NewsArticle from "@/components/news/NewsArticle";

export default {
  name: "LocalNews",
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
  <div class="local-news">
    <article class="local-main-article card">
      <img :src="news[0].media || backupImage" alt="Local News Image" />
      <div class="local-main-article__details">
        <h4 class="local-main-article__title">
          {{ news[0].title }}
        </h4>
        <p class="local-main-article__copy">
          {{ news[0].summary }}
        </p>
        <a
          :href="news[0].link || '#'"
          target="_blank"
          rel="noopener noreferrer"
          class="local-main-article__link"
        >
          Read more at {{ news[0].clean_url }}
          <span class="icon-arrow-right2" />
        </a>
      </div>
    </article>

    <div class="local-news__articles">
      <NewsArticle
        v-for="(article, id) in news.slice(1)"
        :key="`COUNTRY_NEWS_${id}`"
        :article="article"
        class="local-news__article"
        minified
      />
    </div>
  </div>
</template>

<style lang="scss">
.local-news {
  &__title {
    margin-bottom: $gap-4;
  }
  &__articles {
    display: flex;
    width: 100%;
    overflow-x: scroll;
  }
  &__article {
    margin-right: $gap-6;
    flex-shrink: 0;
    width: 200px;
    height: 200px;
  }
}
.local-main-article {
  margin-bottom: $gap-6;
  display: flex;
  width: 100%;
  height: auto !important;
  padding: unset !important;
  img {
    height: 280px;
    width: 280px;
    object-fit: cover;
  }
  &__details {
    padding: $gap-6;
  }
  &__title {
    margin-bottom: $gap-4;
    font-size: 20px;
    color: $white;
  }
  &__copy {
    margin-bottom: $gap-8;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    overflow: hidden;
  }
  &__link {
    float: right;
    display: flex;
    align-items: center;
    color: $primary;
    transition: color 0.2s;
    &:hover {
      color: $primary-lt;
      span {
        color: $white;
      }
    }
    span {
      transition: color 0.2s;
      margin-left: $gap-2;
    }
  }
}
</style>