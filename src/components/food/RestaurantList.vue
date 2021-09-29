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
    <Restaurant
      class="restaurants__restaurant"
      v-for="(restaurant, index) in restaurants"
      :key="`RESTAURANT-${index}`"
      :restaurant="restaurant"
    />
  </div>
</template>

<style lang="scss">
.restaurants {
  height: 100%;
  padding-right: $gap-4;
  border-radius: $round-2;
  overflow: auto;
  &__restaurant {
    margin-bottom: $gap-8;
  }
}
</style>