<script>
import Restaurant from "@/components/food/Restaurant";

export default {
  name: "TopRestaurants",
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
  <div class="top-restaurants card">
    <Restaurant
      v-for="(restaurant, index) in restaurants"
      :key="`RESTAURANT-${index}`"
      :restaurant="restaurant"
    />
  </div>
</template>

<style lang="scss">
</style>