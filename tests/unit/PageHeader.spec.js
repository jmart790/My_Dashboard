import { shallowMount } from '@vue/test-utils';
import PageHeader from '@/components/base/PageHeader.vue';

describe('PageHeader.vue', () => {
  const title = 'New Title';
  const wrapper = shallowMount(PageHeader, {
    propsData: { title },
  });
  const input = wrapper.find('input');
  const button = wrapper.find('button');



  it('renders props.title when passed', () => {
    expect(wrapper.text()).toMatch(title);
  });

  it('renders props.subtitle when passed', () => {
    const subtitle = 'New Sub Title';
    const anotherWrapper = shallowMount(PageHeader, {
      propsData: { title, subtitle },
    });
    expect(anotherWrapper.text()).toMatch(subtitle);
  });

  it('sets the value', async () => {
    await input.setValue('33137');
    expect(input.element.value).toBe('33137');
  });

  it('zipcode submits', async () => {
    await input.setValue('33137');
    await button.trigger('click');
    // assert some action has been performed, like an emitted event.
    expect(wrapper.emitted()).toHaveProperty('submit')
  });
});
