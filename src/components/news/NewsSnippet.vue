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
    <img v-if="showImage" :src="article.media" alt="Article Image" />
    <h4>{{ article.title }}</h4>
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
  img {
    margin-bottom: $gap-2;
    object-fit: cover;
    height: 150px;
    width: 100%;
    border-radius: 20px;
  }
  h4 {
    margin-bottom: $gap-2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    color: $white;
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
    color: $primary;
    transition: color 0.2s;
    b {
      margin-left: $gap-2;
      color: inherit;
    }
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
  &--large {
    h4 {
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