<script>
export default {
  name: "SkeletonItem",
  props: {
    height: {
      type: String,
      default: "auto"
    },
    width: {
      type: String,
      default: "300px"
    },
    shape: {
      type: String,
      default: "rectangle" // circle, square, text
    },
    lines: {
      type: Number,
      default: 4
    }
  },
  computed: {
    cssVars() {
      return {
        "--width": this.width,
        "--height": this.shape === "text" ? "12px" : this.height,
        "--container-width": this.shape === "text" ? "100%" : "auto"
      };
    },
    lineItems() {
      return this.shape === "text" ? this.lines : 1;
    }
  }
};
</script>

<template>
  <div class="skeleton-item-container" :style="cssVars">
    <div
      v-for="line in lineItems"
      :key="`skeleton-line-${line}-${Date.now()}`"
      :class="`skeleton-item skeleton-item--${shape}`"
    />
  </div>
</template>


<style lang="scss">
.skeleton-item-container {
  width: var(--container-width);
}

.skeleton-item {
  $height: var(--height);
  $width: var(--width);

  height: $height;
  width: $width;
  border-radius: $round-1;
  background-color: #9ea6ac;

  &--square,
  &--circle {
    width: $height;
    flex-shrink: 0;
  }
  &--circle {
    border-radius: 100%;
  }
  &--text {
    margin-bottom: 12px;
    border-radius: $round-1;
    &:last-of-type {
      margin-bottom: unset;
      width: calc(var(--width) * 0.8);
    }
  }
}
</style>