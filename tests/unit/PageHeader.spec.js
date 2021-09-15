import { shallowMount } from '@vue/test-utils'
import PageHeader from '@/components/base/PageHeader.vue'

describe('PageHeader.vue', () => {

  it('renders props.title when passed', () => {
    const title = 'New Title';
    const wrapper = shallowMount(PageHeader, {
      propsData: { title }
    });
    expect(wrapper.text()).toMatch(title);
  });

  it('renders props.subtitle when passed', () => {
    const title = 'New Title';
    const subtitle = 'New Sub Title';
    const wrapper = shallowMount(PageHeader, {
      propsData: { title, subtitle }
    });
    expect(wrapper.text()).toMatch(subtitle);
  });

})
