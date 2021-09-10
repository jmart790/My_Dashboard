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
    background: #656871;
    background-image: linear-gradient(
      to right,
      #656871 0%,
      #888b94 20%,
      #656871 40%,
      #656871 100%
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
  border-radius: $round-2;
  background: #414247;
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
    mix-blend-mode: darken;
  }
}
</style>