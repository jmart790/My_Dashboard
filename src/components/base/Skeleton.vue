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
// $background-color: #f5f5f5;
$background-color: #3c4045;
// $background-fade: #d0d2d6;
$background-fade: #72808c;

.skeleton {
  @mixin background-gradient {
    background-image: linear-gradient(
      90deg,
      $background-fade 0px,
      #606970 20px,
      $background-color 70px,
      $background-color 80px,
      #606970 120px,
      $background-fade 140px
    );
    background-size: 150%;
  }

  position: relative;
  height: auto;
  width: 100%;
  padding: $gap-6;
  border-radius: $round-2;
  background: $background-color;
  overflow: hidden;

  &::before {
    position: absolute;
    content: "";
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    @include background-gradient;
    // animation: shine-lines 1.8s infinite linear;
    mix-blend-mode: darken;
  }

  @keyframes shine-lines {
    0% {
      background-position: 150%;
    }
    100% {
      background-position: -150%;
    }
  }
}
</style>