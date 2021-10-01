<script>
export default {
  name: "StarRatings",
  props: {
    rating: {
      type: Number,
      required: true
    },
    totalRatings: {
      type: Number,
      required: true
    },
    isLarge: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<template>
  <div
    class="star-rating"
    :class="{ 'star-rating--large': isLarge }"
    :style="{ '--rating': rating }"
    :aria-label="
      `This restaurant is rated ${rating} out of 5 from ${totalRatings} reviews`
    "
  >
    <div class="star-rating__wrapper">
      <span
        v-for="star in 5"
        :key="`STAR-RATING-${star}`"
        class="icon-ratings-solid-star star-rating__icon"
      />
    </div>
    <span class="star-rating__total">{{ totalRatings }}</span>
  </div>
</template>


<style lang="scss">
// inspired by: https://codepen.io/FredGenkin/pen/eaXYGV
.star-rating {
  $percent: calc(var(--rating) / 5 * 100%);
  display: flex;
  align-items: center;
  gap: $gap-4;
  &__wrapper {
    width: min-content;
    display: flex;
    gap: $gap-2;
    background: linear-gradient(90deg, $primary $percent, $grey-1 $percent);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  &__icon {
    font-size: 14px;
  }
  &__total {
    font-size: 12px !important;
    font-weight: 600;
    color: $grey-3;
  }

  &--large {
    .star-rating__icon {
      font-size: 18px;
    }
    .star-rating__total {
      font-size: 16px;
    }
  }
}
</style>