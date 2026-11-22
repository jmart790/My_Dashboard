<script>
import { mapGetters } from "vuex";
import JumpLine from "@/components/front/JumpLine.vue";
import { fetchMovies, fetchSongs, fetchTv, fetchLocalSports } from "@/media/sources";

// One line from each Arts & Entertainment column. The feeds are cached, so a later
// visit to the Media page reuses these answers.
export default {
  name: "ArtsBrief",
  components: { JumpLine },
  data() {
    return { rows: null };
  },
  computed: {
    ...mapGetters("location", ["location"]),
    placeKey: ({ location }) => `${location.lat},${location.lon},${location.timezone}`
  },
  watch: {
    placeKey() {
      this.load();
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    async load() {
      const { timezone, lat } = this.location;
      const [movies, songs, tv, sports] = await Promise.allSettled([
        fetchMovies(),
        fetchSongs(),
        fetchTv(timezone),
        lat !== "" && lat != null ? fetchLocalSports(this.location) : Promise.reject(new Error("no place"))
      ]);
      const first = (result) => (result.status === "fulfilled" ? result.value[0] : null);
      const rows = [];
      const movie = first(movies);
      if (movie) rows.push({ label: "No. 1 at the Movies", title: movie.title, meta: movie.genre });
      const song = first(songs);
      if (song) rows.push({ label: "No. 1 Song", title: song.title, meta: song.artist });
      const show = first(tv);
      if (show) rows.push({ label: "Top on TV Tonight", title: show.title, meta: [this.clock(show.time), show.network].filter(Boolean).join(" · ") });
      const game = sports.status === "fulfilled" && this.headlineGame(sports.value.games);
      if (game) rows.push(game);
      this.rows = rows;
    },
    // the next game still to come (or on now), else the latest result
    headlineGame(games) {
      const next = games.find((g) => g.state !== "post");
      const last = [...games].reverse().find((g) => g.state === "post");
      const game = next || last;
      if (!game) return null;
      const matchup = `${game.away.name} at ${game.home.name}`;
      if (game.state === "post") {
        return { label: `Local Sports · ${game.league}`, title: matchup, meta: `Final, ${game.away.score}–${game.home.score}` };
      }
      const when = game.state === "in"
        ? `Live: ${game.detail}, ${game.away.score}–${game.home.score}`
        : new Date(game.date).toLocaleString("en-US", {
          timeZone: this.location.timezone || undefined,
          weekday: "short",
          hour: "numeric",
          minute: "2-digit"
        });
      return { label: `Local Sports · ${game.league}`, title: matchup, meta: when };
    },
    clock(time) {
      const [h, m] = time.split(":").map(Number);
      return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} PM`;
    }
  }
};
</script>

<template>
  <section class="a-brief">
    <h2 class="kicker">
      Arts &amp; Entertainment
    </h2>
    <p v-if="!rows" class="front-note">
      Setting type&hellip;
    </p>
    <p v-else-if="!rows.length" class="front-note">
      The arts pages didn't make this edition.
    </p>
    <dl v-else class="a-brief__rows">
      <div v-for="row in rows" :key="row.label" class="a-brief__row">
        <dt>{{ row.label }}</dt>
        <dd>
          <strong>{{ row.title }}</strong>
          <span v-if="row.meta">{{ row.meta }}</span>
        </dd>
      </div>
    </dl>
    <JumpLine to="Media" section="Arts & Entertainment" :page="5" />
  </section>
</template>

<style lang="scss">
.a-brief {
  &__rows {
    margin: 0;
  }
  &__row {
    padding: $gap-2 0;
    border-bottom: 1px solid $rule-soft;
    &:first-child {
      padding-top: 0;
    }
    &:last-child {
      border-bottom: 0;
    }
    dt {
      font-family: $heading-font;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: $ink-muted;
    }
    dd {
      margin: 2px 0 0;
      strong {
        display: block;
        font-family: $heading-font;
        font-size: 17px;
        line-height: 1.25;
      }
      span {
        font-size: 13px;
        color: $ink-muted;
      }
    }
  }
}
</style>
