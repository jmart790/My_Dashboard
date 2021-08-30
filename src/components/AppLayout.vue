<script>
import { mapActions } from "vuex";
export default {
  name: "AppLayout",
  async created() {
    await this.getLocation('33137')
  },
  methods: {
    ...mapActions('location', ["getLocation"]),
  }
}
</script>

<template>
  <div class="app-layout">
    <nav>
      <router-link class="nav-logo" :to="{ name: 'Home'}">
        <span class="icon-reddit" />
      </router-link>
      <router-link class="nav-link" :to="{ name: 'Home'}" exact>
        <span class="icon-house" />
      </router-link>
      <router-link class="nav-link" :to="{ name: 'Weather'}">
        <span class="icon-weather-app" />
      </router-link>
      <router-link class="nav-link" :to="{ name: 'News'}">
        <span class="icon-news" />
      </router-link>
      <router-link class="nav-link" :to="{ name: 'Media'}">
        <span class="icon-tv-app" />
      </router-link>
    </nav>
    <main>
      <slot />
    </main>
  </div>
</template>


<style lang="scss">
.app-layout {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  background: $app-bg;
  flex-direction: column-reverse;
  @media screen and (min-width: $tablet) {
    flex-direction: unset;
  }

  nav {
    position: absolute;
    z-index: 5;
    width: 100%;
    display: flex;
    justify-content: space-around;
    gap: $gap-4;
    border-top: 1px solid rgba(128, 128, 128, 0.13);
    box-shadow: 0 -10px 20px rgba(0, 0, 0, 0.5);
    background-color: rgba($app-bg, 0.45);  
    backdrop-filter: blur(5px);
    @media screen and (min-width: $tablet) {
      position: unset;
      flex-direction: column;  
      justify-content: unset;
      width: 100px;
      border-top: unset;
      box-shadow: unset;
      background-color: unset;  
      backdrop-filter: unset;
    } 
    @media screen and (min-width: $laptop-lg) {
      width: 150px;
    }
    .nav-logo {
      display: none;
      margin-bottom: $gap-6;
      padding: $gap-4;
      justify-content: center;
      align-items: center;
      span {
        font-size: 36px;
        color: $primary;
        background: -webkit-linear-gradient(#6C0902, #F5582F);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

      }
      @media screen and (min-width: $tablet) {
        display: flex;
      }
    }
    .nav-link {
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      span {
        position: relative;
        display: block;
        padding: $gap-3;
        border-radius: 15px;
        color: #9598A1;
        font-size: 24px;
        transition: all .3s ease-out;
      }
      &:hover span{
        color: $primary;
        @media screen and (min-width: $tablet) {
          background: $nav-btn-gradiant;
        }
      }
    }
    .nav-link.router-link-active, 
    .nav-link.router-link-exact-path-active {
      @media screen and (min-width: $tablet) { 
        border-left: 2px solid $primary;
      }
      span {
        color: $primary;
        @media screen and (min-width: $tablet) {
          background: $nav-btn-gradiant;
        }
      }
    }

  }
  main {
    position: relative;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: $gap-4 $gap-5;
    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
      display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    & {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
    @media screen and (min-width: $tablet) { 
      padding: $gap-6 $gap-5;
    }
    @media screen and (min-width: $laptop-lg) { 
      max-width: 1500px;
      margin: 0 auto;
    }
  }
}
</style>