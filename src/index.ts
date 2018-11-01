import { mountTree, ReactComponent, ReactElement } from './FakeReact'

const rootE1 = document.getElementById('root')

class Button extends ReactComponent {
  render(): ReactElement {
    return {
      type: 'button',
      props: []
    }
  }
}

function App() {
  return {
    type: 'div',
    props: {
      children: [
        {type: Button},
        {type: Button}
      ]
    }
  }
}

const app = {type: App}

if (!rootE1) {
  throw new Error('`getElementById` failed')
}

const instance = mountTree(app, rootE1)
console.log('instance is: ', instance)