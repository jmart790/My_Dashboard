<script>
import { mapActions, mapGetters } from "vuex";
import Restaurant from "@/components/food/Restaurant.vue";

export default {
  name: "RestaurantList",
  components: { Restaurant },
  computed: {
    ...mapGetters("restaurants", [
      "filteredRestaurants",
      "openStatus",
      "cuisines",
      "featured",
      "sort",
      "openNow",
      "cuisine"
    ])
  },
  watch: {
    // keep the active pick visible in the list, whichever side (map or list) picked it
    "featured.id": {
      flush: "post",
      handler(id) {
        if (id) this.revealInList(id);
      }
    },
    // filters and sorting reorder the list; the pick may have moved out of view
    filteredRestaurants: {
      flush: "post",
      handler() {
        if (this.featured) this.revealInList(this.featured.id);
      }
    }
  },
  methods: {
    // Scrolls only the list container, never the page (scrollIntoView would also
    // scroll the page on phones, pulling the map out of view).
    revealInList(id) {
      const list = this.$refs.list;
      const item = list && list.querySelector(`[data-id="${CSS.escape(id)}"]`);
      if (!item) return;
      const top = item.offsetTop;
      const bottom = top + item.offsetHeight;
      const visible = top >= list.scrollTop && bottom <= list.scrollTop + list.clientHeight;
      if (visible) return;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      list.scrollTo({
        top: top - (list.clientHeight - item.offsetHeight) / 2,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    },
    ...mapActions("restaurants", [
      "selectRestaurant",
      "setHovered",
      "setSort",
      "setOpenNow",
      "setCuisine",
      "clearFilters"
    ])
  }
};
</script>

<template>
  <div class="restaurants card">
    <div class="restaurants__controls">
      <div class="restaurants__row" role="group" aria-label="Sort and filter">
        <button
          type="button"
          class="chip"
          :aria-pressed="sort === 'distance'"
          @click="setSort('distance')"
        >
          Nearest
        </button>
        <button
          type="button"
          class="chip"
          :aria-pressed="sort === 'name'"
          @click="setSort('name')"
        >
          A–Z
        </button>
        <button
          type="button"
          class="chip"
          :aria-pressed="openNow"
          @click="setOpenNow(!openNow)"
        >
          Open now
        </button>
      </div>
      <div
        v-if="cuisines.length"
        class="restaurants__row"
        role="group"
        aria-label="Cuisine"
      >
        <button
          type="button"
          class="chip"
          :aria-pressed="!cuisine"
          @click="setCuisine(null)"
        >
          All
        </button>
        <button
          v-for="option in cuisines"
          :key="option.name"
          type="button"
          class="chip"
          :aria-pressed="cuisine === option.name"
          @click="setCuisine(option.name)"
        >
          {{ option.name }}
          <span class="chip__count">{{ option.count }}</span>
        </button>
      </div>
    </div>

    <div v-if="!filteredRestaurants.length" class="restaurants__empty">
      <p>No places match these filters.</p>
      <button type="button" class="chip" @click="clearFilters">
        Clear filters
      </button>
    </div>
    <ul v-else ref="list" class="restaurants__list">
      <li
        v-for="restaurant in filteredRestaurants"
        :key="restaurant.id"
        :data-id="restaurant.id"
      >
        <Restaurant
          :restaurant="restaurant"
          :is-featured="featured !== null && featured.id === restaurant.id"
          :status="openStatus[restaurant.id]"
          @select="selectRestaurant"
          @hover="setHovered"
        />
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
.restaurants {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: $gap-4;
  padding-right: $gap-3 !important;
  border-radius: $round-2;
  overflow: hidden;
  &__controls {
    display: grid;
    gap: $gap-2;
  }
  &__row {
    display: flex;
    gap: $gap-2;
    overflow-x: auto;
    padding-bottom: $gap-1;
  }
  &__empty {
    display: grid;
    justify-items: start;
    gap: $gap-3;
  }
  &__list {
    position: relative; // offsetTop of items is measured against the list
    flex: 1;
    min-height: 0;
    // stacked: cap it so the page doesn't become 40 items long;
    // side by side: fill the viewport-tall column and scroll inside
    max-height: 70vh;
    @media screen and (min-width: $laptop) {
      max-height: none;
    }
    padding-right: $gap-4;
    display: grid;
    align-content: start;
    row-gap: $gap-6;
    overflow-x: hidden;
    overflow-y: auto;
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
