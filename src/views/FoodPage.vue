<script>
import { mapActions, mapGetters } from "vuex";
import PageHeader from "@/components/base/PageHeader";
import RestaurantList from "@/components/food/RestaurantList";

export default {
  name: "FoodPage",
  components: {
    PageHeader,
    RestaurantList
  },
  mounted() {
    if (this.location.name) this.getRestaurantsData(this.location);
  },
  watch: {
    location: {
      deep: true,
      handler(location) {
        if (location.name) this.getRestaurantsData(location);
      }
    }
  },
  computed: {
    ...mapGetters("location", ["cityState", "location"]),
    ...mapGetters("restaurants", ["restaurants"])
  },
  methods: {
    ...mapActions("restaurants", ["getRestaurants", "getFeaturedRestaurant"]),
    async getRestaurantsData({ lat, lon, localtime }) {
      const payload = { lat, long: lon, day: localtime.split(" ")[0] };
      await this.getRestaurants(payload);
    }
  }
};
</script>
<template>
  <div class="food-page">
    <PageHeader class="food-page__header" title="Food" :subtitle="cityState" />
    <div class="food-page__featured card">Featured</div>
    <RestaurantList class="food-page__extra" :restaurants="restaurants" />
    <div class="food-page__map card">map</div>
  </div>
</template>

<style lang="scss">
.food-page {
  min-height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas: "header" "featured" "map" "extra";
  gap: $gap-4;
  margin-bottom: 80px;
  @media screen and (min-width: $tablet) {
    gap: $gap-6;
  }
  @media screen and (min-width: $laptop) {
    grid-template-columns: 1fr 1fr 400px;
    grid-template-rows: auto repeat(3, 1fr) repeat(3, auto);
    grid-template-areas:
      "header header extra"
      "featured  featured  extra"
      "featured  featured  extra"
      "featured  featured  extra"
      "map  map  map"
      "map  map  map"
      "map  map  map";
    gap: $gap-8;
  }
  @media screen and (min-width: $desktop) {
    height: 100%;
    grid-template-areas:
      "header header    extra"
      "map    featured  extra"
      "map    featured  extra"
      "map    featured  extra"
      "map    featured  extra";
  }
  &__header {
    grid-area: header;
  }
  &__featured {
    grid-area: featured;
  }
  &__top {
    grid-area: top;
  }
  &__extra {
    grid-area: extra;
  }
}
</style>
