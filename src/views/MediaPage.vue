<script>
import { mapGetters } from "vuex";
import PageHeader from "@/components/base/PageHeader.vue";
import MediaSection from "@/components/media/MediaSection.vue";
import TvListings from "@/components/media/TvListings.vue";
import ChartList from "@/components/media/ChartList.vue";
import BookReview from "@/components/media/BookReview.vue";
import LocalSports from "@/components/media/LocalSports.vue";
import { fetchTv, fetchMovies, fetchSongs, fetchAlbums, fetchBooks, fetchLocalSports } from "@/media/sources";

// Arts & Entertainment, laid out as broadsheet columns:
// movies and books; local sports and tonight's TV; the music charts.
export default {
  name: "MediaPage",
  components: { PageHeader, MediaSection, TvListings, ChartList, BookReview, LocalSports },
  computed: {
    ...mapGetters("location", ["cityState", "location"]),
    timeZone: ({ location }) => location.timezone,
    hasPlace: ({ location }) => location.lat !== "" && location.lat != null,
    placeKey: ({ location }) => `${location.lat},${location.lon}`
  },
  methods: {
    fetchMovies,
    fetchSongs,
    fetchAlbums,
    fetchBooks,
    loadTv() {
      return fetchTv(this.timeZone);
    },
    loadSports() {
      return fetchLocalSports(this.location);
    }
  }
};
</script>

<template>
  <div class="media-page">
    <PageHeader title="Arts &amp; Entertainment" :subtitle="cityState" />
    <div class="media-page__columns">
      <div class="media-page__col">
        <MediaSection kicker="At the Movies" :load="fetchMovies">
          <template #default="{ data }">
            <ChartList :items="data" kind="movie" link-label="See it on Apple TV" />
          </template>
        </MediaSection>
        <MediaSection kicker="Book Review · Trending Today" :load="fetchBooks">
          <template #default="{ data }">
            <BookReview :books="data" />
          </template>
        </MediaSection>
      </div>
      <div class="media-page__col">
        <MediaSection
          v-if="hasPlace"
          kicker="Local Sports"
          :load="loadSports"
          :reload-key="placeKey"
        >
          <template #default="{ data }">
            <LocalSports :sports="data" :time-zone="timeZone" />
          </template>
        </MediaSection>
        <MediaSection kicker="Tonight's Top 10 on TV" :load="loadTv" :reload-key="timeZone || ''">
          <template #default="{ data }">
            <TvListings :shows="data" />
          </template>
        </MediaSection>
      </div>
      <div class="media-page__col media-page__col--charts">
        <MediaSection kicker="The Charts · Top Songs" :load="fetchSongs">
          <template #default="{ data }">
            <ChartList :items="data" kind="song" />
          </template>
        </MediaSection>
        <MediaSection kicker="The Charts · Top Albums" :load="fetchAlbums">
          <template #default="{ data }">
            <ChartList :items="data" />
          </template>
        </MediaSection>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.media-page {
  &__columns {
    display: grid;
    gap: $gap-8;
    margin-top: $gap-4;
    @media screen and (min-width: $tablet) {
      grid-template-columns: 1fr 1fr;
      gap: 0;
    }
    @media screen and (min-width: $laptop) {
      grid-template-columns: 1fr 1fr 1fr;
    }
  }
  &__col {
    display: flex;
    flex-direction: column;
    gap: $gap-8;
    min-width: 0;
    @media screen and (min-width: $tablet) {
      padding: 0 $gap-5;
      // column rules, as on a printed page
      & + & {
        border-left: 1px solid $ink;
      }
      &:first-child {
        padding-left: 0;
      }
      &:last-child {
        padding-right: 0;
      }
    }
    // tablet: the two charts run across under the first two columns, side by side
    &--charts {
      @media screen and (min-width: $tablet) and (max-width: $laptop - 1) {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: $gap-5;
        margin-top: $gap-8;
        padding: $gap-6 0 0;
        border-top: 1px solid $ink;
        &.media-page__col {
          border-left: 0; // beats the column rule's specificity
        }
      }
    }
  }
}
</style>
