import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import PageHeader from '@/components/base/PageHeader.vue';

const mountHeader = ({ props = {}, zip = '' } = {}) => {
  const getLocation = vi.fn();
  const store = createStore({
    modules: {
      location: {
        namespaced: true,
        state: () => ({ zip }),
        mutations: { SET_ZIP: (state, value) => (state.zip = value) },
        getters: {
          currentZip: (state) => state.zip,
          locating: () => false,
          geoError: () => null,
          source: () => 'zip',
        },
        actions: { getLocation, locateMe: vi.fn() },
      },
    },
  });
  const wrapper = shallowMount(PageHeader, {
    props: { title: 'New Title', ...props },
    global: { plugins: [store] },
    attachTo: document.body, // so focus() and document.activeElement work
  });
  return { wrapper, getLocation, store };
};

describe('PageHeader.vue', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders props.title when passed', () => {
    expect(mountHeader().wrapper.text()).toMatch('New Title');
  });

  it('renders props.subtitle when passed', () => {
    expect(mountHeader({ props: { subtitle: 'New Sub Title' } }).wrapper.text()).toMatch('New Sub Title');
  });

  it('dispatches getLocation on valid zipcode submit', async () => {
    const { wrapper, getLocation } = mountHeader();
    await wrapper.find('input').setValue('33137');
    await wrapper.find('form').trigger('submit');
    expect(getLocation).toHaveBeenCalledWith(expect.anything(), '33137');
  });

  it('shows error and skips dispatch on invalid zipcode', async () => {
    const { wrapper, getLocation } = mountHeader();
    await wrapper.find('input').setValue('12a');
    await wrapper.find('form').trigger('submit');
    expect(getLocation).not.toHaveBeenCalled();
    expect(wrapper.find('form').classes()).toContain('page-header__search--error');
  });

  it('shows the current zip in the search bar', () => {
    const { wrapper } = mountHeader({ zip: '80202' });
    expect(wrapper.find('input').element.value).toBe('80202');
  });

  it('keeps the zip in the bar after searching', async () => {
    const { wrapper } = mountHeader();
    await wrapper.find('input').setValue('33137');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('input').element.value).toBe('33137');
  });

  it('follows the current zip when it changes elsewhere (e.g. device location)', async () => {
    const { wrapper, store } = mountHeader({ zip: '33137' });
    store.commit('location/SET_ZIP', '86023');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('input').element.value).toBe('86023');
  });

  it('the clear button empties the bar and keeps focus in it', async () => {
    const { wrapper } = mountHeader({ zip: '33137' });
    const clear = wrapper.find('.page-header__clear');
    expect(clear.exists()).toBe(true);
    expect(clear.attributes('aria-label')).toBe('Clear zip code');
    await clear.trigger('click');
    expect(wrapper.find('input').element.value).toBe('');
    expect(document.activeElement).toBe(wrapper.find('input').element);
    expect(wrapper.find('.page-header__clear').exists()).toBe(false); // nothing left to clear
  });

  it('restores the current zip when the bar is left empty', async () => {
    const { wrapper } = mountHeader({ zip: '33137' });
    await wrapper.find('input').setValue('');
    await wrapper.find('input').trigger('blur');
    expect(wrapper.find('input').element.value).toBe('33137');
    expect(wrapper.find('form').classes()).not.toContain('page-header__search--error');
  });
});
