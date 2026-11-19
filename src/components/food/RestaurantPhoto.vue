<script>
import { artFor } from "@/components/food/foodArt";
import { photoFor } from "@/restaurantPhotos";

// One photo slot for a restaurant: real photo, else example dish, else illustration.
// Used by the map popup (eager) and the list (lazy: only when scrolled into view).
export default {
  name: "RestaurantPhoto",
  props: {
    restaurant: {
      type: Object,
      required: true
    },
    // wait until the slot is near the viewport before asking the server
    lazy: {
      type: Boolean,
      default: false
    },
    // short "Example" tag instead of the full caption (small list thumbnails)
    compact: {
      type: Boolean,
      default: false
    }
  },
  // the content changed size (a photo arrived), e.g. so a map popup can re-fit
  emits: ["resize"],
  data() {
    return {
      photo: null, // { url, caption, source }
      state: "loading", // loading | ready | none
      failed: [], // sources whose image didn't load; skipped on retry
      visible: !this.lazy
    };
  },
  computed: {
    illustration: ({ restaurant }) => artFor(restaurant.id),
    captionText: ({ photo, compact }) => (compact ? "Example" : photo.caption)
  },
  watch: {
    "restaurant.id"() {
      this.failed = [];
      if (this.visible) this.load();
    }
  },
  mounted() {
    if (this.visible) {
      this.load();
      return;
    }
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        this.observer.disconnect();
        this.visible = true;
        this.load();
      },
      { rootMargin: "200px" } // start a little before it scrolls in
    );
    this.observer.observe(this.$el);
  },
  beforeUnmount() {
    this.observer?.disconnect();
  },
  methods: {
    async load() {
      const id = this.restaurant.id;
      this.state = "loading";
      const photo = await photoFor(this.restaurant, { skip: this.failed });
      if (this.restaurant.id !== id) return; // a newer restaurant replaced this one
      this.photo = photo;
      this.state = photo ? "ready" : "none";
    },
    // hotlinked images can 404 or block us: drop to the next source
    onError() {
      if (this.photo) this.failed.push(this.photo.source);
      this.photo = null;
      this.load();
    }
  }
};
</script>

<template>
  <figure class="r-photo" :class="`r-photo--${state}`">
    <img
      v-if="photo"
      :src="photo.url"
      alt=""
      decoding="async"
      class="r-photo__img"
      @load="$emit('resize')"
      @error="onError"
    />
    <img
      v-else-if="state === 'none'"
      :src="illustration"
      alt=""
      class="r-photo__art"
    />
    <figcaption
      v-if="photo && photo.caption"
      class="r-photo__caption"
      :title="photo.caption"
    >
      {{ captionText }}
    </figcaption>
  </figure>
</template>

<style lang="scss">
.r-photo {
  position: relative;
  margin: 0;
  overflow: hidden;
  &--loading {
    background: linear-gradient(90deg, $grey-7 0%, $grey-6 50%, $grey-7 100%);
    background-size: 200% 100%;
    animation: r-photo-shimmer 1.2s infinite linear;
  }
  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  &__art {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  &__caption {
    position: absolute;
    left: 6px;
    bottom: 6px;
    max-width: calc(100% - 12px);
    padding: 2px 6px;
    border-radius: 6px;
    background: rgba($dark, 0.75);
    color: $grey-2;
    font-size: 11px;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@keyframes r-photo-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .r-photo--loading {
    animation: none;
  }
}
</style>
