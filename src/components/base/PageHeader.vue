<script>
import { mapActions, mapGetters } from "vuex";

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
  computed: {
    ...mapGetters("location", ["locating", "geoError", "source", "currentZip"]),
    locationLabel() {
      if (this.locating) return "Finding your location";
      return this.source === "gps" ? "Using your location. Update it" : "Use my location";
    }
  },
  data() {
    return {
      // starts as the current location's zip, so the bar always shows where you are
      zipcode: this.$store.getters["location/currentZip"],
      hasErrors: false
    };
  },
  watch: {
    // the location can change elsewhere (device location, another page's search)
    currentZip(zip) {
      this.zipcode = zip;
      this.hasErrors = false;
    }
  },
  methods: {
    ...mapActions("location", ["getLocation", "locateMe"]),
    async useMyLocation() {
      this.hasErrors = false;
      // failures are shown from the store's geoError; nothing else to do here
      await this.locateMe().catch(() => {});
    },
    checkValidation(zipcode) {
      const numOnly = zipcode.match(/^[0-9]*$/);
      return zipcode.length === 5 && numOnly;
    },
    handleBlur(zipcode) {
      if (!zipcode) {
        // left empty: put the current zip back rather than show a blank bar
        this.zipcode = this.currentZip;
        this.hasErrors = false;
      } else if (!this.checkValidation(zipcode)) this.hasErrors = true;
    },
    clearZip() {
      this.zipcode = "";
      this.hasErrors = false;
      this.$refs.input.focus();
    },
    handleSearch(zipcode) {
      if (this.checkValidation(zipcode)) this.getLocation(zipcode);
      else this.hasErrors = true;
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
      <p class="page-header__sub-title">
        {{ subtitle }}
      </p>
    </div>
    <div class="page-header__controls">
      <button
        type="button"
        class="page-header__locate"
        :class="{
          'page-header__locate--active': source === 'gps',
          'page-header__locate--busy': locating
        }"
        :aria-label="locationLabel"
        :title="locationLabel"
        :disabled="locating"
        @click="useMyLocation"
      >
        <span
          :class="locating ? 'icon-spinner' : 'icon-locations-linear-map-marker'"
          aria-hidden="true"
        />
      </button>
      <form
        class="page-header__search"
        :class="{ 'page-header__search--error': hasErrors }"
        @submit.prevent="handleSearch(zipcode)"
      >
        <button type="submit" aria-label="Search zip code">
          <span class="icon-actions-linear-search" aria-hidden="true" />
        </button>
        <input
          ref="input"
          v-model.trim="zipcode"
          type="text"
          name="zipcode"
          placeholder="Zip code"
          aria-label="Zip code"
          inputmode="numeric"
          maxlength="5"
          autocomplete="off"
          @blur="handleBlur(zipcode)"
        />
        <!-- mousedown.prevent keeps focus in the input, so its blur (which would
             restore the zip) doesn't fire before the click clears it -->
        <button
          v-if="zipcode"
          type="button"
          class="page-header__clear"
          aria-label="Clear zip code"
          @mousedown.prevent
          @click="clearZip"
        >
          <span aria-hidden="true">&times;</span>
        </button>
        <p>Please enter a 5 digit zipcode</p>
      </form>
      <p v-if="geoError" class="page-header__geo-error" role="alert">
        {{ geoError }}
      </p>
    </div>
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
  // headline with its dateline underneath, at every width
  &__title-group {
    display: block;
  }
  // the section's headline, with the city as its dateline underneath
  &__title {
    font-size: clamp(28px, 4vw, 40px);
    line-height: 1.05;
    color: $ink;
  }
  &__sub-title {
    margin-top: $gap-1;
    font-family: $heading-font;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $ink-muted;
  }
  &__controls {
    position: relative;
    display: flex;
    align-items: center;
    gap: $gap-3;
    margin-bottom: $gap-6;
    @media screen and (min-width: $tablet) {
      margin-bottom: unset;
    }
  }
  &__locate {
    width: 54px;
    height: 54px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border: 1px solid $ink;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    transition: background 0.2s;
    &:hover {
      background: $paper-dark;
    }
    span {
      color: $ink;
      font-size: 20px;
      transition: color 0.2s;
    }
    &:hover span {
      color: $primary-lt;
    }
    &:focus-visible {
      outline: none;
      box-shadow: $focus-shadow;
    }
    // GPS is the active source
    &--active span {
      color: $primary;
    }
    &--busy {
      cursor: progress;
      span {
        display: inline-block;
        animation: page-header-spin 0.9s linear infinite;
      }
    }
  }
  &__geo-error {
    position: absolute;
    top: calc(100% + #{$gap-2});
    left: 0;
    right: 0;
    font-size: 12px;
    color: $danger;
    @media screen and (min-width: $tablet) {
      left: auto;
      width: 280px;
      text-align: right;
    }
  }
  &__search {
    height: 54px;
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    padding: $gap-1 $gap-3;
    border: 1px solid $ink;
    border-radius: 0;
    background: transparent;
    @media screen and (min-width: $tablet) {
      flex: none;
      width: 200px;
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
        color: $ink;
        font-size: 12px;
      }
      &:hover {
        cursor: pointer;
        background: $paper-dark;
      }
    }
    input {
      outline: none;
      background: transparent;
      border: none;
      width: 100%;
      min-width: 0;
      font-family: $heading-font;
      font-size: 16px;
      letter-spacing: 0.08em;
      &::placeholder {
        color: $ink-muted;
      }
    }
    // shown on hover, or while the bar has focus (keyboard and touch have no hover)
    .page-header__clear {
      margin: 0 0 0 $gap-1;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s;
      span {
        font-size: 20px;
        line-height: 1;
      }
      &:hover span {
        color: $primary-lt;
      }
      &:focus-visible {
        opacity: 1;
        pointer-events: auto;
        box-shadow: $focus-shadow;
      }
    }
    &:hover .page-header__clear,
    &:focus-within .page-header__clear {
      opacity: 1;
      pointer-events: auto;
    }
    &:focus-within {
      box-shadow: $focus-shadow;
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

@keyframes page-header-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .page-header__locate--busy span {
    animation: none;
  }
}
</style>
