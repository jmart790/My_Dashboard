<script>
import Restaurant from "@/components/food/Restaurant";

export default {
  name: "RestaurantList",
  components: { Restaurant },
  props: {
    restaurants: {
      type: Array,
      required: true
    }
  }
};
</script>

<template>
  <div class="restaurants card">
    <div class="restaurants__sort-btns">sort btns go here</div>
    <ul class="restaurants__list">
      <li
        v-for="(restaurant, index) in restaurants"
        :key="`RESTAURANT-${index}`"
      >
        <Restaurant class="restaurants__restaurant" :restaurant="restaurant" />
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
.restaurants {
  height: 100%;
  padding-right: $gap-3 !important;
  border-radius: $round-2;
  overflow-y: hidden;
  &__sort-btns {
    margin-bottom: $gap-2;
  }
  &__list {
    height: 93%;
    padding-right: $gap-4;
    display: grid;
    row-gap: $gap-6;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 10px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: $primary;
      background-image: -webkit-gradient(
        linear,
        left bottom,
        left top,
        color-stop(0.2, $primary-lt),
        color-stop(0.7, $primary),
        color-stop(1, $primary-dk)
      );
      border-radius: 8px;
    }
  }
}
</style>