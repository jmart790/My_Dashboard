<script>
import { mapActions, mapGetters } from "vuex";
import PaperArrival from "@/components/PaperArrival.vue";
import ExtraBanner from "@/components/ExtraBanner.vue";

const SECTIONS = [
  { name: "Home", label: "Front Page" },
  { name: "Weather", label: "Weather" },
  { name: "News", label: "News" },
  { name: "Food", label: "Dining" },
  { name: "Media", label: "Media" },
  { name: "Puzzles", label: "Puzzles" }
];

function toRoman(n) {
  const numerals = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];
  let out = "";
  for (const [value, numeral] of numerals) {
    while (n >= value) {
      out += numeral;
      n -= value;
    }
  }
  return out;
}

export default {
  name: "AppLayout",
  components: { PaperArrival, ExtraBanner },
  data() {
    return { sections: SECTIONS };
  },
  computed: {
    ...mapGetters("location", ["cityState"]),
    ...mapGetters("edition", ["edition", "age"]),
    // the paper's date: before 5 AM that's still yesterday's evening paper
    today: ({ edition }) => new Date(`${edition.date}T12:00:00`),
    // the edition is the date: volume = the year, issue = the day of the year
    volume: ({ today }) => toRoman(today.getFullYear()),
    issue: ({ today }) =>
      Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000),
    dateLine: ({ today }) =>
      today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      })
  },
  watch: {
    // phones: the section bar scrolls sideways; keep the current section in view
    $route: {
      immediate: true,
      handler() {
        this.$nextTick(() => {
          const nav = this.$refs.nav;
          const active = nav && nav.querySelector(".router-link-exact-active");
          if (!active || nav.scrollWidth <= nav.clientWidth) return;
          nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
        });
      }
    }
  },
  // saved location if there is one, else the device's, else a default zip
  created() {
    this.init();
  },
  mounted() {
    this.clock = setInterval(() => this.tick(), 60 * 1000);
  },
  beforeUnmount() {
    clearInterval(this.clock);
  },
  methods: {
    ...mapActions("location", ["init"]),
    tick() {
      this.$store.commit("edition/TICK");
    }
  }
};
</script>

<template>
  <div class="app-layout" :style="{ '--age': age.toFixed(2) }">
    <header class="masthead">
      <div class="masthead__inner">
        <div class="masthead__ears">
          <span class="masthead__edition">Vol. {{ volume }} · No. {{ issue }}</span>
          <time class="masthead__date" :datetime="edition.date">
            {{ dateLine }} <span class="masthead__edition-name">&middot; {{ edition.name }}</span>
          </time>
          <span class="masthead__place">{{ cityState }}</span>
        </div>
        <router-link class="masthead__nameplate" :to="{ name: 'Home' }">
          The iHerald
        </router-link>
        <nav ref="nav" class="masthead__nav" aria-label="Sections">
          <router-link
            v-for="section in sections"
            :key="section.name"
            class="masthead__link"
            :to="{ name: section.name }"
          >
            {{ section.label }}
          </router-link>
        </nav>
      </div>
    </header>
    <ExtraBanner />
    <main>
      <slot />
    </main>
    <PaperArrival />
  </div>
</template>

<style lang="scss">
.app-layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $paper;
  background-image: var(--paper-texture);
  // the paper yellows through the day: --age runs 0 at 5 AM to 1 late at night
  --paper-tint: linear-gradient(rgba(176, 128, 48, calc(var(--age, 0) * 0.14)), rgba(176, 128, 48, calc(var(--age, 0) * 0.14)));
  // newsprint, all SVG noise so nothing to download. Top to bottom:
  // edges darkened like a handled page, fine grain, stretched fibers, and broad
  // uneven toning (on a big tile so the repeat isn't noticeable). Keep each
  // tile size × baseFrequency a whole number, or stitching leaves a seam, and keep
  // the toning alpha unclipped, or blotches get hard edges that read as creases
  --paper-texture:
    var(--paper-tint),
    radial-gradient(ellipse at center, transparent 55%, rgba(92, 70, 38, 0.13) 100%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.09 0 0 0 0 0.08 0 0 0 0 0.06 0 0 0 0.11 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.025 .9' numOctaves='2' seed='4' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.25 0 0 0 0 0.2 0 0 0 0 0.12 0 0 0 1.2 -0.72'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1000' height='1000'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.004' numOctaves='3' seed='9' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.34 0 0 0 0 0.16 0 0 0 0.32 -0.06'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23m)'/%3E%3C/svg%3E");
}

.masthead {
  flex: none;
  padding: $gap-3 $gap-4 0;
  @media screen and (min-width: $tablet) {
    padding: $gap-4 $gap-5 0;
  }
  &__inner {
    max-width: 1620px;
    margin: 0 auto;
    // the heavy double rule that closes a classic masthead
    border-bottom: 3px double $ink;
  }
  &__ears {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: $gap-1 $gap-4;
    padding-bottom: $gap-2;
    border-bottom: 1px solid $ink;
    span,
    time {
      font-family: $heading-font;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      @media screen and (min-width: $tablet) {
        font-size: 12px;
      }
    }
  }
  // phones: the date takes its own centered line
  &__date {
    order: -1;
    flex-basis: 100%;
    text-align: center;
    @media screen and (min-width: $tablet) {
      order: 0;
      flex-basis: auto;
    }
  }
  &__nameplate {
    display: block;
    padding: $gap-2 0 $gap-1;
    text-align: center;
    text-decoration: none;
    font-family: $masthead-font;
    font-size: clamp(44px, 9vw, 96px);
    line-height: 1.05;
    color: $ink;
  }
  &__nav {
    position: relative; // offsetLeft of links is measured against the bar
    display: flex;
    justify-content: center;
    gap: $gap-1;
    padding: $gap-1 0;
    border-top: 1px solid $ink;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
    @media screen and (max-width: 499px) {
      justify-content: flex-start;
    }
  }
  &__link {
    flex: none;
    padding: $gap-1 $gap-3;
    font-family: $heading-font;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    text-decoration: none;
    color: $ink;
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;
    & + & {
      border-left: 1px solid $rule-soft;
    }
    &:hover {
      color: $spot;
    }
    &:focus-visible {
      outline: none;
      box-shadow: $focus-shadow;
    }
    // the section you're reading: the one touch of red
    &.router-link-exact-active {
      color: $spot;
      text-decoration: underline;
      text-decoration-thickness: 2px;
      text-underline-offset: 5px;
    }
  }
}

main {
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
  overflow-y: auto;
  padding: $gap-4;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  @media screen and (min-width: $tablet) {
    padding: $gap-5;
  }
}
</style>
