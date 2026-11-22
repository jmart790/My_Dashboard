<script>
// The classic "Continued on page X" line that ends a front-page brief.
export default {
  name: "JumpLine",
  props: {
    to: { type: String, required: true }, // route name
    section: { type: String, required: true },
    page: { type: Number, required: true }
  }
};
</script>

<template>
  <router-link class="jump-line" :to="{ name: to }">
    Continued on {{ section }}, Page {{ page }} &raquo;
  </router-link>
</template>

<style lang="scss">
.jump-line {
  display: block;
  margin-top: $gap-3;
  padding-top: $gap-2;
  border-top: 1px solid $rule-soft;
  font-family: $heading-font;
  font-size: 12px;
  font-style: italic;
  color: $ink;
  text-decoration: none;
  &:hover {
    color: $spot;
    text-decoration: underline;
  }
  &:focus-visible {
    outline: none;
    box-shadow: $focus-shadow;
  }
}
</style>
