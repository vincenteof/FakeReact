import { createElement } from '../Freact'

test('single child will appear in props', () => {
    const elem = createElement('div', {}, 'hello word')
    expect(elem.props.children).toBe('hello word')
})

test('children will appear in props as children', () => {
    const elem = createElement('div', {}, 'hello', 'world')
    expect(elem.props.children).toEqual(['hello', 'world'])
})