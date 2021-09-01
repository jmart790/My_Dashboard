<script>
export default {
  name: "CountryNews",
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
    <h2 class="country-news__title">
      {{ label }}
    </h2>
    <div class="country-news__articles">
      <a
        v-for="(article, id) in news"
        :key="`COUNTRY_NEWS_${id}`"
        :href="article.link || '#'"
        target="_blank"
        rel="noopener noreferrer"
      >
        <article
          class="country-news-article card"
          :style="`backgroundImage: url(${article.media})`"
        >
          <div class="country-news-article__details">
            <h4 class="country-news-article__title">
              {{ article.title }}
            </h4>
            <p class="country-news-article__copy">
              {{ article.summary }}
            </p>
            <p class="country-news-article__link">
              Read more at {{ article.clean_url }}
              <span class="icon-arrow-right2" />
            </p>
          </div>
        </article>
      </a>
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
}
.country-news-article {
  position: relative;
  height: 250px !important;
  margin-bottom: $gap-6;
  padding: unset !important;
  display: flex;
  align-items: flex-end;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  &:hover &__details {
    transform: translateY(0);
  }
  &:hover &__copy {
    opacity: 1;
  }
  &__details {
    height: 100%;
    width: 100%;
    padding: $gap-3 $gap-6;
    background-color: rgba($black, 0.85);
    transform: translateY(70%);
    transition: transform 0.5s ease-in-out;
  }
  &__title {
    margin-bottom: $gap-4;
    font-size: 20px;
    font-weight: 800;
    color: $white;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  &__copy {
    font-weight: 400;
    letter-spacing: 1px;
    font-size: 16px;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 5;
    overflow: hidden;
  }
  &__link {
    position: absolute;
    bottom: 0;
    right: 0;
    margin: $gap-6;
    display: flex;
    align-items: center;
    float: right;
    color: $primary;
    &:hover {
      color: $primary-dk;
    }
    span {
      margin-left: $gap-2;
    }
  }
}
</style>