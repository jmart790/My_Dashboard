<script>
import { mapActions, mapGetters } from "vuex";
import PageHeader from "@/components/base/PageHeader.vue";
import ErrorCard from "@/components/base/ErrorCard.vue";
import Skeleton from "@/components/base/Skeleton.vue";
import SkeletonItem from "@/components/base/SkeletonItem.vue";
import RestaurantList from "@/components/food/RestaurantList.vue";
import RestaurantMap from "@/components/food/RestaurantMap.vue";

export default {
  name: "FoodPage",
  components: {
    PageHeader,
    ErrorCard,
    Skeleton,
    SkeletonItem,
    RestaurantList,
    RestaurantMap
  },
  computed: {
    ...mapGetters("location", ["cityState", "location"]),
    ...mapGetters("restaurants", ["restaurants", "isLoading", "error"]),
    status() {
      if (this.isLoading || !this.location.name) return "loading";
      if (this.error) return "error";
      if (!this.restaurants.length) return "empty";
      return "ready";
    }
  },
  watch: {
    location: {
      deep: true,
      handler() {
        this.load();
      }
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    ...mapActions("restaurants", ["getRestaurants"]),
    load() {
      const { name, lat, lon } = this.location;
      if (name) this.getRestaurants({ lat, lon });
    }
  }
};
</script>

<template>
  <div class="food-page">
    <PageHeader class="food-page__header" title="Food" :subtitle="cityState" />

    <template v-if="status === 'loading'">
      <Skeleton class="food-page__map food-page__sk-map">
        <SkeletonItem height="100%" width="100%" />
      </Skeleton>
      <Skeleton class="food-page__extra">
        <SkeletonItem shape="text" :lines="12" width="100%" />
      </Skeleton>
    </template>

    <ErrorCard
      v-else-if="status === 'error'"
      class="food-page__map"
      category="FOOD"
      :message-option="1"
      show-refresh-btn
      @request-data="load"
    >
      <inline-svg src="@/assets/illustrations/undraw_cooking.svg" />
    </ErrorCard>

    <div v-else-if="status === 'empty'" class="food-page__map food-page__empty card">
      <h2>No restaurants found near {{ cityState }}</h2>
      <p>OpenStreetMap doesn't list any within about a mile. Try another zip code.</p>
    </div>

    <template v-else>
      <RestaurantMap class="food-page__map" />
      <RestaurantList class="food-page__extra" />
    </template>
  </div>
</template>

<style lang="scss">
.food-page {
  min-height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas: "header" "map" "extra";
  gap: $gap-4;
  margin-bottom: 80px;
  @media screen and (min-width: $tablet) {
    gap: $gap-6;
  }
  @media screen and (min-width: $laptop) {
    grid-template-columns: minmax(0, 1fr) 400px;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      "header extra"
      "map    extra";
    gap: $gap-8;
  }
  &__header {
    grid-area: header;
  }
  &__map {
    grid-area: map;
  }
  &__extra {
    grid-area: extra;
  }
  &__sk-map {
    min-height: 60vh;
    @media screen and (min-width: $laptop) {
      min-height: 560px;
    }
  }
  &__empty {
    display: grid;
    align-content: center;
    gap: $gap-3;
    h2 {
      color: $white;
    }
  }
}
</style>
