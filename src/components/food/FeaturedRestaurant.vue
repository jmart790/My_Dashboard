<script>
import { mapActions, mapGetters } from "vuex";
import { artFor } from "@/components/food/foodArt";

const STATUS = {
  open: "Open now",
  closed: "Closed",
  unknown: "Hours unknown"
};

export default {
  name: "FeaturedRestaurant",
  computed: {
    ...mapGetters("restaurants", ["featured", "filteredRestaurants", "openStatus"]),
    // Filters that match nothing show the empty state even though the pick still exists
    hasPick: ({ featured, filteredRestaurants }) =>
      featured !== null && filteredRestaurants.length > 0,
    img: ({ featured }) => artFor(featured.id),
    status: ({ featured, openStatus }) => openStatus[featured.id],
    statusLabel: ({ status }) => STATUS[status],
    websiteLabel: ({ featured }) =>
      featured.url.startsWith("https://www.openstreetmap.org/")
        ? "OpenStreetMap"
        : "Website",
    directionsUrl: ({ featured }) =>
      `https://www.google.com/maps/dir/?api=1&destination=${featured.lat},${featured.lon}`
  },
  methods: {
    ...mapActions("restaurants", ["shuffleFeatured", "clearFilters"])
  }
};
</script>

<template>
  <section class="featured card" aria-labelledby="featured-title">
    <div v-if="hasPick" class="featured__layout">
      <img
        class="featured__img"
        :src="img"
        alt=""
        width="220"
        height="220"
      />
      <div class="featured__body">
        <p class="featured__eyebrow">
          Tonight, try
        </p>
        <h2 id="featured-title" class="featured__name">
          {{ featured.name }}
        </h2>
        <div class="featured__tags">
          <span class="featured__tag">{{ featured.cuisine }}</span>
          <span class="featured__status" :class="`featured__status--${status}`">
            {{ statusLabel }}
          </span>
        </div>
        <dl class="featured__facts">
          <div>
            <dt>Hours</dt>
            <dd>{{ featured.hours || "Hours not listed" }}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{{ featured.address || "Address not listed" }}</dd>
          </div>
          <div>
            <dt>Distance</dt>
            <dd>{{ featured.distance.toFixed(2) }} mi</dd>
          </div>
        </dl>
        <div class="featured__actions">
          <button type="button" class="featured__shuffle" @click="shuffleFeatured">
            <span class="icon-actions-linear-refresh" aria-hidden="true" />
            Shuffle
          </button>
          <a
            class="featured__link"
            :href="featured.url"
            target="_blank"
            rel="noopener noreferrer"
          >{{ websiteLabel }}</a>
          <a
            class="featured__link"
            :href="directionsUrl"
            target="_blank"
            rel="noopener noreferrer"
          >Directions</a>
        </div>
      </div>
    </div>
    <div v-else class="featured__empty">
      <h2 id="featured-title" class="featured__name">
        Nothing matches these filters
      </h2>
      <button type="button" class="chip" @click="clearFilters">
        Clear filters
      </button>
    </div>
  </section>
</template>

<style lang="scss">
.featured {
  // side-by-side depends on the card's own width, not the viewport's:
  // at laptop widths the card sits in a narrow grid column
  container-type: inline-size;
  &__layout {
    display: flex;
    flex-direction: column;
    gap: $gap-6;
    @container (min-width: 560px) {
      flex-direction: row;
      align-items: center;
    }
  }
  &__img {
    width: 160px;
    height: 160px;
    flex-shrink: 0;
    object-fit: contain;
    @container (min-width: 560px) {
      width: 220px;
      height: 220px;
    }
  }
  &__body {
    display: grid;
    gap: $gap-3;
    min-width: 0;
  }
  &__eyebrow {
    color: $salmon-lt;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  &__name {
    color: $white;
    font-size: 28px;
    line-height: 1.15;
    text-transform: capitalize;
  }
  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $gap-2;
  }
  &__tag,
  &__status {
    padding: $gap-1 $gap-2;
    border-radius: 7px;
    font-size: 13px;
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
    gap: $gap-2;
    div {
      display: grid;
      grid-template-columns: 80px 1fr;
      gap: $gap-3;
    }
    dt {
      color: $grey-4;
      font-size: 13px;
      margin: 0;
    }
    dd {
      font-size: 15px;
      overflow-wrap: anywhere;
    }
  }
  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $gap-4;
    margin-top: $gap-2;
  }
  &__shuffle {
    display: inline-flex;
    align-items: center;
    gap: $gap-2;
    padding: $gap-2 $gap-4;
    border: 0;
    border-radius: 999px;
    background: $salmon;
    color: $white;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    span {
      color: inherit;
    }
    &:hover {
      background: $salmon-dk;
    }
    &:focus-visible {
      outline: none;
      box-shadow: $focus-shadow;
    }
  }
  &__link {
    color: $salmon-lt;
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
  &__empty {
    display: grid;
    justify-items: start;
    gap: $gap-4;
  }
}
</style>
