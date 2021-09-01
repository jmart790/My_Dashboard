<script>
export default {
  name: "NewsArticle",
  props: {
    article: {
      type: Object,
      required: true,
    },
    minified: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<template>
  <a
    :href="article.link"
    target="_blank"
    rel="noopener noreferrer"
    class="news-article-container"
  >
    <article
      class="news-article card"
      :style="`backgroundImage: url(${article.media})`"
    >
      <div class="news-article__details">
        <h4
          class="news-article__title"
          :class="{ 'news-article__title--minified': minified }"
        >
          {{ article.title }}
        </h4>
        <p v-if="!minified" class="news-article__copy">
          {{ article.summary }}
        </p>
        <p
          class="news-article__link"
          :class="{ 'news-article__link--minified': minified }"
        >
          <template v-if="!minified">Read more at</template>
          <strong>{{ article.clean_url }}</strong>
          <span class="icon-arrow-right2" />
        </p>
      </div>
    </article>
  </a>
</template>

<style lang="scss">
.news-article-container {
  display: block;
}
.news-article {
  position: relative;
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
  &:hover &__title--minified {
    -webkit-line-clamp: 5;
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
    &--minified {
      font-size: 15px;
    }
  }
  &__copy {
    font-weight: 400;
    letter-spacing: 1px;
    font-size: 16px;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }
  &__link {
    position: absolute;
    bottom: 0;
    right: 0;
    margin: $gap-4 $gap-6;
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
    strong {
      display: inline;
      color: inherit;
      margin-left: $gap-2;
    }
    &--minified {
      font-size: 14px;
    }
  }
}
</style>