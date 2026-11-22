<script>
import { solutionGrid } from "@/puzzles/crossword";

// The headline crossword. Type to fill, the cursor follows the word; click a square
// twice (or press space) to switch between across and down; arrows move.
export default {
  name: "CrosswordPuzzle",
  props: {
    puzzle: { type: Object, required: true },
    progress: { type: Object, required: true } // { letters: { 'r,c': 'A' }, checked: bool }
  },
  emits: ["update"],
  data() {
    return {
      letters: { ...(this.progress.letters || {}) },
      checked: !!this.progress.checked,
      cursor: null, // { r, c }
      across: true
    };
  },
  computed: {
    solution: ({ puzzle }) => solutionGrid(puzzle),
    numbers: ({ puzzle }) => Object.fromEntries(puzzle.words.map((w) => [`${w.row},${w.col}`, w.number])),
    acrossClues: ({ puzzle }) => puzzle.words.filter((w) => w.across),
    downClues: ({ puzzle }) => puzzle.words.filter((w) => !w.across),
    activeWord({ cursor, across, puzzle }) {
      if (!cursor) return null;
      const covers = (w) =>
        w.across
          ? w.row === cursor.r && cursor.c >= w.col && cursor.c < w.col + w.answer.length
          : w.col === cursor.c && cursor.r >= w.row && cursor.r < w.row + w.answer.length;
      return puzzle.words.find((w) => w.across === across && covers(w)) || puzzle.words.find(covers) || null;
    },
    activeCells({ activeWord }) {
      if (!activeWord) return new Set();
      return new Set(
        [...activeWord.answer].map((_, i) =>
          activeWord.across ? `${activeWord.row},${activeWord.col + i}` : `${activeWord.row + i},${activeWord.col}`
        )
      );
    },
    total: ({ solution }) => solution.flat().filter(Boolean).length,
    solved({ solution, letters, total }) {
      let right = 0;
      solution.forEach((row, r) => row.forEach((ch, c) => ch && letters[`${r},${c}`] === ch && (right += 1)));
      return right === total;
    }
  },
  methods: {
    key: (r, c) => `${r},${c}`,
    isLetter(r, c) {
      return !!(this.solution[r] && this.solution[r][c]);
    },
    wrong(r, c) {
      const typed = this.letters[this.key(r, c)];
      return this.checked && typed && typed !== this.solution[r][c];
    },
    save() {
      this.$emit("update", { letters: this.letters, checked: this.checked });
    },
    focusCell(r, c) {
      this.cursor = { r, c };
      this.$nextTick(() => {
        const el = this.$refs.grid && this.$refs.grid.querySelector(`[data-cell="${r},${c}"]`);
        if (el) el.focus();
      });
    },
    select(r, c) {
      if (this.cursor && this.cursor.r === r && this.cursor.c === c) this.across = !this.across;
      else {
        this.cursor = { r, c };
        // pick the direction that has a word here
        const hasAcross = this.isLetter(r, c - 1) || this.isLetter(r, c + 1);
        const hasDown = this.isLetter(r - 1, c) || this.isLetter(r + 1, c);
        if (this.across && !hasAcross && hasDown) this.across = false;
        if (!this.across && !hasDown && hasAcross) this.across = true;
      }
    },
    selectWord(word) {
      this.across = word.across;
      this.focusCell(word.row, word.col);
    },
    step(r, c, dir) {
      const [dr, dc] = this.across ? [0, dir] : [dir, 0];
      if (this.isLetter(r + dr, c + dc)) this.focusCell(r + dr, c + dc);
    },
    onKey(event, r, c) {
      const k = event.key;
      if (/^[a-z]$/i.test(k)) {
        this.letters[this.key(r, c)] = k.toUpperCase();
        this.save();
        this.step(r, c, 1);
      } else if (k === "Backspace") {
        if (this.letters[this.key(r, c)]) delete this.letters[this.key(r, c)];
        else this.step(r, c, -1);
        this.save();
      } else if (k === " ") {
        this.across = !this.across;
      } else if (k.startsWith("Arrow")) {
        const moves = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
        const [dr, dc] = moves[k];
        this.across = dr === 0;
        if (this.isLetter(r + dr, c + dc)) this.focusCell(r + dr, c + dc);
      } else {
        return;
      }
      event.preventDefault();
    },
    // phone keyboards don't report letters on keydown, so take them from input too
    onInput(event, r, c) {
      const ch = event.target.value.slice(-1).toUpperCase();
      event.target.value = "";
      if (/^[A-Z]$/.test(ch)) {
        this.letters[this.key(r, c)] = ch;
        this.save();
        this.step(r, c, 1);
      }
      event.target.value = this.letters[this.key(r, c)] || "";
    },
    check() {
      this.checked = true;
      this.save();
    },
    revealWord() {
      const w = this.activeWord;
      if (!w) return;
      [...w.answer].forEach((ch, i) => {
        this.letters[w.across ? this.key(w.row, w.col + i) : this.key(w.row + i, w.col)] = ch;
      });
      this.save();
    },
    revealAll() {
      this.solution.forEach((row, r) => row.forEach((ch, c) => ch && (this.letters[this.key(r, c)] = ch)));
      this.save();
    },
    clear() {
      this.letters = {};
      this.checked = false;
      this.save();
    }
  }
};
</script>

