import { createElement } from '../Freact'

test('chidren will appear in props', () => {
    const elem = createElement('div', {}, 'hello word')
    expect(elem.props.children).toBe('hello word')
})