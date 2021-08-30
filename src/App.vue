<template>
  <div id="app">
    <AppLayout>
      <router-view/>
    </AppLayout>
  </div>
</template>

<script>
import AppLayout from "@/components/AppLayout";

export default {
  components: { AppLayout }  
}
</script>

<style lang="scss">
@import "./assets/style.css";

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
</style>
