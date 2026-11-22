<script>
export default {
  name: "NewsSnippet",
  props: {
    article: {
      type: Object,
      required: true,
    },
    isLarge: {
      type: Boolean,
      default: false,
    },
    showImage: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<template>
  <div class="news-snippet" :class="{ 'news-snippet--large': isLarge }">
    <img
      v-if="showImage && article.media"
      class="news-snippet__photo"
      :src="article.media"
      alt=""
      @error="$event.target.style.display = 'none'"
    />
    <component :is="isLarge ? 'h2' : 'h3'" class="news-snippet__title">
      {{ article.title }}
    </component>
    <p>{{ article.summary }}</p>
    <a :href="article.link || '#'" target="_blank" rel="noopener noreferrer">
      <template v-if="isLarge">Read more at</template>
      <b>{{ article.clean_url }}</b>
      <span class="icon-arrow-right2" />
    </a>
  </div>
</template>

<style lang="scss">
.news-snippet {
  &__photo {
    display: block;
    margin-bottom: $gap-2;
    width: 100%;
    height: 150px;
    object-fit: cover;
  }
  &__title {
    margin-bottom: $gap-2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    color: $ink;
  }
  p {
    margin-bottom: $gap-2;
    font-size: 14px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }
  a {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: $ink;
    font-family: $heading-font;
    font-style: italic;
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color 0.2s;
    b {
      margin-left: $gap-2;
      color: inherit;
      font-style: normal;
    }
    &:hover {
      color: $spot;
    }
    span {
      transition: color 0.2s;
      margin-left: $gap-2;
    }
  }
  &--large {
    .news-snippet__title {
      margin-bottom: $gap-2;
      font-size: 20px;
    }
    p {
      margin-bottom: $gap-6;
      line-height: 1.5;
      font-size: unset;
      -webkit-line-clamp: 6;
    }
  }
}
</style>