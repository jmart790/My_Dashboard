import axios from 'axios';

// OpenStreetMap almost never has restaurant photos (1 in ~120 sampled), so the popup
// shows a representative dish for the cuisine from TheMealDB (free, keyless), captioned
// "Example dish" so it never passes as the restaurant's own food.
// Keys are OSM cuisine values as apiClient normalizes them (lowercase, "_" -> " ").
// Values are exact TheMealDB meal names, each checked to return a photo; the first
// search hit is often odd ("Cassava pizza"), so we pick the dish by name.
const DISH = {
  pizza: 'Pizza Express Margherita',
  burger: 'Aussie Burgers',
  american: 'Aussie Burgers',
  sushi: 'Sushi',
  japanese: 'Sushi',
  ramen: 'Ramen Noodles with Boiled Egg',
  mexican: 'Crock Pot Chicken Baked Tacos',
  'tex-mex': 'Chicken Enchilada Casserole',
  italian: 'Lasagne',
  chinese: 'Kung Pao Chicken',
  indian: 'Lamb Biryani',
  thai: 'Pad Thai',
  vietnamese: 'Beef pho',
  asian: 'Singapore Noodles with Shrimp',
  noodle: 'Singapore Noodles with Shrimp',
  french: 'Ratatouille',
  greek: 'Moussaka',
  mediterranean: 'Falafel',
  'middle eastern': 'Shawarma',
  lebanese: 'Hummus',
  turkish: 'Adana kebab',
  kebab: 'Adana kebab',
  spanish: 'Paella',
  seafood: 'Escovitch Fish',
  'steak house': 'Steak Diane',
  sandwich: 'Cuban Sandwich',
  cuban: 'Cuban Sandwich',
  breakfast: 'Pancakes',
  chicken: 'Kentucky Fried Chicken',
  caribbean: 'jerk', // full name contains "&", which breaks TheMealDB search
  jamaican: 'jerk',
  venezuelan: 'Arepa',
  colombian: 'Arepa',
  argentinian: 'Empanadas',
  'latin american': 'Empanadas',
};

const cache = new Map(); // dish name -> Promise<photo|null>

function fetchDish(dish) {
  return axios
    .get('https://www.themealdb.com/api/json/v1/1/search.php', { params: { s: dish } })
    .then(({ data }) => {
      const meals = data.meals || [];
      const meal = meals.find((m) => m.strMeal.toLowerCase() === dish.toLowerCase()) || meals[0];
      return meal ? { url: `${meal.strMealThumb}/medium`, caption: `Example dish: ${meal.strMeal}` } : null;
    });
}

/**
 * @param {{ cuisine?: string, image?: string }} restaurant
 * @returns {Promise<{ url: string, caption: string|null } | null>} caption is null for the restaurant's own photo
 */
export function photoFor({ cuisine = '', image } = {}) {
  if (image) return Promise.resolve({ url: image, caption: null });
  const dish = DISH[cuisine.toLowerCase()];
  if (!dish) return Promise.resolve(null);
  if (!cache.has(dish)) {
    cache.set(
      dish,
      fetchDish(dish).catch(() => {
        cache.delete(dish); // don't cache failures; the next popup retries
        return null;
      })
    );
  }
  return cache.get(dish);
}
