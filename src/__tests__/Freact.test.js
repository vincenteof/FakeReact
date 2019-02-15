import { createElement, Component } from '../Freact'
import { isClass } from '../util'

test('single child will appear in props', () => {
  const elem = createElement('div', {}, 'hello word')
  expect(elem.props.children).toBe('hello word')
})

test('children will appear in props as array', () => {
  const elem = createElement('div', {}, 'hello', 'world')
  expect(elem.props.children).toEqual(['hello', 'world'])
})

test('extending Component has effect', () => {
  class X extends Component {}
  expect(isClass(X)).toBe(true)
  const x = new X()
  expect(Boolean(x.isFreactComponent())).toBe(true)
})
