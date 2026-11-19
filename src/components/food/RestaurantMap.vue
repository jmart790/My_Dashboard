<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RestaurantPopup from "@/components/food/RestaurantPopup.vue";

const store = useStore();
const el = ref(null);

const restaurants = computed(() => store.getters["restaurants/filteredRestaurants"]);
const featured = computed(() => store.getters["restaurants/featured"]);
const hoveredId = computed(() => store.getters["restaurants/hoveredId"]);
const center = computed(() => store.getters["location/coordinates"]);
// Only a device location is "where you are"; a searched zip is just an area.
const userPosition = computed(() => {
  if (store.getters["location/source"] !== "gps") return null;
  const { lat, lon } = store.getters["location/location"];
  return lat === "" || lon === "" ? null : [lat, lon];
});
// the pick can be hidden by filters; then there's no pin to anchor the popup to
const visibleFeatured = computed(() =>
  restaurants.value.find((r) => r.id === featured.value?.id) || null
);

// Theme colors ($salmon-lt, $salmon, $dark); circle markers need no image assets
const PIN = { fill: "#ff9c93", featured: "#ff6f61", stroke: "#22262D" };

// The popup's DOM node: Leaflet positions it, Vue teleports RestaurantPopup into it.
const popupEl = document.createElement("div");

// Plain variables, not refs: Leaflet objects must stay out of Vue's reactive proxies
let map = null;
let pins = null;
let popup = null;
let resizeObserver = null;
let userMarker = null;
const markers = new Map(); // restaurant id -> circleMarker, for restyling on hover

// Featured: big + salmon. Hovered in the list: salmon at normal size (no popup).
function pinStyle(id) {
  const isFeatured = id === featured.value?.id;
  const isHovered = id === hoveredId.value;
  return {
    radius: isFeatured ? 11 : 7,
    color: PIN.stroke,
    weight: 2,
    fillColor: isFeatured || isHovered ? PIN.featured : PIN.fill,
    fillOpacity: isFeatured || isHovered ? 1 : 0.8
  };
}

function restylePins() {
  markers.forEach((pin, id) => pin.setStyle(pinStyle(id)));
  markers.get(hoveredId.value)?.bringToFront();
  markers.get(featured.value?.id)?.bringToFront(); // the pick always stays on top
}

function openPopup() {
  const r = visibleFeatured.value;
  if (!r) return popup.close();
  popup.setLatLng([r.lat, r.lon]);
  if (!map.hasLayer(popup)) popup.openOn(map);
  else popup.update();
}

function drawPins() {
  pins.clearLayers();
  markers.clear();
  restaurants.value.forEach((r) => {
    const pin = L.circleMarker([r.lat, r.lon], pinStyle(r.id))
      .bindTooltip(r.name)
      .on("click", () => {
        // re-clicking the current pick only reopens its popup (the store won't change)
        if (r.id === featured.value?.id) openPopup();
        else store.dispatch("restaurants/selectRestaurant", r.id);
      })
      .addTo(pins);
    markers.set(r.id, pin);
  });
  restylePins();
}

// Blue (not salmon) so it never reads as a restaurant. A divIcon is plain HTML,
// so the pulse is CSS and there are no image assets to bundle.
function drawUser() {
  userMarker?.remove();
  userMarker = null;
  if (!userPosition.value) return;
  userMarker = L.marker(userPosition.value, {
    icon: L.divIcon({
      className: "user-location",
      html: '<span class="user-location__pulse"></span><span class="user-location__dot"></span>',
      iconSize: [22, 22]
    }),
    keyboard: false,
    alt: "Your location",
    zIndexOffset: -1000 // under the featured pin's popup and tooltips
  })
    .bindTooltip("You are here", { direction: "top", offset: [0, -10] })
    .addTo(map);
}

function fitToPins() {
  // include you, so every restaurant is shown relative to where you are
  const points = restaurants.value.map((r) => [r.lat, r.lon]);
  if (userPosition.value) points.push(userPosition.value);
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
  drawUser();
  popup = L.popup({
    className: "restaurant-popup",
    maxWidth: 300,
    minWidth: 300,
    offset: [0, -8],
    // [x, y]: 64px from the top keeps the popup clear of the Shuffle button
    autoPanPaddingTopLeft: [16, 64],
    autoPanPaddingBottomRight: [16, 16]
  }).setContent(popupEl);
  drawPins();
  fitToPins();
  openPopup();
  // On large screens the map's height follows the window, and Leaflet doesn't
  // notice container resizes by itself (gray tiles, drifting popup).
  resizeObserver = new ResizeObserver(() => {
    map.invalidateSize({ pan: false });
    if (map.hasLayer(popup)) popup.update(); // re-runs auto-pan so it stays in view
  });
  resizeObserver.observe(el.value);
});

