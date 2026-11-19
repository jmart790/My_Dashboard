import axios from 'axios';
import { dishPhotoFor } from '@/dishPhotos';
import { photoFor, PHOTO_CACHE_KEY } from '@/restaurantPhotos';

vi.mock('axios');
vi.mock('@/dishPhotos', () => ({ dishPhotoFor: vi.fn() }));

const DISH = { url: 'https://mealdb/pizza.jpg/medium', caption: 'Example dish: Pizza' };
const place = (overrides = {}) => ({
  id: `node/${Math.random()}`,
  cuisine: 'pizza',
  website: 'https://pizza.example/',
  image: null,
  ...overrides,
});
const cached = () => JSON.parse(localStorage.getItem(PHOTO_CACHE_KEY) || '{}');

describe('photoFor', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it("prefers the restaurant's own OSM photo, with no requests", async () => {
    const r = place({ image: 'https://osm.example/front.jpg' });
    expect(await photoFor(r)).toEqual({ url: 'https://osm.example/front.jpg', caption: null, source: 'osm' });
    expect(axios.get).not.toHaveBeenCalled();
    expect(dishPhotoFor).not.toHaveBeenCalled();
  });

  it("uses the website's share image next", async () => {
    axios.get.mockResolvedValue({ data: { image: 'https://pizza.example/hero.jpg' } });
    expect(await photoFor(place())).toEqual({ url: 'https://pizza.example/hero.jpg', caption: null, source: 'website' });
    expect(axios.get).toHaveBeenCalledWith('/api/og-image', { params: { url: 'https://pizza.example/', v: 2 } });
    expect(dishPhotoFor).not.toHaveBeenCalled();
  });

  it('falls back to a dish photo when the website has no image or the endpoint is missing', async () => {
    dishPhotoFor.mockResolvedValue(DISH);
    axios.get.mockResolvedValueOnce({ data: { image: null } });
    expect(await photoFor(place())).toEqual({ ...DISH, source: 'dish' });
    axios.get.mockRejectedValueOnce(new Error('404')); // static build: no /api
    expect(await photoFor(place())).toEqual({ ...DISH, source: 'dish' });
  });

  it('skips the website lookup for places without one', async () => {
    dishPhotoFor.mockResolvedValue(DISH);
    expect((await photoFor(place({ website: null }))).source).toBe('dish');
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('returns null when nothing has a photo (the illustration takes over)', async () => {
    dishPhotoFor.mockResolvedValue(null);
    expect(await photoFor(place({ website: null, cuisine: 'restaurant' }))).toBeNull();
  });

  it('caches per restaurant in localStorage, so repeat views make no requests', async () => {
    const r = place();
    axios.get.mockResolvedValue({ data: { image: 'https://pizza.example/hero.jpg' } });
    await photoFor(r);
    expect(cached()[r.id].photo.url).toBe('https://pizza.example/hero.jpg');
    axios.get.mockClear();
    expect((await photoFor(r)).url).toBe('https://pizza.example/hero.jpg');
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('shares one lookup between the list and the popup asking at the same time', async () => {
    const r = place();
    axios.get.mockResolvedValue({ data: { image: 'https://pizza.example/hero.jpg' } });
    await Promise.all([photoFor(r), photoFor(r)]);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('refetches after the cache entry expires', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const r = place();
    axios.get.mockResolvedValue({ data: { image: 'https://pizza.example/hero.jpg' } });
    await photoFor(r);
    vi.setSystemTime(Date.now() + 8 * 24 * 60 * 60 * 1000);
    await photoFor(r);
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('skips a source whose image failed to load, and remembers that', async () => {
    const r = place();
    axios.get.mockResolvedValue({ data: { image: 'https://pizza.example/broken.jpg' } });
    dishPhotoFor.mockResolvedValue(DISH);
    await photoFor(r);
    expect((await photoFor(r, { skip: ['website'] })).source).toBe('dish');
    expect((await photoFor(r)).source).toBe('dish'); // cached: the broken one isn't retried
  });

  it('keeps working when storage is unavailable', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    axios.get.mockResolvedValue({ data: { image: 'https://pizza.example/hero.jpg' } });
    expect((await photoFor(place())).source).toBe('website');
    setItem.mockRestore();
  });
});
