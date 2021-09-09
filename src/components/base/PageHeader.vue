<script>
import { mapActions } from "vuex";

export default {
  name: "PageHeader",
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      zipcode: ""
    };
  },
  methods: {
    ...mapActions("location", ["getLocation"]),
    handleSearch(zipcode) {
      this.getLocation(zipcode);
      this.zipcode = "";
    }
  }
};
</script>

<template>
  <header class="page-header">
    <div>
      <h1 class="page-header__title">
        {{ title }}
      </h1>
      <h4 class="page-header__sub-title">
        {{ subtitle }}
      </h4>
    </div>
    <form class="page-header__search" @submit.prevent="handleSearch(zipcode)">
      <button type="submit">
        <span class="icon-actions-linear-search" />
      </button>
      <input
        v-model.trim="zipcode"
        type="text"
        name="location"
        placeholder="Zip code"
      />
    </form>
  </header>
</template>

<style lang="scss">
.page-header {
  height: min-content;
  display: flex;
  justify-content: space-between;
  @media screen and (min-width: $tablet) {
    margin-bottom: $gap-2;
  }
  @media screen and (min-width: $laptop-lg) {
    margin-bottom: $gap-8;
  }
  &__title {
    font-size: 24px;
    letter-spacing: 2px;
    color: $white;
  }
  &__sub-title {
    font-family: $base-font;
    font-weight: 400;
  }
  &__search {
    height: 54px;
    position: relative;
    display: flex;
    align-items: center;
    width: 125px;
    padding: $gap-1 $gap-3;
    border-radius: 50px;
    background: $main-gradiant;
    box-shadow: $main-shadow;
    @media screen and (min-width: $tablet) {
      width: 200px;
      padding: $gap-1 $gap-4;
    }
    button {
      margin-right: $gap-2;
      flex-shrink: 0;
      background: $third-gradiant;
      border-radius: 100%;
      border: none;
      outline: none;
      height: 30px;
      width: 30px;
      @media screen and (min-width: $tablet) {
        margin-right: $gap-4;
      }
      span {
        color: #878a94;
        font-size: 12px;
      }
      &:hover {
        cursor: pointer;
        background: $second-gradiant;
      }
    }
    input {
      outline: none;
      background: transparent;
      border: none;
      width: 100%;
    }
    &:focus-within {
      box-shadow: $focus-shadow;
    }
  }
}
</style>