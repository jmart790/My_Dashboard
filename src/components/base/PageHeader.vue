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
      zipcode: "",
      hasErrors: false
    };
  },
  methods: {
    ...mapActions("location", ["getLocation"]),
    checkValidation(zipcode) {
      const numOnly = zipcode.match(/^[0-9]*$/);
      return zipcode.length === 5 && numOnly;
    },
    handleBlur(zipcode) {
      if (!zipcode) this.hasErrors = false;
      else if (!this.checkValidation(zipcode)) this.hasErrors = true;
    },
    handleSearch(zipcode) {
      if (this.checkValidation(zipcode)) {
        this.getLocation(zipcode);
        this.zipcode = "";
      } else this.hasErrors = true;
    }
  }
};
</script>

<template>
  <header class="page-header">
    <div class="page-header__title-group">
      <h1 class="page-header__title">
        {{ title }}
      </h1>
      <h4 class="page-header__sub-title">
        {{ subtitle }}
      </h4>
    </div>
    <form
      class="page-header__search"
      :class="{ 'page-header__search--error': hasErrors }"
      @submit.prevent="handleSearch(zipcode)"
    >
      <button type="submit">
        <span class="icon-actions-linear-search" />
      </button>
      <input
        v-model.trim="zipcode"
        type="text"
        name="zipcode"
        placeholder="Zip code"
        maxlength="5"
        autocomplete="off"
        @blur="handleBlur(zipcode)"
      />
      <p>Please enter a 5 digit zipcode</p>
    </form>
  </header>
</template>

<style lang="scss">
.page-header {
  height: min-content;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: $gap-4;
  @media screen and (min-width: 500px) {
    flex-direction: row;
  }
  @media screen and (min-width: $tablet) {
    margin-bottom: $gap-2;
  }
  @media screen and (min-width: $laptop-lg) {
    margin-bottom: $gap-8;
  }
  &__title-group {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    @media screen and (min-width: 500px) {
      display: unset;
    }
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
    margin-bottom: $gap-6;
    padding: $gap-1 $gap-3;
    border-radius: 50px;
    background: $main-gradiant;
    box-shadow: $main-shadow;
    @media screen and (min-width: $tablet) {
      width: 200px;
      margin-bottom: unset;
      padding: $gap-1 $gap-4;
    }
    button {
      margin-right: $gap-2;
      flex-shrink: 0;
      background: transparent;
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
        background: $third-gradiant;
      }
    }
    input {
      outline: none;
      background: transparent;
      border: none;
      width: 100%;
    }
    &:focus-within {
      box-shadow: 0 3px 3px $salmon-lt, 0px -3px 3px $salmon-lt,
        3px 0 3px $salmon-lt, -3px 0 3px $salmon-lt,
        0 2.8px 2.2px rgba(0, 0, 0, 0.034), 0 6.7px 5.3px rgba(0, 0, 0, 0.048),
        0 12.5px 10px rgba(0, 0, 0, 0.06);
    }
    p {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      white-space: nowrap;
      font-size: 12px;
      color: $danger;
      opacity: 0;
      transition: all 0.2s ease;
    }
    &--error {
      border: 1px solid $danger;
      p {
        transform: translateY(28px);
        opacity: 1;
      }
    }
  }
}
</style>