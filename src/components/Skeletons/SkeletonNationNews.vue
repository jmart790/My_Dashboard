<script>
import Skeleton from "@/components/base/Skeleton";
import SkeletonItem from "@/components/base/SkeletonItem";

export default {
  name: "SkeletonNationNews",
  components: {
    Skeleton,
    SkeletonItem
  }
};
</script>

<template>
  <Skeleton class="sk-nation-news">
    <SkeletonItem class="sk-nation-news__img" height="200px" width="100%" />
    <div>
      <SkeletonItem class="sk-nation-news__header" height="24px" width="90%" />
      <SkeletonItem
        class="sk-nation-news__text"
        shape="text"
        :lines="6"
        width="100%"
      />
      <SkeletonItem class="sk-nation-news__link" height="20px" width="100px" />
    </div>
    <div class="sk-nation-news__snippets">
      <SkeletonItem
        class="sk-nation-news__header"
        height="20px"
        width="100px"
      />
      <SkeletonItem class="sk-nation-news__snippet" shape="text" width="100%" />
      <SkeletonItem class="sk-nation-news__snippet" shape="text" width="100%" />
    </div>
  </Skeleton>
</template>

<style lang="scss">
.sk-nation-news {
  display: grid;
  gap: $gap-8;
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
  }
}
</style>