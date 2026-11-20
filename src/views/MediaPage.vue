<script>
import { mapGetters } from "vuex";
import PageHeader from "@/components/base/PageHeader.vue";

export default {
  name: "MediaPage",
  components: { PageHeader },
  computed: {
    ...mapGetters("location", ["cityState"])
  }
};
</script>

<template>
  <div class="media-page">
    <PageHeader title="Arts &amp; Entertainment" :subtitle="cityState" />
    <p class="media-page__note">
      This section goes to press soon.
    </p>
  </div>
</template>

<style lang="scss">
.media-page__note {
  margin-top: $gap-8;
  padding-top: $gap-4;
  border-top: 1px solid $ink;
  font-family: $heading-font;
  font-style: italic;
  color: $ink-muted;
}
</style>
