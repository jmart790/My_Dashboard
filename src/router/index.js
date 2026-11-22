import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/media', name: 'Media', component: () => import('../views/MediaPage.vue') },
  { path: '/news', name: 'News', component: () => import('../views/NewsPage.vue') },
  { path: '/weather', name: 'Weather', component: () => import('../views/WeatherPage.vue') },
  { path: '/food', name: 'Food', component: () => import('../views/FoodPage.vue') },
  { path: '/puzzles', name: 'Puzzles', component: () => import('../views/PuzzlesPage.vue') },
];

export default createRouter({ history: createWebHashHistory(), routes });
