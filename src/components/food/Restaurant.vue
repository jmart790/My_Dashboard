<script>
import { artFor } from "@/components/food/foodArt";

export default {
  name: "Restaurant",
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
  emits: ["select"],
  computed: {
    img: ({ restaurant }) => artFor(restaurant.id),
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
  >
    <img
      :src="img"
      alt=""
      width="130"
      height="130"
      class="restaurant__img"
    />
    <div class="restaurant__content">
      <h4>{{ restaurant.name }}</h4>
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
  padding: $gap-2;
  gap: $gap-6;
  border: 0;
  border-radius: $round-1;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  &:focus-visible {
    outline: none;
    box-shadow: $focus-shadow;
  }
  &--featured {
    box-shadow: inset 0 0 0 2px $salmon;
  }
  &__img {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    object-fit: contain;
    border-radius: $round-1;
  }
  &__content {
    position: relative;
    z-index: 1;
    flex: 1;
    min-width: 0;
    h4 {
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
    position: absolute;
    bottom: 0;
    width: 100%;
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
    background: $grey-6;
    padding: $gap-1 $gap-2;
    border-radius: 7px;
    text-transform: capitalize;
  }
  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    &--open {
      background: $forest;
    }
    &--closed {
      background: $red-2;
    }
    &--unknown {
      background: $grey-4;
    }
  }
  &::before {
    position: absolute;
    content: "";
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: $dark;
    border-radius: $round-1;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }
  &:hover::before,
  &:focus-visible::before,
  &--featured::before {
    opacity: 1;
  }
}
</style>
