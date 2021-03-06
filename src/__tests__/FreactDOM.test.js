import { createElement, Component } from '../Freact'
import { render } from '../FreactDOM'

const e = createElement

describe('render', () => {
  const root = document.createElement('div')
  beforeAll(() => {
    test('has no children', () => {
      expect(root.hasChildNodes()).toEqual(false)
    })
  })

  function sayHi() {
    console.log('Hi')
  }
  class Button extends Component {
    render() {
      const clickHandler = this.props.onClick
      const text = this.props.children
      return e('button', { onclick: clickHandler }, text)
    }
  }

  const btnElem = e(Button, { onClick: sayHi }, 'click')
  render(btnElem, root)

  test('has created child node', () => {
    expect(root.hasChildNodes()).toEqual(true)
  })
})

// describe('render with keys', () => {})
