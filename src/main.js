import { createApp } from 'vue';
import InlineSvg from 'vue-inline-svg';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/fonts.css';
import './assets/style.css';
import './assets/scss/main.scss';

createApp(App).use(router).use(store).component('InlineSvg', InlineSvg).mount('#app');