<template>
  <div class="crossword">
    <div
      ref="grid"
      class="crossword__grid"
      :style="{ gridTemplateColumns: `repeat(${puzzle.cols}, var(--cell))` }"
    >
      <template v-for="(row, r) in solution" :key="r">
        <template v-for="(ch, c) in row" :key="`${r}-${c}`">
          <div
            v-if="ch"
            class="crossword__cell"
            :class="{
              'crossword__cell--active': activeCells.has(key(r, c)),
              'crossword__cell--cursor': cursor && cursor.r === r && cursor.c === c,
              'crossword__cell--wrong': wrong(r, c)
            }"
          >
            <span v-if="numbers[key(r, c)]" class="crossword__num">{{ numbers[key(r, c)] }}</span>
            <input
              :data-cell="key(r, c)"
              :value="letters[key(r, c)] || ''"
              :aria-label="`Row ${r + 1}, column ${c + 1}`"
              maxlength="1"
              autocomplete="off"
              autocapitalize="characters"
              spellcheck="false"
              @focus="cursor = { r, c }"
              @mousedown="select(r, c)"
              @keydown="onKey($event, r, c)"
              @input="onInput($event, r, c)"
            />
          </div>
          <div v-else class="crossword__block" />
        </template>
      </template>
    </div>

    <p v-if="activeWord" class="crossword__current">
      <strong>{{ activeWord.number }} {{ activeWord.across ? "Across" : "Down" }}:</strong> {{ activeWord.clue }}
    </p>

    <div class="puzzle-actions">
      <button class="chip" type="button" @click="check">
        Check
      </button>
      <button
        class="chip"
        type="button"
        :disabled="!activeWord"
        @click="revealWord"
      >
        Reveal word
      </button>
      <button class="chip" type="button" @click="revealAll">
        Reveal all
      </button>
      <button class="chip" type="button" @click="clear">
        Clear
      </button>
    </div>
    <p v-if="solved" class="puzzle-done">
      Solved! Stop the presses.
    </p>

    <div class="crossword__clues">
      <div v-for="[label, list] in [['Across', acrossClues], ['Down', downClues]]" :key="label">
        <h3>{{ label }}</h3>
        <ol>
          <li
            v-for="w in list"
            :key="`${w.number}${label}`"
            :class="{ 'is-active': activeWord === w }"
            @click="selectWord(w)"
          >
            <b>{{ w.number }}</b> {{ w.clue }} <i>({{ w.answer.length }})</i>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.crossword {
  --cell: clamp(22px, 6.4vw, 34px);
  &__grid {
    display: grid;
    width: max-content;
    max-width: 100%;
    overflow-x: auto;
    gap: 0;
    border: 2px solid $ink;
  }
  &__block {
    width: var(--cell);
    height: var(--cell);
  }
  &__cell {
    position: relative;
    width: var(--cell);
    height: var(--cell);
    margin: 0 -1px -1px 0;
    border: 1px solid $ink;
    background: #fbf8f0;
    input {
      width: 100%;
      height: 100%;
      border: 0;
      background: transparent;
      text-align: center;
      font-family: $heading-font;
      font-size: calc(var(--cell) * 0.55);
      font-weight: 700;
      text-transform: uppercase;
      caret-color: transparent;
      cursor: pointer;
      &:focus {
        outline: none;
      }
    }
    &--active {
      background: $paper-dark;
    }
    &--cursor {
      background: #e8d9a8;
    }
    &--wrong input {
      color: $spot;
      text-decoration: line-through;
    }
  }
  &__num {
    position: absolute;
    top: 1px;
    left: 2px;
    font-size: 9px;
    line-height: 1;
    pointer-events: none;
  }
  &__current {
    margin-top: $gap-3;
    font-size: 15px;
  }
  &__clues {
    display: grid;
    gap: $gap-4;
    margin-top: $gap-4;
    @media screen and (min-width: $tablet) {
      grid-template-columns: 1fr 1fr;
    }
    h3 {
      font-size: 14px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      border-bottom: 1px solid $ink;
      padding-bottom: $gap-1;
      margin-bottom: $gap-1;
    }
    ol {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      padding: 3px $gap-1;
      font-size: 14px;
      line-height: 1.35;
      cursor: pointer;
      &:hover {
        background: $paper-dark;
      }
      &.is-active {
        background: #e8d9a8;
      }
      i {
        color: $ink-muted;
      }
    }
  }
}
</style>
