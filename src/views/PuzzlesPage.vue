<script>
import { mapGetters, mapActions } from "vuex";
import PageHeader from "@/components/base/PageHeader.vue";
import CrosswordPuzzle from "@/components/puzzles/CrosswordPuzzle.vue";
import WordJumble from "@/components/puzzles/WordJumble.vue";
import SudokuPuzzle from "@/components/puzzles/SudokuPuzzle.vue";
import HeadlineQuiz from "@/components/puzzles/HeadlineQuiz.vue";
import { buildDailyPuzzles } from "@/puzzles";
import { loadDay, saveDay } from "@/puzzles/progress";

const emptyProgress = () => ({ crossword: {}, jumble: {}, sudoku: { level: "easy", easy: {}, hard: {} }, quiz: {} });

// Puzzles & Games: built from today's headlines the first time the page opens each
// day, then frozen with the reader's progress so a reload picks up where they were.
export default {
  name: "PuzzlesPage",
  components: { PageHeader, CrosswordPuzzle, WordJumble, SudokuPuzzle, HeadlineQuiz },
  data() {
    return { day: null };
  },
  computed: {
    ...mapGetters("location", ["cityState", "location"]),
    ...mapGetters("edition", ["edition"]),
    ...mapGetters("news", { news: "news", newsLoading: "isLoading" }),
    newsBusy: ({ newsLoading }) => newsLoading.local || newsLoading.state || newsLoading.country,
    dateLine: ({ edition }) =>
      new Date(`${edition.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  },
  watch: {
    "edition.date": "prepare"
  },
  mounted() {
    this.prepare();
  },
  methods: {
    ...mapActions("news", ["loadEdition"]),
    async prepare() {
      const date = this.edition.date;
      const saved = loadDay(date);
      if (saved) {
        this.day = saved;
        return;
      }
      this.day = null;
      // build from today's news if it comes; a slow news day falls back to stock words
      await this.loadEdition(this.location).catch(() => {});
      if (this.edition.date !== date) return;
      const { local, state, country } = this.news;
      this.day = { day: date, puzzles: buildDailyPuzzles([...local, ...state, ...country], date), progress: emptyProgress() };
      saveDay(this.day);
    },
    update(part, value) {
      this.day.progress[part] = value;
      saveDay(this.day);
    }
  }
};
</script>

<template>
  <div class="puzzles-page">
    <PageHeader title="Puzzles &amp; Games" :subtitle="dateLine" />
    <p v-if="!day" class="front-note puzzles-page__wait">
      {{ newsBusy ? "Waiting on the wire for today's words…" : "Setting the puzzles…" }}
    </p>
    <div v-else class="puzzles-page__columns">
      <section class="puzzles-page__col">
        <h2 class="kicker">
          The Headline Crossword
        </h2>
        <CrosswordPuzzle
          :puzzle="day.puzzles.crossword"
          :progress="day.progress.crossword"
          @update="update('crossword', $event)"
        />
      </section>
      <section class="puzzles-page__col">
        <h2 class="kicker">
          Jumble
        </h2>
        <WordJumble
          v-if="day.puzzles.jumble"
          :puzzle="day.puzzles.jumble"
          :progress="day.progress.jumble"
          @update="update('jumble', $event)"
        />
      </section>
      <section class="puzzles-page__col">
        <h2 class="kicker">
          Sudoku
        </h2>
        <SudokuPuzzle
          :puzzles="day.puzzles.sudoku"
          :progress="day.progress.sudoku"
          @update="update('sudoku', $event)"
        />
      </section>
      <section class="puzzles-page__col">
        <h2 class="kicker">
          The Headline Quiz
        </h2>
        <HeadlineQuiz
          :questions="day.puzzles.quiz"
          :progress="day.progress.quiz"
          @update="update('quiz', $event)"
        />
      </section>
    </div>
  </div>
</template>

<style lang="scss">
.puzzles-page {
  &__wait {
    margin-top: $gap-6;
  }
  &__columns {
    display: grid;
    gap: $gap-8;
    margin-top: $gap-4;
    @media screen and (min-width: $laptop) {
      grid-template-columns: 3fr 2fr;
      gap: $gap-8 0;
    }
  }
  &__col {
    min-width: 0;
    @media screen and (min-width: $laptop) {
      &:nth-child(odd) {
        padding-right: $gap-6;
      }
      &:nth-child(even) {
        padding-left: $gap-6;
        border-left: 1px solid $ink;
      }
    }
  }
  .kicker {
    margin-bottom: $gap-3;
  }
}
// shared by the puzzle components
.puzzle-actions {
  display: flex;
  flex-wrap: wrap;
  gap: $gap-2;
  margin-top: $gap-3;
}
.puzzle-done {
  margin-top: $gap-3;
  font-family: $heading-font;
  font-weight: 700;
  font-style: italic;
  color: $spot;
}
</style>
