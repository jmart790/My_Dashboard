<script>
import StarRatings from "@/components/base/StarRatings";

export default {
  name: "restaurant",
  components: { StarRatings },
  props: {
    restaurant: {
      type: Object,
      Required: true
    }
  },
  computed: {
    name: ({ restaurant }) => restaurant.venue.name,
    neighborhood: ({ restaurant }) => restaurant.venue.location.neighborhood,
    rating: ({ restaurant }) => restaurant.venue.rating,
    totalRatings: ({ restaurant }) => restaurant.venue.total_ratings,
    priceRange: ({ restaurant }) => restaurant.venue.price_range,
    distance: ({ restaurant }) => restaurant.venue.travel_time.distance,
    foodType: ({ restaurant }) => restaurant.venue.type,
    copy: ({ restaurant }) => restaurant.venue.content[0].body,
    img: ({ restaurant }) => {
      const fileNames = restaurant.venue.responsive_images.file_names;
      const urls = restaurant.venue.responsive_images.urls;
      return urls[fileNames[0]]["1:1"]["200"];
    }
  }
};
</script>

<template>
  <div tabindex="0" class="restaurant">
    <img
      :src="img"
      alt="restaurant image"
      height="130px"
      class="restaurant__img"
    />
    <div class="restaurant__content">
      <h4>{{ name }}</h4>
      <StarRatings
        class="restaurant__ratings"
        :rating="rating"
        :totalRatings="totalRatings"
      />
      <p class="restaurant__copy">
        {{
          copy ||
            `A brand new ${foodType} restaurant to embrace the ${neighborhood} scene.`
        }}
      </p>
      <div class="restaurant__details">
        <span class="restaurant__type">{{ foodType }}</span>
        <p>
          <span
            v-for="dollar in priceRange"
            :key="`DOLLAR-SIGN--${dollar}`"
            class="icon-rewards-solid-dollar-sign"
          />
        </p>
        <span>{{ distance.toFixed(2) }} mi</span>
      </div>
    </div>
  </div>
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