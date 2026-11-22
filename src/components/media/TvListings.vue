<script>
// Tonight's 10 most popular primetime shows, each opening in place.
export default {
  name: "TvListings",
  props: {
    shows: { type: Array, required: true }
  },
  methods: {
    clock(time) {
      const [h, m] = time.split(":").map(Number);
      return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} PM`;
    }
  }
};
</script>

<template>
  <div class="tv">
    <p v-if="!shows.length" class="m-section__note">
      No primetime listings tonight.
    </p>
    <ol class="chart">
      <li v-for="show in shows" :key="show.id">
        <details class="m-item">
          <summary>
            <span class="m-item__rank">{{ show.rank }}</span>
            <img
              v-if="show.image"
              :src="show.image"
              alt=""
              loading="lazy"
              class="m-item__thumb chart__thumb--poster"
            />
            <span class="m-item__text">
              <span class="m-item__title">{{ show.title }}</span>
              <span class="m-item__meta">{{ [clock(show.time), show.network].filter(Boolean).join(" · ") }}</span>
            </span>
          </summary>
          <div class="m-item__body">
            <p v-if="show.episode || show.code" class="tv__episode">
              {{ [show.code, show.episode].filter(Boolean).join(" · ") }}
            </p>
            <p v-if="show.summary" class="chart__summary">
              {{ show.summary }}
            </p>
            <p class="m-item__meta">
              {{ [show.genres.join(", "), show.runtime && `${show.runtime} min`].filter(Boolean).join(" · ") }}
            </p>
            <a :href="show.url" target="_blank" rel="noopener">About the show on TVMaze</a>
          </div>
        </details>
      </li>
    </ol>
    <p class="tv__footnote">
      Ranked by TVMaze popularity. Times as listed by the networks (Eastern).
    </p>
  </div>
</template>

<style lang="scss">
.tv {
  &__episode {
    font-family: $heading-font;
    font-style: italic;
  }
  &__footnote {
    margin-top: $gap-2;
    font-size: 12px;
    font-style: italic;
    color: $ink-muted;
  }
}
</style>
