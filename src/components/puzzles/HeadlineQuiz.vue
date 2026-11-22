<script>
// Five blanked headlines from today's paper. Pick the missing word.
export default {
  name: "HeadlineQuiz",
  props: {
    questions: { type: Array, required: true },
    progress: { type: Object, required: true } // { picks: { [index]: answer } }
  },
  emits: ["update"],
  data() {
    return { picks: { ...(this.progress.picks || {}) } };
  },
  computed: {
    answered: ({ picks }) => Object.keys(picks).length,
    score: ({ picks, questions }) => questions.filter((q, i) => picks[i] === q.answer).length
  },
  methods: {
    pick(i, choice) {
      if (this.picks[i]) return;
      this.picks[i] = choice;
      this.$emit("update", { picks: this.picks });
    },
    title: (word) => word.charAt(0) + word.slice(1).toLowerCase()
  }
};
</script>

<template>
  <div class="quiz">
    <ol class="quiz__list">
      <li v-for="(q, i) in questions" :key="i" class="quiz__item">
        <p class="quiz__clue">
          {{ q.clue }}
        </p>
        <div class="quiz__choices">
          <button
            v-for="choice in q.choices"
            :key="choice"
            type="button"
            class="chip"
            :class="{
              'is-right': picks[i] && choice === q.answer,
              'is-wrong': picks[i] === choice && choice !== q.answer
            }"
            :disabled="!!picks[i]"
            @click="pick(i, choice)"
          >
            {{ title(choice) }}
          </button>
        </div>
        <a
          v-if="picks[i] && q.link"
          class="quiz__link"
          :href="q.link"
          target="_blank"
          rel="noopener noreferrer"
        >Read the story &raquo;</a>
      </li>
    </ol>
    <p v-if="answered === questions.length" class="puzzle-done">
      {{ score }} of {{ questions.length }}. {{ score === questions.length ? "You read the whole paper!" : "Read up and try tomorrow." }}
    </p>
  </div>
</template>

<style lang="scss">
.quiz {
  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: q;
  }
  &__item {
    padding: $gap-3 0;
    border-bottom: 1px solid $rule-soft;
    counter-increment: q;
    &:first-child {
      padding-top: 0;
    }
  }
  &__clue {
    font-family: $heading-font;
    font-size: 17px;
    font-weight: 700;
    line-height: 1.3;
    &::before {
      content: counter(q) ". ";
      color: $spot;
    }
  }
  &__choices {
    display: flex;
    flex-wrap: wrap;
    gap: $gap-2;
    margin-top: $gap-2;
    .chip {
      text-transform: none;
      font-size: 14px;
      letter-spacing: 0;
      &:disabled {
        cursor: default;
        opacity: 0.55;
      }
      &.is-right {
        background: $ink;
        color: $paper;
        opacity: 1;
      }
      &.is-wrong {
        border-color: $spot;
        color: $spot;
        text-decoration: line-through;
        opacity: 1;
      }
    }
  }
  &__link {
    display: inline-block;
    margin-top: $gap-2;
    font-size: 13px;
    font-style: italic;
    color: $ink;
    text-decoration: underline;
    &:hover {
      color: $spot;
    }
  }
}
</style>
