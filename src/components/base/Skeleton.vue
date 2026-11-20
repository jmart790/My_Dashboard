<script>
export default {
  name: "Skeleton"
};
</script>

<template>
  <div class="skeleton">
    <slot />
  </div>
</template>


<style lang="scss">
.skeleton {
  @mixin background-gradient {
    background: $paper-dark;
    background-image: linear-gradient(
      to right,
      $paper-dark 0%,
      $paper 20%,
      $paper-dark 40%,
      $paper-dark 100%
    );
    background-size: 150%;
    background-repeat: no-repeat;
  }

  @keyframes placeHolderShimmer {
    0% {
      background-position: 150% 0;
    }
    100% {
      background-position: -150% 0;
    }
  }

  position: relative;
  height: auto;
  width: 100%;
  padding: $gap-6;
  border-radius: 0;
  border: 1px solid $rule-soft;
  background: transparent;
  overflow: hidden;

  &::before {
    position: absolute;
    content: "";
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    @include background-gradient;
    animation: placeHolderShimmer 1s infinite linear;
    animation-fill-mode: forwards;
    mix-blend-mode: multiply;
  }
}
</style>