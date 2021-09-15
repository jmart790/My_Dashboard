<script>
export default {
  name: "ErrorCard",
  props: {
    messageOption: {
      type: Number,
      required: false
    },
    category: {
      type: String,
      required: true,
      validator: category => {
        const validCategories = ["NEWS", "WEATHER", "FOOD"];
        return validCategories.includes(category);
      }
    },
    showRefreshBtn: {
      type: Boolean,
      default: false
    },
    isVertical: {
      type: Boolean,
      default: false
    },
    isReverse: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    message() {
      const options = {
        1: "Sorry, we're having some issues retreiving your data",
        2: `It's possible we went over our limit to request ${this.category.toLowerCase()} data for you 😞`,
        3: "We're also upset, but at least we have these cool unDraw illustrations 😅"
      };
      return options[this.messageOption] || "";
    }
  }
};
</script>

<template>
  <div
    class="card error-card"
    :class="{
      'error-card--vertical': isVertical,
      'error-card--reverse': isReverse
    }"
  >
    <slot>
      <inline-svg :src="require(`@/assets/illustrations/undraw_warning.svg`)" />
    </slot>
    <div>
      <p>{{ message }}</p>
      <button v-if="showRefreshBtn" @click="$emit('request-data')">
        Try again <span class="icon-actions-linear-refresh" />
      </button>
    </div>
  </div>
</template>


<style lang="scss">
.error-card {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap-reverse;
  gap: $gap-8;
  @media screen and (min-width: $laptop-lg) {
    gap: 80px;
  }

  svg {
    max-height: 200px;
    height: 100%;
    width: min-content;
    overflow: hidden;
    @media screen and (min-width: $laptop-lg) {
      max-height: 300px;
      max-width: 300px;
    }
  }

  p {
    max-width: 20ch;
    font-size: 20px;
    text-align: center;
    @media screen and (min-width: $laptop-lg) {
      font-size: 24px;
    }
  }

  button {
    margin: $gap-8 auto;
    height: 54px;
    width: 170px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50px;
    border: none;
    background: $primary;
    color: $white;
    font-size: 18px;
    outline: none;
    transition: all 0.2s ease;
    span {
      margin-left: $gap-2;
      color: inherit;
    }
    &:hover {
      cursor: pointer;
      background: $primary-dk;
    }
    &:focus {
      box-shadow: $focus-shadow;
    }
  }

  &--vertical {
    justify-content: center;
    align-content: center;
    svg {
      width: 100%;
      height: min-content;
    }
  }

  &--reverse {
    flex-direction: row-reverse;
  }
}
</style>