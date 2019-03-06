# FakeReact

Build a React-like virtual dom framework from scratch using javascript.
Core of this implementation is [stack reconciler](https://reactjs.org/docs/codebase-overview.html#stack-reconciler).

## simple usage

You should first include `dist/freact.js` in your html page.

```javascript
function sayHi() {
  console.log('Hi!!!')
}
const e = Freact.createElement
class Button extends Freact.Component {
  constructor() {
    super()
  }
  render() {
    const clickHandler = this.props.onClick
    const text = this.props.children
    return e('button', { onclick: clickHandler }, text)
  }
}
window.onload = function() {
  const root = document.getElementById('root')
  const hiButton = e(
    Button,
    { onClick: sayHi, key: '0' },
    Freact.createTextElement('sayHi', '0')
  )
  const unmountButton = e(
    Button,
    {
      onClick: function() {
        Freact.unmountComponentAtNode(root)
      },
      key: '1'
    },
    Freact.createTextElement('unmount')
  )
  function rerender() {
    const fuckBtn = e(
      Button,
      { key: '4', onClick: thirdRender },
      Freact.createTextElement('fuck', '0')
    )
    const div = e(
      'div',
      {},
      unmountButton,
      Freact.createNullElement('3'),
      hiButton,
      fuckBtn
    )
    Freact.render(div, root)
  }
  function thirdRender() {
    const div = e(
      'div',
      {},
      Freact.createTextElement('wow', '4'),
      hiButton
    )
    Freact.render(div, root)
  }
  const rerenderButton = e(
    Button,
    { onClick: rerender, key: '3' },
    Freact.createTextElement('rerender')
  )
  const buttons = e(
    'div',
    {},
    hiButton,
    unmountButton,
    Freact.createNullElement('2'),
    rerenderButton
  )
  Freact.render(buttons, root)
}
```
