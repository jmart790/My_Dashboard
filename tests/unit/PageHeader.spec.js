import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import PageHeader from '@/components/base/PageHeader.vue';

const mountHeader = (props = {}) => {
  const getLocation = vi.fn();
  const store = createStore({ modules: { location: { namespaced: true, actions: { getLocation } } } });
  const wrapper = shallowMount(PageHeader, {
    props: { title: 'New Title', ...props },
    global: { plugins: [store] },
  });
  return { wrapper, getLocation };
};

describe('PageHeader.vue', () => {
  it('renders props.title when passed', () => {
    expect(mountHeader().wrapper.text()).toMatch('New Title');
  });

  it('renders props.subtitle when passed', () => {
    expect(mountHeader({ subtitle: 'New Sub Title' }).wrapper.text()).toMatch('New Sub Title');
  });

  it('sets the value', async () => {
    const input = mountHeader().wrapper.find('input');
    await input.setValue('33137');
    expect(input.element.value).toBe('33137');
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
});
