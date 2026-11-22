<script>
// Unscramble four words from today's news; the circled letters then unscramble
// into the bonus word.
export default {
  name: "WordJumble",
  props: {
    puzzle: { type: Object, required: true },
    progress: { type: Object, required: true } // { guesses: string[], bonus: string, revealed: bool }
  },
  emits: ["update"],
  data() {
    return {
      guesses: this.progress.guesses ? [...this.progress.guesses] : this.puzzle.words.map(() => ""),
      bonus: this.progress.bonus || "",
      revealed: !!this.progress.revealed
    };
  },
  computed: {
    solvedWords: ({ puzzle, guesses }) => puzzle.words.map((w, i) => guesses[i] === w.answer),
    bonusSolved: ({ puzzle, bonus }) => bonus === puzzle.bonus.answer,
    // circled letters appear as each word is solved
    circled: ({ puzzle, solvedWords }) =>
      puzzle.words.flatMap((w, i) => w.circles.map((p) => (solvedWords[i] ? w.answer[p] : "?")))
  },
  methods: {
    clean: (text) => text.toUpperCase().replace(/[^A-Z]/g, ""),
    setGuess(i, value) {
      this.guesses[i] = this.clean(value);
      this.save();
    },
    setBonus(value) {
      this.bonus = this.clean(value);
      this.save();
    },
    reveal() {
      this.guesses = this.puzzle.words.map((w) => w.answer);
      this.bonus = this.puzzle.bonus.answer;
      this.revealed = true;
      this.save();
    },
    save() {
      this.$emit("update", { guesses: this.guesses, bonus: this.bonus, revealed: this.revealed });
    }
  }
};
</script>

<template>
  <div class="jumble">
    <p class="jumble__how">
      Unscramble each word from today's news. The circled letters spell the bonus word.
    </p>
    <div v-for="(w, i) in puzzle.words" :key="w.answer" class="jumble__row">
      <span class="jumble__tiles" aria-hidden="true">
        <span v-for="(ch, j) in w.scrambled" :key="j">{{ ch }}</span>
      </span>
      <label class="jumble__answer">
        <span class="sr-only">Unscramble {{ w.scrambled }}</span>
        <span class="jumble__boxes" aria-hidden="true">
          <span
            v-for="(_, j) in w.answer"
            :key="j"
            :class="{ 'is-circled': w.circles.includes(j), 'is-right': solvedWords[i] }"
          >{{ guesses[i][j] || "" }}</span>
        </span>
        <input
          :value="guesses[i]"
          :maxlength="w.answer.length"
          autocomplete="off"
          autocapitalize="characters"
          spellcheck="false"
          @input="setGuess(i, $event.target.value)"
        />
      </label>
    </div>
    <div class="jumble__bonus">
      <p class="jumble__bonus-label">
        Bonus word: <span class="jumble__circled">{{ circled.join(" ") }}</span>
      </p>
      <label class="jumble__answer">
        <span class="sr-only">Bonus word</span>
        <span class="jumble__boxes" aria-hidden="true">
          <span v-for="(_, j) in puzzle.bonus.answer" :key="j" :class="{ 'is-right': bonusSolved }">{{ bonus[j] || "" }}</span>
        </span>
        <input
          :value="bonus"
          :maxlength="puzzle.bonus.answer.length"
          autocomplete="off"
          autocapitalize="characters"
          spellcheck="false"
          @input="setBonus($event.target.value)"
        />
      </label>
    </div>
    <div class="puzzle-actions">
      <button class="chip" type="button" @click="reveal">
        Reveal
      </button>
    </div>
    <p v-if="bonusSolved && solvedWords.every(Boolean)" class="puzzle-done">
      {{ revealed ? "Revealed. Better luck in tomorrow's paper." : "All unscrambled!" }}
    </p>
  </div>
</template>

<style lang="scss">
.jumble {
  &__how {
    font-size: 14px;
    font-style: italic;
    color: $ink-muted;
    margin-bottom: $gap-3;
  }
  &__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $gap-2 $gap-4;
    padding: $gap-2 0;
    border-bottom: 1px solid $rule-soft;
  }
  &__tiles {
    display: flex;
    gap: 3px;
    min-width: 11em;
    span {
      width: 26px;
      height: 26px;
      display: grid;
      place-items: center;
      background: $ink;
      color: $paper;
      font-family: $heading-font;
      font-weight: 700;
      font-size: 15px;
    }
  }
  // the boxes are drawn; a transparent input sits on top and takes the typing
  &__answer {
    position: relative;
    display: inline-block;
    input {
      position: absolute;
      inset: 0;
      opacity: 0;
      font-size: 16px; // keeps iOS from zooming in
      cursor: text;
    }
    &:focus-within .jumble__boxes span {
      border-color: $spot;
    }
  }
  &__boxes {
    display: flex;
    gap: 3px;
    span {
      width: 26px;
      height: 26px;
      display: grid;
      place-items: center;
      border: 1px solid $ink;
      background: #fbf8f0;
      font-family: $heading-font;
      font-weight: 700;
      font-size: 15px;
      &.is-circled {
        border-radius: 50%;
      }
      &.is-right {
        background: $paper-dark;
      }
    }
  }
  &__bonus {
    padding-top: $gap-3;
  }
  &__bonus-label {
    margin-bottom: $gap-2;
    font-family: $heading-font;
    font-weight: 700;
  }
  &__circled {
    letter-spacing: 0.1em;
    color: $spot;
  }
}
</style>
