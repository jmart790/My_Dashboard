<script>
// Renders its slot only once it scrolls near the screen, so below-the-fold sections
// don't fetch (or download code) while the top of the page is still loading.
export default {
  name: "WhenVisible",
  props: {
    margin: { type: String, default: "300px" }, // start a little before it shows
    minHeight: { type: String, default: "320px" } // rough size, so the page has length
  },
  data() {
    return { shown: typeof IntersectionObserver === "undefined" };
  },
  mounted() {
    if (this.shown) return;
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.shown = true;
          this.observer.disconnect();
        }
      },
      { rootMargin: this.margin }
    );
    this.observer.observe(this.$el);
  },
  beforeUnmount() {
    if (this.observer) this.observer.disconnect();
  }
};
</script>

<template>
  <div class="when-visible" :style="shown ? null : { minHeight }">
    <slot v-if="shown" />
  </div>
</template>
