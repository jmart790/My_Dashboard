import axios from 'axios';
import { photoFor } from '@/dishPhotos';

vi.mock('axios');

const meal = (strMeal, file) => ({ strMeal, strMealThumb: `https://www.themealdb.com/images/media/meals/${file}.jpg` });

// photoFor caches per dish for the whole module, so each test uses a different cuisine.
describe('photoFor', () => {
  afterEach(() => vi.resetAllMocks());

  it("uses the restaurant's own OSM photo without fetching", async () => {
    const photo = await photoFor({ cuisine: 'pizza', image: 'https://example.com/front.jpg' });
    expect(photo).toEqual({ url: 'https://example.com/front.jpg', caption: null });
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('fetches the mapped dish, prefers the exact name, and caches it', async () => {
    axios.get.mockResolvedValue({
      data: { meals: [meal('Cassava pizza', 'a'), meal('Pizza Express Margherita', 'b')] },
    });
    const first = await photoFor({ cuisine: 'pizza' });
    expect(first).toEqual({
      url: 'https://www.themealdb.com/images/media/meals/b.jpg/medium',
      caption: 'Example dish: Pizza Express Margherita',
    });
    expect(axios.get).toHaveBeenCalledWith('https://www.themealdb.com/api/json/v1/1/search.php', {
      params: { s: 'Pizza Express Margherita' },
    });
    await photoFor({ cuisine: 'pizza' });
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('matches cuisines case-insensitively', async () => {
    axios.get.mockResolvedValue({ data: { meals: [meal('Sushi', 's')] } });
    expect((await photoFor({ cuisine: 'Japanese' })).caption).toBe('Example dish: Sushi');
  });

  it('returns null for cuisines with no mapped dish, without fetching', async () => {
    expect(await photoFor({ cuisine: 'restaurant' })).toBeNull();
    expect(await photoFor({ cuisine: 'korean' })).toBeNull();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('returns null when the API has no meals or fails, and retries later', async () => {
    axios.get.mockRejectedValueOnce(new Error('down'));
    expect(await photoFor({ cuisine: 'thai' })).toBeNull();
    axios.get.mockResolvedValueOnce({ data: { meals: [meal('Pad Thai', 'p')] } });
    expect((await photoFor({ cuisine: 'thai' })).caption).toBe('Example dish: Pad Thai');
    axios.get.mockResolvedValueOnce({ data: { meals: null } });
    expect(await photoFor({ cuisine: 'indian' })).toBeNull();
  });
});
