import { ReactElement, InternalComponent, instantiateComponent } from './FakeReact'

class DOMComponent {
  currentElement: ReactElement
  renderedChildren?: InternalComponent[]
  node?: HTMLElement

  constructor(element: ReactElement) {
    this.currentElement = element
  }

  getPublicInstance(): HTMLElement | undefined {
    return this.node
  }

  mount(): HTMLElement {
    const type = this.currentElement.type
    const props = this.currentElement.props

    if (typeof type !== 'string') {
      throw new Error('type of `DOMComponent` should be `string`')
    }

    let children: ReactElement[] = props.children || {}
    if (!Array.isArray(children)) {
      children = [children]
    }

    const node = document.createElement(type)
    this.node = node

    Object.keys(props).forEach(key => {
      if (key !== 'children') {
        node.setAttribute(key, props[key])
      }
    })

    const renderedChildren = children.map(instantiateComponent)
    this.renderedChildren = renderedChildren

    const childNodes = renderedChildren.map(child => child.mount())
    childNodes.forEach(childNode => node.appendChild(childNode))

    return node
  }
}

export {
  DOMComponent
}