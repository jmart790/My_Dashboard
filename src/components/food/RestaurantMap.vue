<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const store = useStore();
const el = ref(null);

const restaurants = computed(() => store.getters["restaurants/filteredRestaurants"]);
const featured = computed(() => store.getters["restaurants/featured"]);
const center = computed(() => store.getters["location/coordinates"]);

// Theme colors ($salmon-lt, $salmon, $dark); circle markers need no image assets
const PIN = { fill: "#ff9c93", featured: "#ff6f61", stroke: "#22262D" };

// Plain variables, not refs: Leaflet objects must stay out of Vue's reactive proxies
let map = null;
let pins = null;

function drawPins() {
  pins.clearLayers();
  let featuredPin = null;
  restaurants.value.forEach((r) => {
    const isFeatured = r.id === featured.value?.id;
    const pin = L.circleMarker([r.lat, r.lon], {
      radius: isFeatured ? 11 : 7,
      color: PIN.stroke,
      weight: 2,
      fillColor: isFeatured ? PIN.featured : PIN.fill,
      fillOpacity: isFeatured ? 1 : 0.8
    })
      .bindTooltip(r.name)
      .on("click", () => store.dispatch("restaurants/selectRestaurant", r.id))
      .addTo(pins);
    if (isFeatured) featuredPin = pin;
  });
  featuredPin?.bringToFront();
}

function fitToPins() {
  const points = restaurants.value.map((r) => [r.lat, r.lon]);
  // no zoom animation: Leaflet finishes it on a timer that throws if the map was
  // unmounted mid-animation (a new zip search swaps the map for the skeleton)
  if (points.length) map.fitBounds(points, { padding: [32, 32], maxZoom: 16, animate: false });
  else map.setView([center.value.lat, center.value.lon], 14, { animate: false });
}

onMounted(() => {
  map = L.map(el.value, { scrollWheelZoom: false });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  pins = L.layerGroup().addTo(map);
  drawPins();
  fitToPins();
});

watch(restaurants, () => {
  drawPins();
  fitToPins();
});

watch(featured, (r) => {
  drawPins();
  if (r) map.panTo([r.lat, r.lon]);
});

onBeforeUnmount(() => {
  map?.stop(); // cancel an in-flight panTo before tearing down
  map?.remove();
});
</script>

<template>
  <div class="restaurant-map card">
    <div
      ref="el"
      class="restaurant-map__canvas"
      role="region"
      aria-label="Map of nearby restaurants"
    />
  </div>
</template>

<style lang="scss">
.restaurant-map {
  padding: $gap-2 !important;
  &__canvas {
    width: 100%;
    height: 100%;
    min-height: 320px;
    border-radius: $round-2 - $gap-2;
    background: $grey-8;
  }
  // Dark tiles to match the app; markers, tooltips and attribution stay untouched
  .leaflet-tile-pane {
    filter: invert(1) hue-rotate(180deg) brightness(0.85) contrast(0.9);
  }
  .leaflet-control-attribution {
    background: rgba($dark, 0.8);
    color: $grey-3;
    a {
      color: $salmon-lt;
    }
  }
}
</style>
