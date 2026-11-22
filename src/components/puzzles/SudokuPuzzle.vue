<script>
// Daily sudoku, easy or hard. Givens are fixed; Check marks wrong entries in red.
export default {
  name: "SudokuPuzzle",
  props: {
    puzzles: { type: Object, required: true }, // { easy: {puzzle, solution}, hard: {...} }
    progress: { type: Object, required: true } // { level, easy: { cells, checked }, hard: {...} }
  },
  emits: ["update"],
  data() {
    const state = (level) => ({
      cells: (this.progress[level] && this.progress[level].cells) || {},
      checked: !!(this.progress[level] && this.progress[level].checked)
    });
    return { level: this.progress.level || "easy", easy: state("easy"), hard: state("hard") };
  },
  computed: {
    board: ({ puzzles, level }) => puzzles[level],
    state: ({ level, easy, hard }) => (level === "easy" ? easy : hard),
    solved: ({ board, state }) => board.puzzle.every((n, i) => n || Number(state.cells[i]) === board.solution[i])
  },
  methods: {
    value(i) {
      return this.board.puzzle[i] || this.state.cells[i] || "";
    },
    wrong(i) {
      const v = this.state.cells[i];
      return this.state.checked && v && Number(v) !== this.board.solution[i];
    },
    set(i, event) {
      const digit = event.target.value.replace(/[^1-9]/g, "").slice(-1);
      if (digit) this.state.cells[i] = digit;
      else delete this.state.cells[i];
      event.target.value = digit;
      this.save();
    },
    choose(level) {
      this.level = level;
      this.save();
    },
    check() {
      this.state.checked = true;
      this.save();
    },
    clear() {
      this.state.cells = {};
      this.state.checked = false;
      this.save();
    },
    save() {
      this.$emit("update", { level: this.level, easy: this.easy, hard: this.hard });
    }
  }
};
</script>

<template>
  <div class="sudoku">
    <div class="puzzle-actions sudoku__levels">
      <button
        v-for="l in ['easy', 'hard']"
        :key="l"
        class="chip"
        type="button"
        :aria-pressed="level === l"
        @click="choose(l)"
      >
        {{ l }}
      </button>
    </div>
    <div class="sudoku__grid">
      <template v-for="(given, i) in board.puzzle" :key="`${level}-${i}`">
        <span v-if="given" class="sudoku__cell sudoku__cell--given">{{ given }}</span>
        <input
          v-else
          class="sudoku__cell"
          :class="{ 'sudoku__cell--wrong': wrong(i) }"
          :value="value(i)"
          :aria-label="`Row ${Math.floor(i / 9) + 1}, column ${(i % 9) + 1}`"
          inputmode="numeric"
          maxlength="2"
          autocomplete="off"
          @input="set(i, $event)"
        />
      </template>
    </div>
    <div class="puzzle-actions">
      <button class="chip" type="button" @click="check">
        Check
      </button>
      <button class="chip" type="button" @click="clear">
        Clear
      </button>
    </div>
    <p v-if="solved" class="puzzle-done">
      Solved!
    </p>
  </div>
</template>

<style lang="scss">
.sudoku {
  &__levels {
    margin: 0 0 $gap-3;
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    width: min(100%, 396px);
    aspect-ratio: 1;
    border: 2px solid $ink;
  }
  &__cell {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    min-width: 0;
    border: 0;
    border-right: 1px solid $rule-soft;
    border-bottom: 1px solid $rule-soft;
    background: #fbf8f0;
    text-align: center;
    font-family: $heading-font;
    font-size: clamp(15px, 4.5vw, 22px);
    color: $ink-soft;
    // heavy rules around each 3×3 box
    &:nth-child(3n) {
      border-right: 2px solid $ink;
    }
    &:nth-child(9n) {
      border-right: 0;
    }
    &:nth-child(n + 19):nth-child(-n + 27),
    &:nth-child(n + 46):nth-child(-n + 54) {
      border-bottom: 2px solid $ink;
    }
    &:nth-child(n + 73) {
      border-bottom: 0;
    }
    &:focus {
      outline: none;
      background: #e8d9a8;
    }
    &--given {
      font-weight: 700;
      color: $ink;
      background: transparent;
    }
    &--wrong {
      color: $spot;
      text-decoration: line-through;
    }
  }
}
</style>