watch(restaurants, () => {
  drawPins();
  fitToPins();
  openPopup();
  // On large screens the map's height follows the window, and Leaflet doesn't
  // notice container resizes by itself (gray tiles, drifting popup).
  resizeObserver = new ResizeObserver(() => {
    map.invalidateSize({ pan: false });
    if (map.hasLayer(popup)) popup.update(); // re-runs auto-pan so it stays in view
  });
  resizeObserver.observe(el.value);
});

// post flush: open the popup after Vue has rendered the new restaurant into it,
// so Leaflet measures the right size and auto-pans it fully into view
watch(hoveredId, () => restylePins());

watch(userPosition, () => {
  drawUser();
  fitToPins();
});

watch(
  featured,
  () => {
    restylePins();
    openPopup();
    // On phones the list sits below the map: picking from it would open the popup
    // off-screen, so bring the map back into view when it's mostly scrolled away.
    const { top, bottom } = el.value.getBoundingClientRect();
    if (bottom < 120 || top > window.innerHeight - 120) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.value.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    }
  },
  { flush: "post" }
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  map?.stop(); // cancel an in-flight auto-pan before tearing down
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
    <button
      type="button"
      class="restaurant-map__shuffle"
      aria-label="Pick a random restaurant"
      :disabled="!restaurants.length"
      @click="store.dispatch('restaurants/shuffleFeatured')"
    >
      <span class="icon-actions-linear-refresh" aria-hidden="true" />
      Shuffle
    </button>
    <Teleport :to="popupEl">
      <RestaurantPopup
        v-if="visibleFeatured"
        :restaurant="visibleFeatured"
        @resize="popup && popup.update()"
      />
    </Teleport>
  </div>
</template>

<style lang="scss">
.restaurant-map {
  position: relative;
  display: flex;
  &__shuffle {
    position: absolute;
    top: $gap-6;
    right: $gap-6;
    z-index: 1000; // above Leaflet panes and controls
    display: inline-flex;
    align-items: center;
    gap: $gap-2;
    padding: $gap-2 $gap-4;
    border: 0;
    border-radius: 999px;
    background: $salmon;
    color: $white;
    box-shadow: $secondary-shadow;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    span {
      color: inherit;
    }
    &:hover {
      background: $salmon-dk;
    }
    &:focus-visible {
      outline: none;
      box-shadow: $focus-shadow;
    }
    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }
  padding: $gap-2 !important;
  &__canvas {
    flex: 1;
    width: 100%;
    min-height: 60vh;
    border-radius: $round-2 - $gap-2;
    background: $grey-8;
    @media screen and (min-width: $laptop) {
      min-height: 0; // fills the viewport-tall grid row instead
    }
  }
  .user-location {
    position: relative;
    &__dot,
    &__pulse {
      position: absolute;
      inset: 0;
      border-radius: 50%;
    }
    &__dot {
      inset: 3px;
      background: $royal-lt;
      border: 3px solid $white;
      box-shadow: 0 0 0 1px rgba($dark, 0.4), 0 2px 6px rgba($dark, 0.5);
    }
    &__pulse {
      background: rgba($royal-lt, 0.35);
      animation: user-location-pulse 2s ease-out infinite;
    }
  }
  // Dark tiles to match the app; markers, popups and attribution stay untouched
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
  .restaurant-popup {
    .leaflet-popup-content-wrapper {
      padding: 0;
      border-radius: $round-1;
      background: $grey-8;
      color: $grey-2;
      box-shadow: $main-shadow;
      overflow: hidden;
    }
    .leaflet-popup-content {
      width: 300px !important;
      margin: 0;
      line-height: 1.4;
    }
    .leaflet-popup-tip {
      background: $grey-8;
    }
    .leaflet-popup-close-button {
      z-index: 1;
      top: $gap-2;
      right: $gap-2;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba($dark, 0.7);
      color: $white;
      font-size: 20px;
      line-height: 26px;
      &:hover {
        color: $salmon-lt;
      }
    }
  }
}

@keyframes user-location-pulse {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(2.6);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .user-location__pulse {
    animation: none;
    transform: scale(1.6);
  }
}
</style>
