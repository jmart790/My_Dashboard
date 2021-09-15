<script>
import { mapGetters, mapActions } from "vuex";
import PageHeader from "@/components/base/PageHeader";
import CountryNews from "@/components/news/CountryNews";
import LocalNews from "@/components/news/LocalNews";
import StateNews from "@/components/news/StateNews";
import SkeletonLocalNews from "@/components/skeletons/SkeletonLocalNews";
import SkeletonStateNews from "@/components/skeletons/SkeletonStateNews";
import SkeletonNationNews from "@/components/skeletons/SkeletonNationNews";
import ErrorCard from "@/components/base/ErrorCard";

export default {
  name: "NewsPage",
  components: {
    PageHeader,
    CountryNews,
    LocalNews,
    StateNews,
    SkeletonLocalNews,
    SkeletonStateNews,
    SkeletonNationNews,
    ErrorCard
  },
  mounted() {
    if (this.location) this.getNews(this.location);
  },
  watch: {
    location: {
      deep: true,
      handler() {
        this.getNews(this.location);
      }
    }
  },
  computed: {
    ...mapGetters("location", {
      locationLoading: "isLoading",
      location: "location",
      cityState: "cityState"
    }),
    ...mapGetters("news", {
      news: "news",
      newsLoading: "isLoading",
      newsError: "error"
    }),
    isLoading() {
      return this.locationLoading || this.newsLoading;
    }
  },
  methods: {
    ...mapActions("news", ["getLocalNews", "getStateNews", "getCountryNews"]),
    async getNews({ name, region, country }) {
      await this.getLocalNews(name);
      await this.getStateNews(region);
      await this.getCountryNews(country);
    }
  }
};
</script>

<template>
  <div class="news">
    <PageHeader class="news__header" title="News" :subtitle="cityState" />

    <SkeletonLocalNews v-if="isLoading" class="news__local" />
    <ErrorCard
      v-else-if="newsError.local || news.local.length <= 0"
      class="news__local"
      category="NEWS"
      :messageOption="1"
      showRefreshBtn
      @request-data="getNews(location)"
    >
      <inline-svg
        :src="require(`@/assets/illustrations/undraw_newspaper.svg`)"
      />
    </ErrorCard>
    <LocalNews v-else label="Local" :news="news.local" class="news__local" />

    <SkeletonNationNews v-if="isLoading" class="news__country" />
    <ErrorCard
      v-else-if="newsError.country || news.country.length <= 0"
      class="news__country"
      category="NEWS"
      :messageOption="2"
      isVertical
    >
      <inline-svg
        :src="require(`@/assets/illustrations/undraw_Sharing_articles.svg`)"
      />
    </ErrorCard>
    <CountryNews
      v-else
      label="National"
      :news="news.country"
      class="news__country"
    />

    <SkeletonStateNews v-if="isLoading" class="news__state" />
    <ErrorCard
      v-else-if="newsError.state || news.state.length <= 0"
      class="news__state"
      category="NEWS"
      :messageOption="3"
      isReverse
    />
    <StateNews v-else label="State" :news="news.state" class="news__state" />
  </div>
</template>


<style lang="scss">
.news {
  min-height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas: "header" "local" "state" "country";
  gap: $gap-4;
  margin-bottom: 80px;
  @media screen and (min-width: $tablet) {
    gap: $gap-6;
  }
  @media screen and (min-width: $laptop) {
    grid-template-columns: 1fr 1fr 400px;
    grid-template-rows: auto repeat(3, 1fr) repeat(3, auto);
    grid-template-areas:
      "header header country"
      "local  local  country"
      "local  local  country"
      "local  local  country"
      "state  state  state"
      "state  state  state"
      "state  state  state";
    gap: $gap-8;
  }
  @media screen and (min-width: $desktop) {
    height: 100%;
    grid-template-areas:
      "header header country"
      "local  local  country"
      "local  local  country"
      "local  local  country"
      "state  state  country"
      "state  state  country"
      "state  state  country";
  }
  &__header {
    grid-area: header;
  }
  &__local {
    grid-area: local;
  }
  &__state {
    grid-area: state;
  }
  &__country {
    grid-area: country;
  }
}
</style>