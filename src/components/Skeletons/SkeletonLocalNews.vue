<script>
import Skeleton from "@/components/base/Skeleton";
import SkeletonItem from "@/components/base/SkeletonItem";

export default {
  name: "SkeletonLocalNews",
  components: {
    Skeleton,
    SkeletonItem
  }
};
</script>

<template>
  <Skeleton class="sk-local-news">
    <SkeletonItem class="sk-local-news__img" height="200px" width="100%" />
    <div>
      <SkeletonItem class="sk-local-news__header" height="24px" width="90%" />
      <SkeletonItem
        class="sk-local-news__text"
        shape="text"
        :lines="6"
        width="100%"
      />
      <SkeletonItem class="sk-local-news__link" height="20px" width="100px" />
    </div>
    <div class="sk-local-news__snippets">
      <SkeletonItem class="sk-local-news__header" height="20px" width="100px" />
      <SkeletonItem class="sk-local-news__snippet" shape="text" width="100%" />
      <SkeletonItem class="sk-local-news__snippet" shape="text" width="100%" />
    </div>
  </Skeleton>
</template>

<style lang="scss">
.sk-local-news {
  display: grid;
  gap: $gap-8;
  @media screen and (min-width: $desktop) {
    max-height: 420px;
    height: 100%;
    grid-template-columns: 1fr 1fr 1fr;
  }
  &__img .skeleton-item {
    @media screen and (min-width: $desktop) {
      height: 100% !important;
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
    @media screen and (min-width: $desktop) {
      height: 100%;
    }
  }
  &__snippet {
  }
}
</style>