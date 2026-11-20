<script>
import { mapGetters } from "vuex";
import PageHeader from "@/components/base/PageHeader.vue";

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
    <PageHeader title="The Front Page" :subtitle="cityState" />
  </div>
</template>

