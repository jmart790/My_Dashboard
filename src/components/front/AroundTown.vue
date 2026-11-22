<script>
import { mapGetters } from "vuex";
import { fetchNearby, pickAround } from "@/features/sources";

// Three local landmarks a day, from Wikipedia's nearby search.
export default {
  name: "AroundTown",
  data() {
    return { places: null, failed: false };
  },
  computed: {
    ...mapGetters("location", ["location"]),
    ...mapGetters("edition", ["edition"]),
    picks: ({ places, edition }) => (places ? pickAround(places, edition.date) : []),
    placeKey: ({ location }) => `${location.lat},${location.lon}`
  },
  watch: {
    placeKey: {
      immediate: true,
      async handler() {
        const { lat, lon } = this.location;
        this.places = null;
        this.failed = false;
        if (lat === "" || lat == null) return;
        try {
          this.places = await fetchNearby({ lat, lon });
        } catch {
          this.failed = true;
        }
      }
    }
  }
};
</script>

<template>
  <section class="around">
    <h2 class="kicker">
      Around Town
    </h2>
    <ul v-if="picks.length" class="around__list">
      <li v-for="place in picks" :key="place.id" class="around__item">
        <img
          v-if="place.thumb"
          class="around__thumb"
          :src="place.thumb"
          alt=""
          loading="lazy"
        />
        <div>
          <a
            class="around__title"
            :href="place.link"
            target="_blank"
            rel="noopener noreferrer"
          >{{ place.title }}</a>
          <p class="around__extract">
            {{ place.extract }}
          </p>
        </div>
      </li>
    </ul>
    <p v-else class="front-note">
      {{ failed ? "Our town correspondent is out today." : places ? "Nothing of note nearby." : "Setting type…" }}
    </p>
  </section>
</template>

<style lang="scss">
.around {
  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  &__item {
    display: grid;
    grid-template-columns: 72px 1fr;
    gap: $gap-3;
    padding: $gap-2 0;
    border-bottom: 1px solid $rule-soft;
    &:first-child {
      padding-top: 0;
    }
    &:last-child {
      border-bottom: 0;
    }
    > div:only-child {
      grid-column: 1 / -1;
    }
  }
  &__thumb {
    width: 72px;
    height: 72px;
    object-fit: cover;
    border: 1px solid $ink;
    filter: grayscale(1) contrast(1.1) sepia(0.15);
  }
  &__title {
    font-family: $heading-font;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.2;
    color: $ink;
    &:hover {
      color: $spot;
    }
  }
  &__extract {
    margin-top: 2px;
    font-size: 13px;
    line-height: 1.45;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }
}
</style>
