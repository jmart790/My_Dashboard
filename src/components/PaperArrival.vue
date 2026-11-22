<script>
import { mapGetters } from "vuex";

const SEEN_KEY = "myDashboard.edition.seen";

function read() {
  try {
    return localStorage.getItem(SEEN_KEY);
  } catch {
    return null;
  }
}
function write(id) {
  try {
    localStorage.setItem(SEEN_KEY, id);
  } catch {
    // storage blocked: it just plays again next visit
  }
}

// The paper lands: on the first visit to each new edition a rolled paper drops in,
// unfolds to the nameplate, and lifts away. Any tap or key skips it.
export default {
  name: "PaperArrival",
  data() {
    return { playing: false };
  },
  computed: {
    ...mapGetters("edition", ["edition"])
  },
  watch: {
    // a new edition can come out while the site is open (5 AM, 4 PM)
    "edition.id": {
      immediate: true,
      handler(id) {
        if (read() === id) return;
        write(id);
        const still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!still) this.play();
      }
    }
  },
  beforeUnmount() {
    this.stop();
  },
  methods: {
    play() {
      this.playing = true;
      window.addEventListener("keydown", this.stop);
      this.timer = setTimeout(this.stop, 1700);
    },
    stop() {
      clearTimeout(this.timer);
      window.removeEventListener("keydown", this.stop);
      this.playing = false;
    }
  }
};
</script>

<template>
  <transition name="arrival-fade">
    <div
      v-if="playing"
      class="arrival"
      aria-hidden="true"
      @click="stop"
    >
      <div class="arrival__roll" />
      <div class="arrival__sheet">
        <span class="arrival__ears">{{ edition.name }}</span>
        <span class="arrival__nameplate">The iHerald</span>
        <span class="arrival__rule" />
      </div>
    </div>
  </transition>
</template>

<style lang="scss">
.arrival {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background: rgba(22, 21, 20, 0.35);
  cursor: pointer;
  perspective: 1200px;
  > * {
    grid-area: 1 / 1;
  }
  // the rolled paper with its red band, thrown in from above
  &__roll {
    width: min(260px, 60vw);
    height: 58px;
    border-radius: 29px;
    background:
      linear-gradient(90deg, transparent 46%, $spot 46%, $spot 54%, transparent 54%),
      linear-gradient(180deg, #c9bfa9, $paper 30%, #fbf8f0 45%, $paper-dark 75%, #a89d86);
    box-shadow: 0 14px 22px rgba(22, 21, 20, 0.35);
    animation: arrival-throw 0.55s cubic-bezier(0.3, 1.35, 0.6, 1) both, arrival-roll-out 0.25s ease-in 0.55s forwards;
  }
  // then it opens flat to the front page
  &__sheet {
    display: grid;
    justify-items: center;
    gap: 6px;
    width: min(560px, 88vw);
    padding: 22px 28px 26px;
    background-color: $paper;
    background-image: var(--paper-texture);
    box-shadow: 0 20px 50px rgba(22, 21, 20, 0.4);
    transform-origin: center top;
    animation: arrival-unfold 0.6s cubic-bezier(0.2, 0.8, 0.3, 1) 0.6s both;
  }
  &__ears {
    font-family: $heading-font;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  &__nameplate {
    font-family: $masthead-font;
    font-size: clamp(44px, 10vw, 84px);
    line-height: 1.05;
  }
  &__rule {
    width: 100%;
    border-bottom: 3px double $ink;
  }
}
.arrival-fade-leave-active {
  transition: opacity 0.35s ease;
}
.arrival-fade-leave-to {
  opacity: 0;
}
@keyframes arrival-throw {
  from {
    transform: translateY(-70vh) rotate(-28deg);
  }
  to {
    transform: none;
  }
}
@keyframes arrival-roll-out {
  to {
    transform: scaleX(0.7);
    opacity: 0;
  }
}
@keyframes arrival-unfold {
  from {
    transform: rotateX(82deg) scaleY(0.15);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  to {
    transform: none;
  }
}
</style>
