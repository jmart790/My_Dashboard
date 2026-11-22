<script>
// A numbered chart (movies, songs or albums) whose rows open in place.
export default {
  name: "ChartList",
  props: {
    items: { type: Array, required: true },
    // "movie" shows a poster and blurb; "song" adds a 30-second preview
    kind: { type: String, default: "album" },
    linkLabel: { type: String, default: "Open in Apple Music" }
  }
};
</script>

<template>
  <ol class="chart">
    <li v-for="item in items" :key="item.id">
      <details class="m-item">
        <summary>
          <span class="m-item__rank">{{ item.rank }}</span>
          <img
            v-if="item.image"
            :src="item.image"
            alt=""
            loading="lazy"
            class="m-item__thumb"
            :class="{ 'chart__thumb--poster': kind === 'movie' }"
          />
          <span class="m-item__text">
            <span class="m-item__title">{{ item.title }}</span>
            <span class="m-item__meta">{{ item.artist }}</span>
          </span>
        </summary>
        <div class="m-item__body">
          <p v-if="kind === 'movie' && item.summary" class="chart__summary">
            {{ item.summary }}
          </p>
          <audio
            v-if="kind === 'song' && item.preview"
            :src="item.preview"
            controls
            preload="none"
            class="chart__audio"
          />
          <p class="m-item__meta">
            {{
              [item.genre, item.tracks && `${item.tracks} tracks`, item.released && `Released ${item.released}`]
                .filter(Boolean)
                .join(" · ")
            }}
          </p>
          <a :href="item.url" target="_blank" rel="noopener">{{ linkLabel }}</a>
        </div>
      </details>
    </li>
  </ol>
</template>

<style lang="scss">
.chart {
  margin: 0;
  padding: 0;
  list-style: none;
  > li {
    border-bottom: 1px solid $rule-soft;
    &:last-child {
      border-bottom: 0;
    }
    .m-item {
      border-bottom: 0;
    }
  }
  &__thumb--poster {
    width: 40px;
    height: 60px;
  }
  &__summary {
    display: -webkit-box;
    -webkit-line-clamp: 8;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  &__audio {
    display: block;
    width: 100%;
    height: 32px;
    margin-bottom: $gap-2;
  }
}
</style>
