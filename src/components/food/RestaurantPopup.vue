<script>
import { mapGetters } from "vuex";
import { artFor } from "@/components/food/foodArt";
import { photoFor } from "@/dishPhotos";

const STATUS = {
  open: "Open now",
  closed: "Closed",
  unknown: "Hours unknown"
};

export default {
  name: "RestaurantPopup",
  props: {
    restaurant: {
      type: Object,
      required: true
    }
  },
  // emitted when the content changes size, so Leaflet can re-position the popup
  emits: ["resize"],
  data() {
    return {
      photo: null, // { url, caption } once loaded
      photoState: "loading" // loading | ready | none
    };
  },
  computed: {
    ...mapGetters("restaurants", ["openStatus"]),
    status: ({ restaurant, openStatus }) => openStatus[restaurant.id] || "unknown",
    statusLabel: ({ status }) => STATUS[status],
    illustration: ({ restaurant }) => artFor(restaurant.id),
    websiteLabel: ({ restaurant }) =>
      restaurant.url.startsWith("https://www.openstreetmap.org/")
        ? "OpenStreetMap"
        : "Website",
    directionsUrl: ({ restaurant }) =>
      `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lon}`
  },
  watch: {
    "restaurant.id": {
      immediate: true,
      handler() {
        this.loadPhoto();
      }
    }
  },
  methods: {
    async loadPhoto() {
      const id = this.restaurant.id;
      this.photo = null;
      this.photoState = "loading";
      const photo = await photoFor(this.restaurant);
      if (this.restaurant.id !== id) return; // a newer pick replaced this one
      this.photo = photo;
      this.photoState = photo ? "ready" : "none";
    },
    onPhotoError() {
      this.photo = null;
      this.photoState = "none";
    }
  }
};
</script>

<template>
  <article class="popup" aria-labelledby="popup-title">
    <figure class="popup__media" :class="`popup__media--${photoState}`">
      <img
        v-if="photo"
        :src="photo.url"
        alt=""
        class="popup__photo"
        @load="$emit('resize')"
        @error="onPhotoError"
      />
      <img
        v-else-if="photoState === 'none'"
        :src="illustration"
        alt=""
        class="popup__art"
      />
      <figcaption v-if="photo && photo.caption" class="popup__caption">
        {{ photo.caption }}
      </figcaption>
    </figure>

    <div class="popup__body">
      <h3 id="popup-title" class="popup__name">
        {{ restaurant.name }}
      </h3>
      <div class="popup__tags">
        <span class="popup__tag">{{ restaurant.cuisine }}</span>
        <span class="popup__status" :class="`popup__status--${status}`">
          {{ statusLabel }}
        </span>
      </div>
      <dl class="popup__facts">
        <div>
          <dt>Hours</dt>
          <dd>{{ restaurant.hours || "Not listed" }}</dd>
        </div>
        <div>
          <dt>Address</dt>
          <dd>{{ restaurant.address || "Not listed" }}</dd>
        </div>
        <div>
          <dt>Distance</dt>
          <dd>{{ restaurant.distance.toFixed(2) }} mi</dd>
        </div>
      </dl>
      <div class="popup__actions">
        <a
          class="popup__link"
          :href="restaurant.url"
          target="_blank"
          rel="noopener noreferrer"
        >{{ websiteLabel }}</a>
        <a
          class="popup__link"
          :href="directionsUrl"
          target="_blank"
          rel="noopener noreferrer"
        >Directions</a>
      </div>
    </div>
  </article>
</template>

<style lang="scss">
.popup {
  width: 300px;
  max-width: 100%;
  &__media {
    position: relative;
    height: 150px;
    margin: 0;
    background: $grey-7;
    overflow: hidden;
    &--loading {
      background: linear-gradient(90deg, $grey-7 0%, $grey-6 50%, $grey-7 100%);
      background-size: 200% 100%;
      animation: popup-shimmer 1.2s infinite linear;
    }
    &--none {
      background: $grey-8;
    }
  }
  &__photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  &__art {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: $gap-3;
  }
  &__caption {
    position: absolute;
    left: $gap-2;
    bottom: $gap-2;
    max-width: calc(100% - #{$gap-4});
    padding: 2px $gap-2;
    border-radius: 6px;
    background: rgba($dark, 0.75);
    color: $grey-2;
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__body {
    display: grid;
    gap: $gap-2;
    padding: $gap-4;
  }
  &__name {
    color: $white;
    font-size: 18px;
    line-height: 1.2;
    text-transform: capitalize;
  }
  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $gap-2;
  }
  &__tag,
  &__status {
    padding: 2px $gap-2;
    border-radius: 6px;
    font-size: 12px;
    text-transform: capitalize;
  }
  &__tag {
    background: $grey-6;
  }
  &__status {
    &--open {
      background: rgba($forest, 0.2);
      color: $forest-lt;
    }
    &--closed {
      background: rgba($red-2, 0.2);
      color: $red-lt;
    }
    &--unknown {
      background: $grey-7;
      color: $grey-3;
    }
  }
  &__facts {
    display: grid;
    gap: $gap-1;
    margin: 0;
    div {
      display: grid;
      grid-template-columns: 64px 1fr;
      gap: $gap-2;
    }
    dt {
      color: $grey-4;
      font-size: 12px;
      margin: 0;
    }
    dd {
      margin: 0;
      font-size: 13px;
      overflow-wrap: anywhere;
    }
  }
  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $gap-3;
    margin-top: $gap-1;
  }
  &__link {
    color: $salmon-lt !important;
    font-size: 13px;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
    &:focus-visible {
      outline: none;
      box-shadow: $focus-shadow;
      border-radius: 4px;
    }
  }
}

@keyframes popup-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
</style>
