<template>
  <div id="app">
    <AppLayout>
      <router-view v-slot="{ Component, route }">
        <transition :name="inked ? 'ink' : 'none'" mode="out-in" @after-leave="toTop">
          <component :is="Component" :key="route.name" />
        </transition>
      </router-view>
    </AppLayout>
  </div>
</template>

<script>
import AppLayout from "@/components/AppLayout.vue";

export default {
  components: { AppLayout },
  data() {
    // the first page just appears; the ink fade is for moving between sections
    return { inked: false };
  },
  mounted() {
    this.$router.isReady().then(() => setTimeout(() => (this.inked = true)));
  },
  methods: {
    // the new section starts at the top of the column
    toTop() {
      const main = document.querySelector("main");
      if (main) main.scrollTop = 0;
    }
  }
};
</script>

<style lang="scss">

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
ul {
   list-style: none;
}
a {
  text-decoration: none;
}

// Changing sections: the old page's ink soaks away into the paper, then the new
// page's ink comes up, spreading a little and settling into sharp type.
.ink-leave-active {
  transition: opacity 0.22s ease-in, filter 0.22s ease-in;
}
.ink-leave-to {
  opacity: 0;
  filter: blur(3px);
}
.ink-enter-active {
  transition: opacity 0.32s ease-out, filter 0.32s ease-out;
}
.ink-enter-from {
  opacity: 0;
  filter: blur(4px);
}
@media (prefers-reduced-motion: reduce) {
  .ink-leave-active,
  .ink-enter-active {
    transition: none;
  }
}
</style>
