<script>
// One column section of the Media page: a kicker, then the feed once it loads.
// Handles loading, failure and retry so each section only lays out its data.
export default {
  name: "MediaSection",
  props: {
    kicker: { type: String, required: true },
    // () => Promise<data>
    load: { type: Function, required: true },
    // reload when this changes (e.g. the reader's location)
    reloadKey: { type: String, default: "" }
  },
  data() {
    return { data: null, status: "loading" }; // loading | ready | error
  },
  watch: {
    reloadKey() {
      this.fetch();
    }
  },
  mounted() {
    this.fetch();
  },
  // a column that can't lay out its data says so (with a retry) instead of going blank
  errorCaptured(error) {
    console.error(`[${this.kicker}]`, error);
    this.status = "error";
    return false;
  },
  methods: {
    async fetch() {
      const key = this.reloadKey;
      this.status = "loading";
      try {
        const data = await this.load();
        if (key !== this.reloadKey) return; // a newer request replaced this one
        this.data = data;
        this.status = "ready";
      } catch {
        if (key === this.reloadKey) this.status = "error";
      }
    }
  }
};
</script>

<template>
  <section class="m-section" :aria-busy="status === 'loading'">
    <h2 class="kicker">
      {{ kicker }}
    </h2>
    <slot v-if="status === 'ready'" :data="data" />
    <p v-else-if="status === 'loading'" class="m-section__note">
      Setting type&hellip;
    </p>
    <p v-else class="m-section__note">
      This column didn't make the edition.
      <button type="button" class="chip" @click="fetch">
        Try again
      </button>
    </p>
  </section>
</template>

<style lang="scss">
.m-section {
  &__note {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $gap-2;
    font-family: $heading-font;
    font-style: italic;
    color: $ink-muted;
  }
}

// Shared by every section: a row that opens in place to show the details.
.m-item {
  border-bottom: 1px solid $rule-soft;
  &:last-child {
    border-bottom: 0;
  }
  > summary {
    display: flex;
    align-items: center;
    gap: $gap-3;
    padding: $gap-2 0;
    cursor: pointer;
    list-style: none;
    &::-webkit-details-marker {
      display: none;
    }
    &::after {
      content: "+";
      margin-left: auto;
      padding-left: $gap-2;
      font-family: $heading-font;
      font-weight: 700;
      color: $ink-muted;
    }
    &:hover .m-item__title {
      color: $spot;
    }
    &:focus-visible {
      outline: none;
      box-shadow: $focus-shadow;
    }
  }
  &[open] > summary::after {
    content: "\2013";
  }
  &__rank {
    flex: none;
    width: 1.6em;
    font-family: $heading-font;
    font-size: 20px;
    font-weight: 700;
    text-align: right;
  }
  &__thumb {
    flex: none;
    width: 44px;
    height: 44px;
    object-fit: cover;
    border: 1px solid $ink;
    background: $paper-dark;
  }
  &__text {
    min-width: 0;
  }
  &__title {
    display: block;
    font-family: $heading-font;
    font-weight: 700;
    line-height: 1.25;
  }
  &__meta {
    display: block;
    font-size: 13px;
    color: $ink-muted;
  }
  &__body {
    padding: 0 0 $gap-3;
    font-size: 14px;
    line-height: 1.55;
    p {
      margin: 0 0 $gap-2;
    }
    a {
      color: $ink;
      font-style: italic;
    }
  }
}
</style>
