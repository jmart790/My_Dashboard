import streetFood from '@/assets/illustrations/undraw_Street_food.svg?url';
import breakfast from '@/assets/illustrations/undraw_breakfast.svg?url';
import cooking from '@/assets/illustrations/undraw_cooking.svg?url';

// OpenStreetMap has no photos. Pick an illustration from the id so a place keeps
// the same art in the list and the Featured card, whatever the sort or filter.
const art = [streetFood, breakfast, cooking];

export function artFor(id) {
  let sum = 0;
  for (const char of id) sum += char.charCodeAt(0);
  return art[sum % art.length];
}
