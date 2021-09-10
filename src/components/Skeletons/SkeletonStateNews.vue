<script>
import Skeleton from "@/components/base/Skeleton";
import SkeletonItem from "@/components/base/SkeletonItem";

export default {
  name: "SkeletonstateNews",
  components: {
    Skeleton,
    SkeletonItem
  }
};
</script>

<template>
  <Skeleton class="sk-state-news">
    <div class="sk-state-news__main">
      <SkeletonItem class="sk-state-news__img" height="200px" width="100%" />
      <SkeletonItem class="sk-state-news__header" height="24px" width="90%" />
      <SkeletonItem class="sk-state-news__text" shape="text" width="100%" />
      <SkeletonItem class="sk-state-news__link" height="20px" width="100px" />
    </div>
    <div class="sk-state-news__snippets">
      <SkeletonItem class="sk-state-news__header" height="20px" width="100px" />
      <SkeletonItem class="sk-state-news__snippet" shape="text" width="100%" />
      <SkeletonItem class="sk-state-news__snippet" shape="text" width="100%" />
    </div>
  </Skeleton>
</template>

<style lang="scss">
.sk-state-news {
  display: grid;
  gap: $gap-8;
  @media screen and (min-width: $laptop-lg) {
    max-height: 420px;
    height: 100%;
    grid-template-columns: 2fr 1fr;
  }
  &__main {
    @media screen and (min-width: $laptop-lg) {
      grid-column: 2/-1;
    }
  }
  &__img .skeleton-item {
    margin-bottom: $gap-8;
    @media screen and (min-width: $laptop-lg) {
      height: 150px !important;
    }
  }
  &__header {
    margin-bottom: $gap-4;
  }
  &__text,
  &__snippet {
    margin-bottom: $gap-8;
  }
  &__link {
    margin-bottom: $gap-4;
    float: right;
  }
  &__snippets {
    height: 300px;
    padding: $gap-6;
    border-radius: $round-1;
    background-color: #3b3c40;
    @media screen and (min-width: $laptop-lg) {
      height: 100%;
      grid-column: 1/2;
      grid-row-start: 1;
    }
  }
}
</style>