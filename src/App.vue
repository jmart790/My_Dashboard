<template>
  <div id="app">
    <Home />
  </div>
</template>

<script>
import Home from "@/views/Home";

export default {
  components: { Home }  
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
</style>
