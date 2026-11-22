<script>
import { mapGetters } from "vuex";
import RestaurantPhoto from "@/components/food/RestaurantPhoto.vue";
import JumpLine from "@/components/front/JumpLine.vue";

// Today's pick: the same featured restaurant the Food page opens with.
export default {
  name: "DiningBrief",
  components: { RestaurantPhoto, JumpLine },
  computed: {
    ...mapGetters("restaurants", ["featured", "restaurants", "openStatus", "isLoading", "error"]),
    status: ({ featured, openStatus }) => openStatus[featured.id],
    openCount: ({ restaurants, openStatus }) => restaurants.filter((r) => openStatus[r.id] === "open").length,
    statusLabel: ({ status }) => ({ open: "Open now", closed: "Closed now" })[status] || "Hours unknown"
  }
};
</script>

<template>
  <section class="d-brief">
    <h2 class="kicker">
      Dining &middot; Today's Pick
    </h2>
    <template v-if="featured">
      <RestaurantPhoto class="d-brief__photo" :restaurant="featured" />
      <h3 class="d-brief__name">
        {{ featured.name }}
      </h3>
      <p class="d-brief__meta">
        <span class="d-brief__cuisine">{{ featured.cuisine }}</span>
        &middot; {{ featured.distance.toFixed(1) }} mi
        &middot; <span :class="`d-brief__status d-brief__status--${status}`">{{ statusLabel }}</span>
      </p>
      <p class="d-brief__count">
        {{ openCount }} of {{ restaurants.length }} nearby eateries are open now.
      </p>
    </template>
    <p v-else class="front-note">
      {{ isLoading ? "Setting type…" : error ? "The dining column didn't make this edition." : "No eateries listed nearby." }}
    </p>
    <JumpLine to="Food" section="Dining" :page="4" />
  </section>
</template>

<style lang="scss">
.d-brief {
  &__photo {
    height: 170px;
    border: 1px solid $ink;
    background: $paper-dark;
  }
  &__name {
    margin-top: $gap-2;
    font-size: 22px;
    line-height: 1.2;
  }
  &__meta {
    margin-top: $gap-1;
    font-size: 14px;
  }
  &__cuisine {
    text-transform: capitalize;
  }
  &__status {
    font-family: $heading-font;
    font-weight: 700;
    &--closed {
      color: $spot;
    }
    &--unknown {
      color: $ink-muted;
    }
  }
  &__count {
    margin-top: $gap-2;
    font-size: 13px;
    font-style: italic;
    color: $ink-muted;
  }
}
</style>
