<script>
import { mapGetters } from "vuex";
import apiClient from "@/apiClient";
import { extrasFrom } from "@/extra";

const DISMISSED_KEY = "myDashboard.extra.dismissed";
const CHECK_EVERY = 30 * 60 * 1000;

function readDismissed() {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY)) || [];
  } catch {
    return [];
  }
}

// EXTRA! Stop-the-presses news between editions. Weather warnings are checked right
// away (free); the local wire is rechecked every 30 minutes while the site is open,
// one GNews call each time.
export default {
  name: "ExtraBanner",
  data() {
    return { alerts: [], wire: [], dismissed: readDismissed() };
  },
  computed: {
    ...mapGetters("location", ["location"]),
    ...mapGetters("news", ["news"]),
    extras: ({ alerts, wire, news, dismissed }) =>
      extrasFrom({
        alerts,
        articles: wire,
        editionTitles: news.local.map((a) => a.title),
        dismissed
      }),
    extra: ({ extras }) => extras[0] || null,
    placeKey: ({ location }) => `${location.lat},${location.lon},${location.name}`
  },
  watch: {
    placeKey: {
      immediate: true,
      handler() {
        this.wire = [];
        this.checkWeather();
      }
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.checkWeather();
      this.checkWire();
    }, CHECK_EVERY);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    async checkWeather() {
      const { lat, lon } = this.location;
      if (lat === "" || lat == null) return;
      this.alerts = await apiClient.getAlerts({ lat, lon });
    },
    async checkWire() {
      const { name } = this.location;
      if (!name) return;
      try {
        const { articles } = await apiClient.getNewsByLocation(name, { fresh: true });
        this.wire = articles;
      } catch {
        // wire down or out of quota: no EXTRA this round
      }
    },
    dismiss() {
      this.dismissed = [...this.dismissed, this.extra.id].slice(-50);
      try {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(this.dismissed));
      } catch {
        // storage blocked: it stays hidden for this visit
      }
    }
  }
};
</script>

<template>
  <transition name="extra-drop">
    <aside v-if="extra" class="extra" role="alert">
      <span class="extra__flag">Extra!</span>
      <router-link v-if="extra.kind === 'weather'" class="extra__headline" :to="{ name: 'Weather' }">
        {{ extra.title }}
      </router-link>
      <a
        v-else
        class="extra__headline"
        :href="extra.link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ extra.title }}
      </a>
      <span v-if="extras.length > 1" class="extra__more">+{{ extras.length - 1 }} more</span>
      <button
        class="extra__close"
        type="button"
        aria-label="Dismiss this extra"
        @click="dismiss"
      >
        &times;
      </button>
    </aside>
  </transition>
</template>

<style lang="scss">
.extra {
  display: flex;
  align-items: center;
  gap: $gap-3;
  max-width: 1620px;
  margin: $gap-2 auto 0;
  padding: $gap-2 $gap-3;
  background: $spot;
  @media screen and (min-width: $tablet) {
    width: calc(100% - 2 * #{$gap-5});
  }
  @media screen and (max-width: $tablet - 1) {
    margin: $gap-2 $gap-4 0;
  }
  * {
    color: $paper;
  }
  &__flag {
    flex: none;
    font-family: $masthead-font;
    font-size: 26px;
    line-height: 1;
  }
  &__headline {
    flex: 1;
    min-width: 0;
    font-family: $heading-font;
    font-size: 15px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    &:hover {
      text-decoration: underline;
    }
  }
  &__more {
    flex: none;
    font-size: 12px;
    font-style: italic;
  }
  &__close {
    flex: none;
    width: 28px;
    height: 28px;
    border: 1px solid rgba($paper, 0.6);
    border-radius: 50%;
    background: transparent;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    &:hover,
    &:focus-visible {
      background: $paper;
      color: $spot;
      outline: none;
    }
  }
}
.extra-drop-enter-active {
  transition: transform 0.35s cubic-bezier(0.3, 1.4, 0.6, 1), opacity 0.2s;
}
.extra-drop-enter-from {
  transform: translateY(-12px);
  opacity: 0;
}
</style>
