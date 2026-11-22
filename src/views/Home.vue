<script>
import { mapGetters, mapActions } from "vuex";
import PageHeader from "@/components/base/PageHeader.vue";
import JumpLine from "@/components/front/JumpLine.vue";
import WeatherBrief from "@/components/front/WeatherBrief.vue";
import DiningBrief from "@/components/front/DiningBrief.vue";
import ArtsBrief from "@/components/front/ArtsBrief.vue";
import AlmanacBox from "@/components/front/AlmanacBox.vue";
import AroundTown from "@/components/front/AroundTown.vue";
import YearsAgo from "@/components/front/YearsAgo.vue";

const SECTION_LABELS = { local: "Local", state: "State", country: "Nation" };

// The Front Page: a lead story above the fold, then a brief from every other page.
// It loads through the same stores and caches those pages use, so it costs almost
// no extra requests and the pages agree with it (same forecast, same dining pick).
export default {
  name: "Home",
  components: { PageHeader, JumpLine, WeatherBrief, DiningBrief, ArtsBrief, AlmanacBox, AroundTown, YearsAgo },
  computed: {
    ...mapGetters("location", ["cityState", "location"]),
    ...mapGetters("edition", ["edition"]),
    ...mapGetters("news", { news: "news", newsLoading: "isLoading", newsError: "error" }),
    // every story, local first, each tagged with its section
    stories: ({ news }) =>
      ["local", "state", "country"].flatMap((key) =>
        news[key].map((article) => ({ ...article, section: SECTION_LABELS[key] }))
      ),
    lead: ({ stories }) => stories.find((s) => s.media) || stories[0] || null,
    // the next headlines: two local, then state and nation, never repeating the lead
    briefs({ stories, lead }) {
      const rest = stories.filter((s) => s !== lead && s.title !== (lead && lead.title));
      const take = (section, n) => rest.filter((s) => s.section === section).slice(0, n);
      return [...take("Local", 2), ...take("State", 2), ...take("Nation", 2)];
    },
    newsBusy: ({ newsLoading }) => newsLoading.local || newsLoading.state || newsLoading.country,
    newsFailed: ({ newsError }) => newsError.local && newsError.state && newsError.country
  },
  watch: {
    location: {
      deep: true,
      handler() {
        this.load();
      }
    },
    // the evening paper comes out while the page is open
    "edition.id"() {
      this.loadEdition(this.location);
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    ...mapActions("weather", ["getWeather"]),
    ...mapActions("news", ["loadEdition"]),
    ...mapActions("restaurants", ["getRestaurants"]),
    load() {
      const { name, region, country, lat, lon } = this.location;
      if (!name) return;
      this.getWeather({ lat, lon });
      this.getRestaurants({ lat, lon });
      this.loadEdition({ name, region, country });
    }
  }
};
</script>

<template>
  <div class="front">
    <PageHeader title="The Front Page" :subtitle="cityState" />

    <div class="front__fold">
      <article class="front__lead">
        <template v-if="lead">
          <p class="front__label">
            {{ lead.section }} &middot; {{ lead.clean_url }}
          </p>
          <h2 class="front__headline">
            <a :href="lead.link" target="_blank" rel="noopener noreferrer">{{ lead.title }}</a>
          </h2>
          <div class="front__lead-body">
            <img
              v-if="lead.media"
              class="front__lead-photo"
              :src="lead.media"
              alt=""
              @error="$event.target.style.display = 'none'"
            />
            <p class="front__deck">
              {{ lead.summary }}
            </p>
          </div>
        </template>
        <p v-else class="front-note">
          {{ newsBusy ? "Setting type…" : "No dispatches came over the wire this morning." }}
        </p>
      </article>
      <WeatherBrief class="front__col front__weather" />
    </div>

    <div class="front__columns">
      <section class="front__col">
        <h2 class="kicker">
          In the News
        </h2>
        <ul v-if="briefs.length" class="front__briefs">
          <li v-for="story in briefs" :key="story._id">
            <span class="front__label">{{ story.section }}</span>
            <a :href="story.link" target="_blank" rel="noopener noreferrer">{{ story.title }}</a>
          </li>
        </ul>
        <p v-else class="front-note">
          {{ newsBusy ? "Setting type…" : newsFailed ? "The wire is down." : "No further dispatches." }}
        </p>
        <JumpLine to="News" section="News" :page="3" />
      </section>
      <DiningBrief class="front__col" />
      <ArtsBrief class="front__col" />
    </div>

    <!-- below the briefs: the features a real local paper ran every day -->
    <div class="front__columns front__band">
      <AlmanacBox class="front__col" />
      <AroundTown class="front__col" />
      <YearsAgo class="front__col" />
    </div>
  </div>
</template>

<style lang="scss">
// shared by the briefs: what a column says while it loads or when it has nothing
.front-note {
  font-family: $heading-font;
  font-style: italic;
  color: $ink-muted;
}

.front {
  // above the fold: the lead story beside the weather box
  &__fold {
    display: grid;
    gap: $gap-8;
    margin-top: $gap-4;
    padding-bottom: $gap-8;
    border-bottom: 3px double $ink;
    @media screen and (min-width: $tablet) {
      grid-template-columns: 2fr 1fr;
      gap: 0;
    }
  }
  &__lead {
    min-width: 0;
    @media screen and (min-width: $tablet) {
      padding-right: $gap-6;
    }
  }
  &__label {
    font-family: $heading-font;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $ink-muted;
  }
  &__headline {
    margin: $gap-1 0 $gap-4;
    font-size: clamp(28px, 4vw, 52px);
    line-height: 1.08;
    letter-spacing: -0.01em;
    a {
      color: $ink;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
        text-decoration-thickness: 2px;
      }
    }
  }
  &__lead-body {
    display: grid;
    gap: $gap-4;
    @media screen and (min-width: $laptop) {
      grid-template-columns: 1.3fr 1fr;
      align-items: start;
    }
  }
  &__lead-photo {
    width: 100%;
    aspect-ratio: 16 / 10;
    object-fit: cover;
    border: 1px solid $ink;
  }
  // the deck: the summary under a headline, with a drop cap
  &__deck {
    font-size: 17px;
    line-height: 1.6;
    &::first-letter {
      float: left;
      margin: 4px $gap-2 0 0;
      font-family: $heading-font;
      font-size: 3.4em;
      font-weight: 700;
      line-height: 0.8;
    }
  }
  &__col {
    min-width: 0;
  }
  &__weather {
    @media screen and (min-width: $tablet) {
      padding-left: $gap-6;
      border-left: 1px solid $ink;
    }
  }
  &__columns {
    display: grid;
    gap: $gap-8;
    margin-top: $gap-6;
    @media screen and (min-width: $tablet) {
      grid-template-columns: 1fr 1fr;
      gap: 0;
    }
    @media screen and (min-width: $laptop) {
      grid-template-columns: 1fr 1fr 1fr;
    }
    > .front__col {
      @media screen and (min-width: $tablet) {
        padding: 0 $gap-5;
        & + .front__col {
          border-left: 1px solid $ink;
        }
        &:first-child {
          padding-left: 0;
        }
        &:last-child {
          padding-right: 0;
        }
      }
      // tablet: Arts runs across under News and Dining
      &:last-child {
        @media screen and (min-width: $tablet) and (max-width: $laptop - 1) {
          grid-column: 1 / -1;
          margin-top: $gap-8;
          padding: $gap-6 0 0;
          border-left: 0;
          border-top: 1px solid $ink;
        }
      }
    }
  }
  &__band {
    margin-top: $gap-8;
    padding-top: $gap-6;
    border-top: 3px double $ink;
  }
  &__briefs {
    margin: 0;
    padding: 0;
    list-style: none;
    li {
      padding: $gap-2 0;
      border-bottom: 1px solid $rule-soft;
      &:first-child {
        padding-top: 0;
      }
      &:last-child {
        border-bottom: 0;
      }
    }
    a {
      display: block;
      margin-top: 2px;
      font-family: $heading-font;
      font-size: 17px;
      font-weight: 700;
      line-height: 1.25;
      color: $ink;
      text-decoration: none;
      &:hover {
        color: $spot;
      }
    }
  }
}
</style>
