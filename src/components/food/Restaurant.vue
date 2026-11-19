<script>
import streetFood from "@/assets/illustrations/undraw_Street_food.svg?url";
import breakfast from "@/assets/illustrations/undraw_breakfast.svg?url";
import cooking from "@/assets/illustrations/undraw_cooking.svg?url";

// OpenStreetMap has no photos, so cards rotate through the food illustrations
const art = [streetFood, breakfast, cooking];

export default {
  name: "Restaurant",
  props: {
    restaurant: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      default: 0
    }
  },
  computed: {
    img: ({ index }) => art[index % art.length],
    details: ({ restaurant }) =>
      [restaurant.address, restaurant.hours].filter(Boolean).join(" · ") ||
      "No address or hours listed"
  }
};
</script>

<template>
  <a
    class="restaurant"
    :href="restaurant.url"
    target="_blank"
    rel="noopener noreferrer"
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
        <span class="restaurant__type">{{ restaurant.cuisine }}</span>
        <span>{{ restaurant.distance.toFixed(2) }} mi</span>
      </div>
    </div>
  </a>
</template>


<style lang="scss">
.restaurant {
  position: relative;
  width: 100%;
  display: flex;
  align-content: center;
  padding: $gap-2;
  gap: $gap-6;
  cursor: pointer;
  outline: none !important;
  &__img {
    position: inherit;
    flex-shrink: 0;
    object-fit: contain;
    border-radius: $round-1;
  }
  &__content {
    position: relative;
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
  &__ratings {
    margin-bottom: $gap-2;
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
  &__distance {
    position: absolute;
    bottom: 0;
    right: 0;
  }
  &__type {
    background: $grey-6;
    padding: $gap-1 $gap-2;
    border-radius: 7px;
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
  &:focus::before {
    opacity: 1;
  }
}
</style>