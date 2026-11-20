<script>
import { mapGetters } from "vuex";
import RestaurantPhoto from "@/components/food/RestaurantPhoto.vue";

const STATUS = {
  open: "Open now",
  closed: "Closed",
  unknown: "Hours unknown"
};

export default {
  name: "RestaurantPopup",
  components: { RestaurantPhoto },
  props: {
    restaurant: {
      type: Object,
      required: true
    }
  },
  // emitted when the content changes size, so Leaflet can re-position the popup
  emits: ["resize"],
  computed: {
    ...mapGetters("restaurants", ["openStatus"]),
    status: ({ restaurant, openStatus }) => openStatus[restaurant.id] || "unknown",
    statusLabel: ({ status }) => STATUS[status],
    websiteLabel: ({ restaurant }) =>
      restaurant.url.startsWith("https://www.openstreetmap.org/")
        ? "OpenStreetMap"
        : "Website",
    directionsUrl: ({ restaurant }) =>
      `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lon}`
  },
};
</script>

<template>
  <article class="popup" aria-labelledby="popup-title">
    <RestaurantPhoto
      class="popup__media"
      :restaurant="restaurant"
      @resize="$emit('resize')"
    />

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
    height: 150px;
  }
  &__body {
    display: grid;
    gap: $gap-2;
    padding: $gap-4;
  }
  &__name {
    color: $ink;
    font-size: 18px;
    line-height: 1.2;
    text-transform: capitalize;
  }
  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $gap-2;
  }
  // printed stamps: bordered small caps
  &__tag,
  &__status {
    padding: 1px $gap-2;
    border: 1px solid transparent;
    border-radius: 0;
    font-family: $heading-font;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  &__tag {
    background: $paper-dark;
  }
  &__status {
    &--open {
      border-color: $ink;
      color: $ink;
    }
    &--closed {
      border-color: $spot;
      color: $spot;
    }
    &--unknown {
      border-color: $rule-soft;
      border-style: dashed;
      color: $ink-muted;
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
      color: $ink-muted;
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
    color: $ink !important;
    text-decoration: underline;
    text-underline-offset: 3px;
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

</style>
