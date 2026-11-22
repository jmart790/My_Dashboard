<script>
import { mapGetters } from "vuex";
import { fetchYearsAgo } from "@/features/sources";

// 100 Years Ago Today: a real front page from the Library of Congress archive,
// from the reader's state when one survives.
export default {
  name: "YearsAgo",
  data() {
    return { page: undefined, failed: false };
  },
  computed: {
    ...mapGetters("location", ["location"]),
    ...mapGetters("edition", ["edition"]),
    key: ({ edition, location }) => `${edition.date}|${location.region}`,
    when: ({ page }) =>
      page &&
      new Date(`${page.date}T12:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      })
  },
  watch: {
    key: {
      immediate: true,
      async handler() {
        this.page = undefined;
        this.failed = false;
        try {
          this.page = await fetchYearsAgo(this.edition.date, this.location.region);
        } catch {
          this.failed = true;
        }
      }
    }
  }
};
</script>

<template>
  <section class="years-ago">
    <h2 class="kicker">
      100 Years Ago Today
    </h2>
    <a
      v-if="page"
      class="years-ago__clipping"
      :href="page.link"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        class="years-ago__scan"
        :src="page.image"
        :alt="`Front page of the ${page.paper}, ${when}`"
        loading="lazy"
      />
    </a>
    <template v-if="page">
      <p class="years-ago__paper">
        {{ page.paper }}
      </p>
      <p class="years-ago__fine">
        {{ when }}<template v-if="!page.local">
          &middot; no {{ location.region }} paper survives from that day
        </template>
      </p>
    </template>
    <p v-else class="front-note">
      {{ failed ? "The archive room is locked today." : page === null ? "No papers survive from that day." : "Fetching it from the archive…" }}
    </p>
  </section>
</template>

<style lang="scss">
.years-ago {
  // a clipping pasted in at a slight angle, with a torn-paper shadow
  &__clipping {
    display: block;
    margin: $gap-1 $gap-2 $gap-3;
    transform: rotate(-1.2deg);
    box-shadow: 3px 4px 0 rgba(22, 21, 20, 0.18);
    border: 1px solid $ink-muted;
    background: #e8e0cc;
    transition: transform 0.2s;
    &:hover,
    &:focus-visible {
      transform: rotate(0deg) scale(1.02);
    }
  }
  &__scan {
    display: block;
    width: 100%;
    height: 280px;
    object-fit: cover;
    object-position: top;
    filter: sepia(0.35) contrast(1.05);
  }
  &__paper {
    font-family: $heading-font;
    font-size: 16px;
    font-weight: 700;
    text-transform: capitalize;
  }
  &__fine {
    font-size: 13px;
    font-style: italic;
    color: $ink-muted;
  }
}
</style>
