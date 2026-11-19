import axios from 'axios';
import { dishPhotoFor } from '@/dishPhotos';

vi.mock('axios');

const meal = (strMeal, file) => ({ strMeal, strMealThumb: `https://www.themealdb.com/images/media/meals/${file}.jpg` });

// dishPhotoFor caches per dish for the whole module, so each test uses a different cuisine.
describe('dishPhotoFor', () => {
  afterEach(() => vi.resetAllMocks());

  it('fetches the mapped dish, prefers the exact name, and caches it', async () => {
    axios.get.mockResolvedValue({
      data: { meals: [meal('Cassava pizza', 'a'), meal('Pizza Express Margherita', 'b')] },
    });
    const first = await dishPhotoFor('pizza');
    expect(first).toEqual({
      url: 'https://www.themealdb.com/images/media/meals/b.jpg/medium',
      caption: 'Example dish: Pizza Express Margherita',
    });
    expect(axios.get).toHaveBeenCalledWith('https://www.themealdb.com/api/json/v1/1/search.php', {
      params: { s: 'Pizza Express Margherita' },
    });
    await dishPhotoFor('pizza');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('matches cuisines case-insensitively', async () => {
    axios.get.mockResolvedValue({ data: { meals: [meal('Sushi', 's')] } });
    expect((await dishPhotoFor('Japanese')).caption).toBe('Example dish: Sushi');
  });

  it('returns null for cuisines with no mapped dish, without fetching', async () => {
    expect(await dishPhotoFor('restaurant')).toBeNull();
    expect(await dishPhotoFor('korean')).toBeNull();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('returns null when the API has no meals or fails, and retries later', async () => {
    axios.get.mockRejectedValueOnce(new Error('down'));
    expect(await dishPhotoFor('thai')).toBeNull();
    axios.get.mockResolvedValueOnce({ data: { meals: [meal('Pad Thai', 'p')] } });
    expect((await dishPhotoFor('thai')).caption).toBe('Example dish: Pad Thai');
    axios.get.mockResolvedValueOnce({ data: { meals: null } });
    expect(await dishPhotoFor('indian')).toBeNull();
  });
});
