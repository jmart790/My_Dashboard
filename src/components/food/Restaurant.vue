<script>
import RestaurantPhoto from "@/components/food/RestaurantPhoto.vue";

export default {
  name: "Restaurant",
  components: { RestaurantPhoto },
  props: {
    restaurant: {
      type: Object,
      required: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    // 'open' | 'closed' | 'unknown', from the store's openStatus
    status: {
      type: String,
      default: "unknown"
    }
  },
  // hover: id while pointed at or focused, null when left (the map tints that pin)
  emits: ["select", "hover"],
  computed: {
    details: ({ restaurant }) =>
      [restaurant.address, restaurant.hours].filter(Boolean).join(" · ") ||
      "No address or hours listed",
    statusLabel: ({ status }) =>
      ({ open: "Open now", closed: "Closed", unknown: "Hours unknown" })[status]
  }
};
</script>

<template>
  <button
    type="button"
    class="restaurant"
    :class="{ 'restaurant--featured': isFeatured }"
    :aria-current="isFeatured ? 'true' : null"
    @click="$emit('select', restaurant.id)"
    @mouseenter="$emit('hover', restaurant.id)"
    @mouseleave="$emit('hover', null)"
    @focus="$emit('hover', restaurant.id)"
    @blur="$emit('hover', null)"
  >
    <!-- lazy: 40 items would otherwise ask the server for 40 websites at once -->
    <RestaurantPhoto
      class="restaurant__img"
      :restaurant="restaurant"
      lazy
      compact
    />
    <div class="restaurant__content">
      <h3>{{ restaurant.name }}</h3>
      <p class="restaurant__copy">
        {{ details }}
      </p>
      <div class="restaurant__details">
        <span class="restaurant__type">
          <span
            class="restaurant__dot"
            :class="`restaurant__dot--${status}`"
            role="img"
            :aria-label="statusLabel"
            :title="statusLabel"
          />
          {{ restaurant.cuisine }}
        </span>
        <span>{{ restaurant.distance.toFixed(2) }} mi</span>
      </div>
    </div>
  </button>
</template>

<style lang="scss">
.restaurant {
  position: relative;
  width: 100%;
  display: flex;
  align-content: center;
  min-height: 104px;
  padding: $gap-2;
  gap: $gap-4;
  border: 0;
  border-radius: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  &:focus-visible {
    outline: none;
    box-shadow: $focus-shadow;
  }
  &__img {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    // 130px leaves no room for text on phones
    width: 88px;
    height: 88px;
    border-radius: 0;
    @media screen and (min-width: $tablet) {
      width: 130px;
      height: 130px;
    }
  }
  &__content {
    position: relative;
    z-index: 1;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    h3 {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-transform: capitalize;
    }
    * {
      font-size: 14px;
    }
  }
  &__details {
    // in flow (not pinned to the bottom) so long names and addresses can't run under it
    margin-top: auto;
    padding-top: $gap-2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $gap-4;
    white-space: nowrap;
    span {
      font-size: 12px;
    }
  }
  &__copy {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  &__type {
    display: inline-flex;
    align-items: center;
    gap: $gap-2;
    background: $paper-dark;
    padding: 2px $gap-2;
    border-radius: 0;
    font-family: $heading-font;
    font-size: 11px !important;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    &--open {
      background: $ink;
    }
    &--closed {
      background: $spot;
    }
    &--unknown {
      border: 1px solid $ink-muted; // hollow: no hours listed
    }
  }
  &::before {
    position: absolute;
    content: "";
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: $paper-dark;
    border-radius: 0;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }
  &:hover::before,
  &:focus-visible::before,
  &--featured::before {
    opacity: 1;
  }
  // the ring lives on the overlay: a shadow on the button itself would sit under it
  &--featured::before {
    box-shadow: inset 0 0 0 2px $spot;
  }
}
</style>
