<script>
import { mapGetters, mapActions } from 'vuex';
import PageHeader from '@/components/base/PageHeader';

export default {
  name: "NewsPage",
  components: {
    PageHeader
  },
   async mounted() {
    if (this.location) {
      await this.getLocalNews(this.location.name);
    }
  },
  computed: {
    ...mapGetters('location', ["location", "cityState"]),
    ...mapGetters('news', ["news"]),
  },
  methods: {
    ...mapActions('news', ["getLocalNews", "getStateNews", "getTopNewsHeadlines"]),
  }

}
</script>

<template>
  <div class="news">
    <PageHeader 
      class="news__header"
      title="News" 
      :subtitle="cityState" 
    />
  </div>
</template>


<style lang="scss">

</style>