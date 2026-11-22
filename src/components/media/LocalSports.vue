<script>
import { LOCAL_MILES } from "@/media/teams";

// Recent results and the week ahead for the teams nearest the reader.
export default {
  name: "LocalSports",
  props: {
    sports: { type: Object, required: true }, // { nearby, teams, games }
    timeZone: { type: String, default: null }
  },
  computed: {
    // newest first: the furthest-out game at the top, down to the oldest result
    games: ({ sports }) => [...sports.games].sort((a, b) => b.date.localeCompare(a.date)),
    teamLine: ({ sports }) =>
      sports.nearby
        ? `Pro teams within ${LOCAL_MILES} miles`
        : `Nearest pro teams, ${sports.teams[0].miles} miles away`
  },
  methods: {
    when(game) {
      if (game.state !== "pre") return game.detail; // "Final", "Q3 4:12", "Top 7th"...
      return new Date(game.date).toLocaleString("en-US", {
        timeZone: this.timeZone || undefined,
        weekday: "short",
        hour: "numeric",
        minute: "2-digit"
      });
    },
    // full date for the opened game, e.g. "Sat, Nov 22, 2026 · 7:00 PM"
    fullDate(game) {
      const at = new Date(game.date);
      const zone = { timeZone: this.timeZone || undefined };
      const day = at.toLocaleDateString("en-US", { ...zone, weekday: "short", month: "short", day: "numeric", year: "numeric" });
      const time = at.toLocaleTimeString("en-US", { ...zone, hour: "numeric", minute: "2-digit" });
      return `${day} · ${time}`;
    },
    showScore: (game) => game.state !== "pre" && game.home.score != null
  }
};
</script>

<template>
  <div class="sports">
    <p class="sports__teams">
      {{ teamLine }}
    </p>
    <p v-if="!games.length" class="m-section__note">
      No games for the local teams this week.
    </p>
    <details v-for="game in games" :key="game.id" class="m-item">
      <summary>
        <span class="sports__when">
          <span class="sports__league">{{ game.league }}</span>
          <span :class="{ 'sports__live': game.state === 'in' }">{{ when(game) }}</span>
        </span>
        <span class="m-item__text sports__teamsline">
          <span
            v-for="(team, i) in [game.away, game.home]"
            :key="team.abbr + i"
            class="sports__team"
            :class="{ 'sports__team--local': team.local, 'sports__team--won': team.winner }"
          >
            <img
              v-if="team.logo"
              :src="team.logo"
              alt=""
              loading="lazy"
              class="sports__logo"
            />
            <span class="m-item__title">{{ team.name }}</span>
            <span v-if="showScore(game)" class="sports__score">{{ team.score }}</span>
          </span>
        </span>
      </summary>
      <div class="m-item__body">
        <p>{{ game.away.fullName }} at {{ game.home.fullName }}</p>
        <p class="m-item__meta">
          {{
            [
              game.venue && `${game.venue}${game.city ? `, ${game.city}` : ""}`,
              game.broadcast && `TV: ${game.broadcast}`,
              game.away.record && game.home.record && `Records ${game.away.abbr} ${game.away.record}, ${game.home.abbr} ${game.home.record}`
            ]
              .filter(Boolean)
              .join(" · ")
          }}
        </p>
        <p class="sports__date">
          <time :datetime="game.date">{{ fullDate(game) }}</time>
        </p>
      </div>
    </details>
  </div>
</template>

<style lang="scss">
.sports {
  &__teams {
    margin-bottom: $gap-2;
    font-size: 12px;
    font-style: italic;
    color: $ink-muted;
  }
  &__when {
    flex: none;
    width: 76px;
    font-family: $heading-font;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.3;
  }
  &__league {
    display: block;
    font-size: 10px;
    letter-spacing: 0.12em;
    color: $ink-muted;
  }
  &__date {
    margin-top: $gap-2;
    text-align: right;
    font-family: $heading-font;
    font-size: 12px;
    font-style: italic;
    color: $ink-muted;
  }
  &__live {
    color: $spot;
  }
  &__teamsline {
    flex: 1;
  }
  &__team {
    display: flex;
    align-items: center;
    gap: $gap-2;
    .m-item__title {
      font-weight: 400;
    }
    &--local .m-item__title {
      font-weight: 700;
    }
  }
  &__logo {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
  &__score {
    margin-left: auto;
    font-family: $heading-font;
    font-weight: 400;
    .sports__team--won & {
      font-weight: 700;
    }
  }
}
</style>
