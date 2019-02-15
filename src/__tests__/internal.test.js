import { instantiate, DOMComponent } from '../internal'
import { createElement, Component } from '../Freact'

describe('instantiate for text', () => {
  const text = instantiate('Hello World')
  test('equal to Hello World', () => {
    expect(text.text).toBe('Hello World')
  })
  const node = text.mount()
  test('node type is span', () => {
    expect(node.nodeName).toBe('#text')
  })
  test('innerText equal to Hello World', () => {
    expect(node.nodeValue).toBe('Hello World')
  })
})

describe('instantiate for DOMComponent', () => {
  // single button vdom
  let clickSideEffect = 'not clicked'
  function clickHandler() {
    clickSideEffect = 'clicked'
  }
  const btnElem = createElement(
    'button',
    { onclick: clickHandler },
    'click'
  )
  const btnInstance = instantiate(btnElem)
  const btnNode = btnInstance.mount()

  test('node type is button', () => {
    expect(btnNode.nodeName).toBe('BUTTON')
  })

  const e = document.createEvent('Event')
  e.initEvent('click', true, true)
  btnNode.dispatchEvent(e)
  test('click has some effects', () => {
    expect(clickSideEffect).toBe('clicked')
  })

  // div with button
  const divElem = createElement('div', {}, btnElem)
  const divInstance = instantiate(divElem)
  const divNode = divInstance.mount()

  test('node type is div', () => {
    expect(divNode.nodeName).toBe('DIV')
  })
  test('has child nodes', () => {
    expect(divNode.hasChildNodes()).toEqual(true)
  })
  test('has one button child node', () => {
    expect(divNode.childNodes.length).toEqual(1)
    expect(divNode.childNodes[0].nodeName).toEqual('BUTTON')
  })
})

describe('instantiate for CompositeComponent', () => {
  class Button extends Component {
    render() {
      const clickHandler = this.props.onClick
      return createElement('button', { onclick: clickHandler }, 'click')
    }
  }

  function clickHandler() {
    console.log('click')
  }

  const myBtnElem = createElement(Button, { onClick: clickHandler })
  const myBtnInstance = instantiate(myBtnElem)
  myBtnInstance.mount()
  const myButtonPublicInstance = myBtnInstance.getPublicInstance()
  test('should be a Component', () => {
    expect(Boolean(myButtonPublicInstance.isFreactComponent())).toBe(true)
    expect(myButtonPublicInstance instanceof Button).toBe(true)
  })

  const myBtnRenderedComponent = myBtnInstance.renderedComponent
  test('should be a DOM implementation', () => {
    expect(myBtnRenderedComponent instanceof DOMComponent).toBe(true)
  })
})
