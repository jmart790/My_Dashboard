<script>
import { mapGetters } from "vuex";
import PageHeader from "@/components/base/PageHeader";

export default {
  name: 'Home',
  components: {
    PageHeader
  },
  computed: {
    ...mapGetters('location', ['cityState'])
  }
}
</script>
<template>
  <div class="home page">
    <PageHeader title="Dashboard" :subtitle="cityState" />
  </div>
</template>

<style lang="scss">
.home {
  &__search {
    position: relative;
    display: flex;
    align-items: center;
    width: 200px;
    padding: $gap-1 $gap-4;
    border-radius: 50px;
    background: $main-gradiant;
    box-shadow: $main-shadow;
    button {
      margin-right: $gap-4;
      background: $third-gradiant;
      border-radius: 100%;
      border: none;
      outline: none;
      height: 30px;
      width: 30px;
      span {
        color: #878A94;
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
